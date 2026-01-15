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
import {IAlbum, IImage} from "../models/album";
import {corsHandler, mapWithConcurrency} from "../utils";

// Common function configuration for image uploads
const IMAGE_UPLOAD_CONFIG = {
  memory: "2GiB" as const,
  timeoutSeconds: 600,
  maxInstances: 20,
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

const normalizeImages = (images?: Partial<IImage>[]) =>
  (images || [])
    .filter((img) => img?.name?.trim())
    .map((img) => ({name: img.name!.trim()}));

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

      try {
        const body = request.body as CreateAlbumPayload;

        if (!body?.name?.trim() || !body.images?.length) {
          response.status(400).send("Dados incompletos ou inválidos!");
          return;
        }

        const newAlbum: Omit<IAlbum, "id"> = {
          name: body.name.trim(),
          eventDate: body.eventDate?.trim(),
          images: normalizeImages(body.images),
          creationDate: admin.firestore.FieldValue.serverTimestamp(),
        };

        await firestore.collection(DatabaseTableKeys.Albums).add(newAlbum);

        console.log(`Álbum criado com sucesso: ${body.name}`);
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

      try {
        const body = request.body as UpdateAlbumPayload;

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

            if (body.images?.length) {
              updatedAlbum.images = [
                ...(album.images || []),
                ...normalizeImages(body.images),
              ];
            }

            transaction.update(albumRef, updatedAlbum);
          }
        );

        console.log(`Álbum atualizado com sucesso: ${body.id}`);
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
              const previewImages = (album.images || [])
                .filter((img) => img.name)
                .slice(0, 1);

              const images = await mapWithConcurrency(
                previewImages,
                SIGNED_URL_CONCURRENCY,
                async (img) => {
                  if (!img.name) {
                    return {...img, url: undefined};
                  }

                  try {
                    const destination =
                      `${DatabaseTableKeys.Images}/${img.name}`;
                    const url = await getSignedUrlCached(destination);
                    return {...img, url};
                  } catch (error) {
                    console.error(
                      `Erro ao obter URL da imagem ${img.name}:`,
                      error
                    );
                    return {...img, url: undefined};
                  }
                }
              );

              return {...album, id: doc.id, images};
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
        const albumImages = (album.images || []).filter((img) => img.name);
        const limitParam = request.query.limit as string | undefined;
        const cursorParam = request.query.cursor as string | undefined;
        const limit = limitParam ? Number(limitParam) : undefined;
        const safeLimit =
          typeof limit === "number" && Number.isFinite(limit) && limit > 0 ?
            Math.min(limit, 200) :
            undefined;

        const startIndex = cursorParam ?
          Math.max(
            albumImages.findIndex((img) => img.name === cursorParam) + 1,
            0
          ) :
          0;
        const pageImages =
          safeLimit === undefined ?
            albumImages :
            albumImages.slice(startIndex, startIndex + safeLimit);
        const hasNextPage =
          safeLimit !== undefined &&
          startIndex + safeLimit < albumImages.length;
        const nextCursor =
          hasNextPage && pageImages.length ?
            pageImages[pageImages.length - 1].name :
            undefined;

        // Get image URLs
        const images = await mapWithConcurrency(
          pageImages,
          SIGNED_URL_CONCURRENCY,
          async (img) => {
            if (!img.name) {
              return {...img, url: undefined};
            }

            try {
              const destination = `${DatabaseTableKeys.Images}/${img.name}`;
              const url = await getSignedUrlCached(destination);

              return {...img, url};
            } catch (error) {
              console.error(`Erro ao obter URL da imagem ${img.name}:`, error);
              return {...img, url: undefined};
            }
          }
        );

        response
          .status(200)
          .json({id: docSnap.id, ...album, images, nextCursor});
      } catch (error) {
        console.error("Erro ao buscar álbum:", error);
        response.status(500).send("Erro ao buscar álbum.");
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

      try {
        const body = request.body as DeleteImgFromAlbumPayload;

        if (!body?.albumId || !body.images?.length) {
          response
            .status(400)
            .send("ID do álbum ou imagens não foram fornecidos!");
          return;
        }

        const {albumId, images} = body;
        const imageNamesToDelete = new Set(images.map((img) => img.name));

        const albumRef = firestore
          .collection(DatabaseTableKeys.Albums)
          .doc(albumId);

        const albumSnap = await albumRef.get();

        if (!albumSnap.exists) {
          response.status(404).send("Álbum não encontrado!");
          return;
        }

        const album = albumSnap.data() as IAlbum;

        // Filter out images to be deleted
        const remainingImages = album.images.filter(
          (img) => img.name && !imageNamesToDelete.has(img.name)
        );

        // Update album with remaining images
        await albumRef.update({images: remainingImages});

        // Delete images from storage
        const paths = images
          .filter((img) => img.name)
          .map((img) => `${DatabaseTableKeys.Images}/${img.name!}`);
        await deleteImageStorage(paths);

        console.log(
          `Imagens removidas do álbum ${albumId}: ${images.length} imagem(ns)`
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

        const album = albumSnap.data() as IAlbum;

        // Delete all images from storage if they exist
        if (album.images?.length > 0) {
          const paths = album.images
            .filter((img) => img.name)
            .map((img) => `${DatabaseTableKeys.Images}/${img.name!}`);
          await deleteImageStorage(paths);
        }

        // Delete album document
        await albumRef.delete();

        console.log(`Álbum deletado com sucesso: ${id}`);
        response.status(200).send();
      } catch (error) {
        console.error("Erro ao deletar álbum:", error);
        response.status(500).send("Houve um erro ao deletar o álbum.");
      }
    });
  }
);
