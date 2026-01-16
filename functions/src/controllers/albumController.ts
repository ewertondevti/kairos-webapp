import * as admin from "firebase-admin";
import {onRequest} from "firebase-functions/v2/https";
import {DatabaseTableKeys} from "../enums/app";
import {firestore, storage} from "../firebaseAdmin";
import {deleteImageStorage} from "../helpers/common";
import {handleMultipartUpload} from "../helpers/upload";
import {
  CreateAlbumPayload,
  DeleteImgFromAlbumPayload,
  UpdateAlbumPayload,
} from "../models";
import {IAlbum, IAlbumImage} from "../models/album";
import {
  corsHandler,
  mapWithConcurrency,
  requireAuth,
  requireRoles,
  UserRole,
} from "../utils";
import { logAuditEvent } from "../utils/audit";

// Common function configuration for image uploads
const IMAGE_UPLOAD_CONFIG = {
  memory: "2GiB" as const,
  timeoutSeconds: 600,
  maxInstances: 20,
  invoker: "public",
};

const MAX_FILE_SIZE_BYTES = 15 * 1024 * 1024;
const SIGNED_URL_EXPIRATION_MS = 24 * 60 * 60 * 1000;
const SIGNED_URL_CONCURRENCY = 10;
const CACHE_CONTROL = "public, max-age=31536000, immutable";
const URL_CACHE_TTL_BUFFER_MS = 60 * 1000;

type SignedUrlCacheEntry = {
  url: string;
  expiresAt: number;
};

const signedUrlCache = new Map<string, SignedUrlCacheEntry>();

const ALBUM_IMAGES_COLLECTION = "images";

const buildStoragePath = (name: string) =>
  `${DatabaseTableKeys.Images}/${name}`;

const normalizeImages = (images?: Partial<IAlbumImage>[]) =>
  (images || [])
    .filter((img) => img?.name?.trim())
    .map((img) => {
      const name = img.name!.trim();
      const storagePath = img.storagePath?.trim() || buildStoragePath(name);
      return {name, storagePath};
    });

const encodeCursor = (createdAt: admin.firestore.Timestamp, name: string) =>
  Buffer.from(
    JSON.stringify({createdAt: createdAt.toMillis(), name})
  ).toString("base64");

const decodeCursor = (cursor?: string) => {
  if (!cursor) return null;
  try {
    const parsed = JSON.parse(
      Buffer.from(cursor, "base64").toString("utf8")
    ) as {createdAt: number; name: string};
    if (!parsed?.createdAt || !parsed?.name) return null;
    return {
      createdAt: admin.firestore.Timestamp.fromMillis(parsed.createdAt),
      name: parsed.name,
    };
  } catch {
    return null;
  }
};

const encodeAlbumCursor = (
  createdAt: admin.firestore.Timestamp,
  id: string
) =>
  Buffer.from(
    JSON.stringify({createdAt: createdAt.toMillis(), id})
  ).toString("base64");

const decodeAlbumCursor = (cursor?: string) => {
  if (!cursor) return null;
  try {
    const parsed = JSON.parse(
      Buffer.from(cursor, "base64").toString("utf8")
    ) as {createdAt: number; id: string};
    if (!parsed?.createdAt || !parsed?.id) return null;
    return {
      createdAt: admin.firestore.Timestamp.fromMillis(parsed.createdAt),
      id: parsed.id,
    };
  } catch {
    return null;
  }
};

const getSignedUrlCached = async (storagePath: string) => {
  const cached = signedUrlCache.get(storagePath);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.url;
  }

  const fileRef = storage.bucket().file(storagePath);
  const [url] = await fileRef.getSignedUrl({
    action: "read",
    expires: Date.now() + SIGNED_URL_EXPIRATION_MS,
  });

  signedUrlCache.set(storagePath, {
    url,
    expiresAt: Date.now() + SIGNED_URL_EXPIRATION_MS - URL_CACHE_TTL_BUFFER_MS,
  });

  return url;
};

/**
 * Uploads an image to Firebase Storage with automatic duplicate name handling
 */
export const uploadImage = onRequest(
  IMAGE_UPLOAD_CONFIG,
  async (request, response) => {
    corsHandler(request, response, async () => {
      if (request.method === "OPTIONS") {
        response.status(204).send();
        return;
      }

      if (request.method !== "POST") {
        response.set("Allow", "POST");
        response.status(405).send("Método não permitido. Use POST.");
        return;
      }

      const context = await requireAuth(request, response);
      if (
        !context ||
        !requireRoles(context, [UserRole.Admin, UserRole.Midia], response)
      ) {
        return;
      }

      try {
        const result = await handleMultipartUpload(
          request,
          DatabaseTableKeys.Images,
          {
            maxFileSizeBytes: MAX_FILE_SIZE_BYTES,
            cacheControl: CACHE_CONTROL,
            urlExpiresMs: SIGNED_URL_EXPIRATION_MS,
          }
        );

        console.log(`Imagem enviada com sucesso: ${result.fileName}`);
        response.status(200).send({url: result.url, fileName: result.fileName});
      } catch (error: any) {
        console.error("Erro ao processar o arquivo:", error);
        const status = error?.statusCode || 500;
        const message = error?.message || "Erro ao processar o arquivo.";
        response.status(status).send(message);
      }
    });
  }
);

/**
 * Creates a new album
 */
export const createAlbum = onRequest(
  {maxInstances: 10},
  async (request, response) => {
    corsHandler(request, response, async () => {
      if (request.method === "OPTIONS") {
        response.status(204).send();
        return;
      }

      if (request.method !== "POST") {
        response.set("Allow", "POST");
        response.status(405).send("Método não permitido. Use POST.");
        return;
      }

      const context = await requireAuth(request, response);
      if (
        !context ||
        !requireRoles(context, [UserRole.Admin, UserRole.Midia], response)
      ) {
        return;
      }

      try {
        const body = request.body as CreateAlbumPayload;
        const normalizedImages = normalizeImages(body?.images);

        if (!body?.name?.trim() || !normalizedImages.length) {
          response.status(400).send("Dados incompletos ou inválidos!");
          return;
        }

        const albumRef = firestore
          .collection(DatabaseTableKeys.Albums)
          .doc();
        const now = admin.firestore.Timestamp.now();
        const newAlbum: IAlbum = {
          name: body.name.trim(),
          eventDate: body.eventDate?.trim(),
          imagesCount: normalizedImages.length,
          coverImageName: normalizedImages[0]?.name,
          creationDate: admin.firestore.FieldValue.serverTimestamp(),
        };

        const batch = firestore.batch();
        batch.set(albumRef, newAlbum);

        normalizedImages.forEach((image) => {
          const imageRef = albumRef
            .collection(ALBUM_IMAGES_COLLECTION)
            .doc();
          batch.set(imageRef, {
            name: image.name,
            storagePath: image.storagePath,
            createdAt: now,
          });
        });

        await batch.commit();

        console.log(`Álbum criado com sucesso: ${body.name}`);
        void logAuditEvent(
          {
            action: "album.create",
            targetType: "album",
            targetId: albumRef.id,
            metadata: { name: newAlbum.name, images: newAlbum.imagesCount },
          },
          context
        );
        response.status(201).send();
      } catch (error) {
        console.error("Erro ao criar álbum:", error);
        response.status(500).send("Houve um erro ao tentar criar o álbum.");
      }
    });
  }
);

/**
 * Updates an existing album
 */
export const updateAlbum = onRequest(
  {maxInstances: 10},
  async (request, response) => {
    corsHandler(request, response, async () => {
      if (request.method === "OPTIONS") {
        response.status(204).send();
        return;
      }

      if (request.method !== "POST") {
        response.set("Allow", "POST");
        response.status(405).send("Método não permitido. Use POST.");
        return;
      }

      const context = await requireAuth(request, response);
      if (
        !context ||
        !requireRoles(context, [UserRole.Admin, UserRole.Midia], response)
      ) {
        return;
      }

      try {
        const body = request.body as UpdateAlbumPayload;
        const normalizedImages = normalizeImages(body?.images);

        if (!body?.id || !body.name?.trim()) {
          response.status(400).send("Dados incompletos ou inválidos!");
          return;
        }

        const albumRef = firestore
          .collection(DatabaseTableKeys.Albums)
          .doc(body.id);

        await firestore.runTransaction(
          async (transaction: admin.firestore.Transaction) => {
            const albumSnap = await transaction.get(albumRef);

            if (!albumSnap.exists) {
              throw new Error("Álbum não encontrado");
            }

            const album = albumSnap.data() as IAlbum;

            const updatedAlbum: Partial<IAlbum> = {
              name: body.name.trim(),
              eventDate: body.eventDate?.trim(),
              updatedDate: admin.firestore.FieldValue.serverTimestamp(),
            };

            if (normalizedImages.length) {
              const now = admin.firestore.Timestamp.now();
              normalizedImages.forEach((image) => {
                const imageRef = albumRef
                  .collection(ALBUM_IMAGES_COLLECTION)
                  .doc();
                transaction.set(imageRef, {
                  name: image.name,
                  storagePath: image.storagePath,
                  createdAt: now,
                });
              });

              const currentCount = album.imagesCount || 0;
              updatedAlbum.imagesCount = currentCount + normalizedImages.length;
              if (!album.coverImageName) {
                updatedAlbum.coverImageName = normalizedImages[0]?.name;
              }
            }

            transaction.update(albumRef, updatedAlbum);
          }
        );

        console.log(`Álbum atualizado com sucesso: ${body.id}`);
        void logAuditEvent(
          {
            action: "album.update",
            targetType: "album",
            targetId: body.id,
            metadata: {
              name: body.name?.trim(),
              hasNewImages: Boolean(body.images?.length),
            },
          },
          context
        );
        response.status(200).send("Álbum atualizado com sucesso.");
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Erro desconhecido";
        console.error("Erro ao atualizar álbum:", errorMessage);

        if (errorMessage === "Álbum não encontrado") {
          response.status(404).send(errorMessage);
        } else {
          response
            .status(500)
            .send("Houve um erro ao tentar atualizar o álbum.");
        }
      }
    });
  }
);

/**
 * Retrieves all albums with preview images (first 3 images)
 */
export const getAlbums = onRequest(
  IMAGE_UPLOAD_CONFIG,
  async (request, response) => {
    corsHandler(request, response, async () => {
      if (request.method === "OPTIONS") {
        response.status(204).send();
        return;
      }

      if (request.method !== "GET") {
        response.set("Allow", "GET");
        response.status(405).send("Método não permitido. Use GET.");
        return;
      }

      try {
        const querySnapshot = await firestore
          .collection(DatabaseTableKeys.Albums)
          .get();

        if (querySnapshot.empty) {
          response.status(200).json([]);
          return;
        }

        const albums = await Promise.all(
          querySnapshot.docs.map(
            async (doc: admin.firestore.QueryDocumentSnapshot) => {
              const album = doc.data() as IAlbum;
              let coverUrl: string | undefined;
              if (album.coverImageName) {
                try {
                  const destination = buildStoragePath(album.coverImageName);
                  coverUrl = await getSignedUrlCached(destination);
                } catch (error) {
                  console.error(
                    `Erro ao obter URL da capa ${album.coverImageName}:`,
                    error
                  );
                }
              }

              return {
                ...album,
                id: doc.id,
                imagesCount: album.imagesCount || 0,
                coverUrl,
              };
            }
          )
        );

        // Sort by creation date (newest first)
        const sortedAlbums = albums.sort(
          (a: IAlbum & { id: string }, b: IAlbum & { id: string }) => {
            const dateA =
              (a.creationDate as admin.firestore.Timestamp)?.toMillis() || 0;
            const dateB =
              (b.creationDate as admin.firestore.Timestamp)?.toMillis() || 0;
            return dateB - dateA;
          }
        );

        response.status(200).json(sortedAlbums);
      } catch (error) {
        console.error("Erro ao buscar álbuns:", error);
        response.status(500).send("Erro ao buscar álbuns.");
      }
    });
  }
);

/**
 * Retrieves paginated albums with cover images
 */
export const getAlbumsPaged = onRequest(
  IMAGE_UPLOAD_CONFIG,
  async (request, response) => {
    corsHandler(request, response, async () => {
      if (request.method === "OPTIONS") {
        response.status(204).send();
        return;
      }

      if (request.method !== "GET") {
        response.set("Allow", "GET");
        response.status(405).send("Método não permitido. Use GET.");
        return;
      }

      try {
        const limitParam = request.query.limit as string | undefined;
        const cursorParam = request.query.cursor as string | undefined;
        const limit = limitParam ? Number(limitParam) : undefined;
        const safeLimit =
          typeof limit === "number" && Number.isFinite(limit) && limit > 0 ?
            Math.min(limit, 200) :
            24;
        const decodedCursor = decodeAlbumCursor(cursorParam);

        let albumsQuery = firestore
          .collection(DatabaseTableKeys.Albums)
          .orderBy("creationDate", "desc")
          .orderBy(admin.firestore.FieldPath.documentId(), "desc");

        if (decodedCursor) {
          albumsQuery = albumsQuery.startAfter(
            decodedCursor.createdAt,
            decodedCursor.id
          );
        }

        albumsQuery = albumsQuery.limit(safeLimit);

        const querySnapshot = await albumsQuery.get();

        if (querySnapshot.empty) {
          response.status(200).json({ albums: [] });
          return;
        }

        const albums = await Promise.all(
          querySnapshot.docs.map(
            async (doc: admin.firestore.QueryDocumentSnapshot) => {
              const album = doc.data() as IAlbum;
              let coverUrl: string | undefined;
              if (album.coverImageName) {
                try {
                  const destination = buildStoragePath(album.coverImageName);
                  coverUrl = await getSignedUrlCached(destination);
                } catch (error) {
                  console.error(
                    `Erro ao obter URL da capa ${album.coverImageName}:`,
                    error
                  );
                }
              }

              return {
                ...album,
                id: doc.id,
                imagesCount: album.imagesCount || 0,
                coverUrl,
              };
            }
          )
        );

        const lastDoc = querySnapshot.docs[querySnapshot.docs.length - 1];
        const lastCreationDate =
          lastDoc?.get("creationDate") as admin.firestore.Timestamp | undefined;
        const nextCursor =
          lastCreationDate ?
            encodeAlbumCursor(lastCreationDate, lastDoc.id) :
            undefined;

        response.status(200).json({ albums, nextCursor });
      } catch (error) {
        console.error("Erro ao buscar álbuns paginados:", error);
        response.status(500).send("Erro ao buscar álbuns.");
      }
    });
  }
);

/**
 * Retrieves a specific album by ID with all images
 */
export const getAlbumById = onRequest(
  IMAGE_UPLOAD_CONFIG,
  async (request, response) => {
    corsHandler(request, response, async () => {
      if (request.method === "OPTIONS") {
        response.status(204).send();
        return;
      }

      if (request.method !== "GET") {
        response.set("Allow", "GET");
        response.status(405).send("Método não permitido. Use GET.");
        return;
      }

      try {
        const id = request.query.id as string;

        if (!id?.trim()) {
          response.status(400).send("ID do álbum não foi fornecido!");
          return;
        }

        const docSnap = await firestore
          .collection(DatabaseTableKeys.Albums)
          .doc(id.trim())
          .get();

        if (!docSnap.exists) {
          response.status(404).send("Álbum não encontrado!");
          return;
        }

        const album = docSnap.data() as IAlbum;
        const limitParam = request.query.limit as string | undefined;
        const cursorParam = request.query.cursor as string | undefined;
        const limit = limitParam ? Number(limitParam) : undefined;
        const safeLimit =
          typeof limit === "number" && Number.isFinite(limit) && limit > 0 ?
            Math.min(limit, 200) :
            undefined;
        const decodedCursor = decodeCursor(cursorParam);
        let imagesQuery = firestore
          .collection(DatabaseTableKeys.Albums)
          .doc(id.trim())
          .collection(ALBUM_IMAGES_COLLECTION)
          .orderBy("createdAt", "asc")
          .orderBy("name", "asc");

        if (decodedCursor) {
          imagesQuery = imagesQuery.startAfter(
            decodedCursor.createdAt,
            decodedCursor.name
          );
        }

        if (safeLimit !== undefined) {
          imagesQuery = imagesQuery.limit(safeLimit);
        }

        const imagesSnap = await imagesQuery.get();
        const imageDocs = imagesSnap.docs;

        const images = await mapWithConcurrency(
          imageDocs,
          SIGNED_URL_CONCURRENCY,
          async (doc) => {
            const image = doc.data() as IAlbumImage;
            if (!image?.storagePath) {
              return {
                id: doc.id,
                name: image?.name,
                storagePath: image?.storagePath,
                url: undefined,
              };
            }

            try {
              const url = await getSignedUrlCached(image.storagePath);
              return {
                id: doc.id,
                name: image.name,
                storagePath: image.storagePath,
                url,
              };
            } catch (error) {
              console.error(
                `Erro ao obter URL da imagem ${image.name}:`,
                error
              );
              return {
                id: doc.id,
                name: image.name,
                storagePath: image.storagePath,
                url: undefined,
              };
            }
          }
        );

        const lastDoc = imageDocs[imageDocs.length - 1];
        const lastData = lastDoc?.data() as IAlbumImage | undefined;
        const nextCursor =
          safeLimit !== undefined &&
          imageDocs.length === safeLimit &&
          lastData?.createdAt &&
          lastData?.name ?
            encodeCursor(
              lastData.createdAt as admin.firestore.Timestamp,
              lastData.name
            ) :
            undefined;

        response
          .status(200)
          .json({
            id: docSnap.id,
            ...album,
            imagesCount: album.imagesCount || 0,
            images,
            nextCursor,
          });
      } catch (error) {
        console.error("Erro ao buscar álbum:", error);
        response.status(500).send("Erro ao buscar álbum.");
      }
    });
  }
);

/**
 * Retrieves paginated images across all albums (media portal)
 */
export const getAlbumImages = onRequest(
  IMAGE_UPLOAD_CONFIG,
  async (request, response) => {
    corsHandler(request, response, async () => {
      if (request.method === "OPTIONS") {
        response.status(204).send();
        return;
      }

      if (request.method !== "GET") {
        response.set("Allow", "GET");
        response.status(405).send("Método não permitido. Use GET.");
        return;
      }

      try {
        const limitParam = request.query.limit as string | undefined;
        const cursorParam = request.query.cursor as string | undefined;
        const limit = limitParam ? Number(limitParam) : undefined;
        const safeLimit =
          typeof limit === "number" && Number.isFinite(limit) && limit > 0 ?
            Math.min(limit, 200) :
            48;
        const decodedCursor = decodeCursor(cursorParam);

        let imagesQuery = firestore
          .collectionGroup(ALBUM_IMAGES_COLLECTION)
          .orderBy("createdAt", "desc")
          .orderBy("name", "desc");

        if (decodedCursor) {
          imagesQuery = imagesQuery.startAfter(
            decodedCursor.createdAt,
            decodedCursor.name
          );
        }

        imagesQuery = imagesQuery.limit(safeLimit);

        const imagesSnap = await imagesQuery.get();
        const imageDocs = imagesSnap.docs;

        const albumRefs = Array.from(
          new Set(
            imageDocs
              .map((doc) => doc.ref.parent.parent)
              .filter(Boolean)
          )
        ) as admin.firestore.DocumentReference[];

        const albumSnaps = albumRefs.length ?
          await firestore.getAll(...albumRefs) :
          [];
        const albumMap = new Map(
          albumSnaps.map((snap) => [
            snap.id,
            snap.data() as IAlbum | undefined,
          ])
        );

        const images = await mapWithConcurrency(
          imageDocs,
          SIGNED_URL_CONCURRENCY,
          async (doc) => {
            const image = doc.data() as IAlbumImage;
            const albumId = doc.ref.parent.parent?.id;
            const album = albumId ? albumMap.get(albumId) : undefined;

            let url: string | undefined;
            if (image?.storagePath) {
              try {
                url = await getSignedUrlCached(image.storagePath);
              } catch (error) {
                console.error(
                  `Erro ao obter URL da imagem ${image.name}:`,
                  error
                );
              }
            }

            return {
              id: doc.id,
              name: image?.name,
              storagePath: image?.storagePath,
              url,
              albumId,
              albumName: album?.name,
              eventDate: album?.eventDate,
            };
          }
        );

        const lastDoc = imageDocs[imageDocs.length - 1];
        const lastData = lastDoc?.data() as IAlbumImage | undefined;
        const nextCursor =
          imageDocs.length === safeLimit &&
          lastData?.createdAt &&
          lastData?.name ?
            encodeCursor(
              lastData.createdAt as admin.firestore.Timestamp,
              lastData.name
            ) :
            undefined;

        response.status(200).json({images, nextCursor});
      } catch (error) {
        console.error("Erro ao buscar imagens dos álbuns:", error);
        response.status(500).send("Erro ao buscar imagens.");
      }
    });
  }
);

/**
 * Deletes images from an album
 */
export const deleteImageFromAlbum = onRequest(
  {maxInstances: 10},
  async (request, response) => {
    corsHandler(request, response, async () => {
      if (request.method === "OPTIONS") {
        response.status(204).send();
        return;
      }

      if (request.method !== "POST") {
        response.set("Allow", "POST");
        response.status(405).send("Método não permitido. Use POST.");
        return;
      }

      const context = await requireAuth(request, response);
      if (
        !context ||
        !requireRoles(context, [UserRole.Admin, UserRole.Midia], response)
      ) {
        return;
      }

      try {
        const body = request.body as DeleteImgFromAlbumPayload;

        if (!body?.albumId || !body.images?.length) {
          response
            .status(400)
            .send("ID do álbum ou imagens não foram fornecidos!");
          return;
        }

        const {albumId, images} = body;
        const albumRef = firestore
          .collection(DatabaseTableKeys.Albums)
          .doc(albumId);

        const albumSnap = await albumRef.get();

        if (!albumSnap.exists) {
          response.status(404).send("Álbum não encontrado!");
          return;
        }

        const album = albumSnap.data() as IAlbum;

        const imageItems = (images || [])
          .map((image) => {
            const name = image?.name?.trim();
            const storagePath =
              image?.storagePath?.trim() ||
              (name ? buildStoragePath(name) : "");
            return {
              id: image?.id,
              name,
              storagePath,
            };
          })
          .filter((image) => image.storagePath);

        if (!imageItems.length) {
          response.status(400).send("Imagens inválidas para remoção!");
          return;
        }

        const imageRefs = new Map<string, admin.firestore.DocumentReference>();

        imageItems
          .filter((image) => image.id)
          .forEach((image) => {
            imageRefs.set(
              image.id!,
              albumRef.collection(ALBUM_IMAGES_COLLECTION).doc(image.id!)
            );
          });

        const storagePathsToResolve = imageItems
          .filter((image) => !image.id)
          .map((image) => image.storagePath);
        const chunkSize = 10;
        for (let i = 0; i < storagePathsToResolve.length; i += chunkSize) {
          const chunk = storagePathsToResolve.slice(i, i + chunkSize);
          const snap = await albumRef
            .collection(ALBUM_IMAGES_COLLECTION)
            .where("storagePath", "in", chunk)
            .get();
          snap.docs.forEach((doc) => {
            imageRefs.set(doc.id, doc.ref);
          });
        }

        const docsToDelete = Array.from(imageRefs.values());
        const storagePaths = Array.from(
          new Set(imageItems.map((image) => image.storagePath))
        );

        const deletedCount = docsToDelete.length;
        const newImagesCount = Math.max(
          0,
          (album.imagesCount || 0) - deletedCount
        );

        const coverStoragePath = album.coverImageName ?
          buildStoragePath(album.coverImageName) :
          undefined;
        const removingCover = imageItems.some(
          (image) =>
            (image.name && image.name === album.coverImageName) ||
            (coverStoragePath && image.storagePath === coverStoragePath)
        );

        const batch = firestore.batch();
        docsToDelete.forEach((docRef) => batch.delete(docRef));
        batch.update(albumRef, {
          imagesCount: newImagesCount,
          ...(removingCover ? {coverImageName: admin.firestore.FieldValue.delete()} : {}),
        });

        await batch.commit();
        await deleteImageStorage(storagePaths);

        if (removingCover && newImagesCount > 0) {
          const coverSnap = await albumRef
            .collection(ALBUM_IMAGES_COLLECTION)
            .orderBy("createdAt", "desc")
            .orderBy("name", "desc")
            .limit(1)
            .get();
          const coverDoc = coverSnap.docs[0];
          if (coverDoc) {
            const coverData = coverDoc.data() as IAlbumImage;
            await albumRef.update({
              coverImageName: coverData.name,
            });
          }
        }

        console.log(
          `Imagens removidas do álbum ${albumId}: ${deletedCount} imagem(ns)`
        );
        response.status(200).send();
      } catch (error) {
        console.error("Erro ao remover imagens:", error);
        response.status(500).send("Houve um erro ao remover imagens.");
      }
    });
  }
);

/**
 * Deletes an album and all its associated images
 */
export const deleteAlbum = onRequest(
  {maxInstances: 10},
  async (request, response) => {
    corsHandler(request, response, async () => {
      if (request.method === "OPTIONS") {
        response.status(204).send();
        return;
      }

      if (request.method !== "DELETE") {
        response.set("Allow", "DELETE");
        response.status(405).send("Método não permitido. Use DELETE.");
        return;
      }

      const context = await requireAuth(request, response);
      if (
        !context ||
        !requireRoles(context, [UserRole.Admin, UserRole.Midia], response)
      ) {
        return;
      }

      try {
        const id = request.query.id as string;

        if (!id?.trim()) {
          response.status(400).send("ID do álbum não foi fornecido!");
          return;
        }

        const albumRef = firestore
          .collection(DatabaseTableKeys.Albums)
          .doc(id.trim());
        const albumSnap = await albumRef.get();

        if (!albumSnap.exists) {
          response.status(404).send("Álbum não encontrado!");
          return;
        }

        const imagesSnap = await albumRef
          .collection(ALBUM_IMAGES_COLLECTION)
          .get();
        const storagePaths = imagesSnap.docs
          .map((doc) => (doc.data() as IAlbumImage)?.storagePath)
          .filter(Boolean) as string[];

        if (storagePaths.length) {
          await deleteImageStorage(storagePaths);
        }

        const batchSize = 500;
        for (let i = 0; i < imagesSnap.docs.length; i += batchSize) {
          const batch = firestore.batch();
          imagesSnap.docs.slice(i, i + batchSize).forEach((doc) => {
            batch.delete(doc.ref);
          });
          await batch.commit();
        }

        await albumRef.delete();

        console.log(`Álbum deletado com sucesso: ${id}`);
        void logAuditEvent(
          {
            action: "album.delete",
            targetType: "album",
            targetId: id,
          },
          context
        );
        response.status(200).send();
      } catch (error) {
        console.error("Erro ao deletar álbum:", error);
        response.status(500).send("Houve um erro ao deletar o álbum.");
      }
    });
  }
);

/**
 * Migrates legacy album images array to subcollection
 */
export const migrateAlbumImages = onRequest(
  {maxInstances: 1},
  async (request, response) => {
    corsHandler(request, response, async () => {
      if (request.method === "OPTIONS") {
        response.status(204).send();
        return;
      }

      if (request.method !== "POST") {
        response.set("Allow", "POST");
        response.status(405).send("Método não permitido. Use POST.");
        return;
      }

      const context = await requireAuth(request, response);
      if (!context || !requireRoles(context, [UserRole.Admin], response)) {
        return;
      }

      try {
        const albumsSnap = await firestore
          .collection(DatabaseTableKeys.Albums)
          .get();
        let migrated = 0;
        let updated = 0;

        for (const doc of albumsSnap.docs) {
          const data = doc.data() as IAlbum & {images?: Partial<IAlbumImage>[]};
          const legacyImages = normalizeImages(data.images as Partial<IAlbumImage>[]);

          if (legacyImages.length) {
            const now = admin.firestore.Timestamp.now();
            const batch = firestore.batch();
            legacyImages.forEach((image) => {
              const imageRef = doc.ref
                .collection(ALBUM_IMAGES_COLLECTION)
                .doc();
              batch.set(imageRef, {
                name: image.name,
                storagePath: image.storagePath,
                createdAt: now,
              });
            });
            batch.update(doc.ref, {
              imagesCount: legacyImages.length,
              coverImageName: legacyImages[0]?.name,
              images: admin.firestore.FieldValue.delete(),
            });
            await batch.commit();
            migrated += 1;
            continue;
          }

          if (data.imagesCount === undefined || (data as any).images) {
            await doc.ref.update({
              imagesCount: data.imagesCount ?? 0,
              images: admin.firestore.FieldValue.delete(),
            });
            updated += 1;
          }
        }

        response.status(200).send({migrated, updated});
      } catch (error) {
        console.error("Erro ao migrar imagens de álbuns:", error);
        response.status(500).send("Erro ao migrar imagens de álbuns.");
      }
    });
  }
);
