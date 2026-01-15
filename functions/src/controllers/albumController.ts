import * as admin from "firebase-admin";
import { onRequest } from "firebase-functions/v2/https";
import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import { DatabaseTableKeys } from "../enums/app";
import { firestore, storage } from "../firebaseAdmin";
import { deleteImageStorage, generateUniqueFileName } from "../helpers/common";
import {
  CreateAlbumPayload,
  DeleteImgFromAlbumPayload,
  UpdateAlbumPayload,
  UploadCommonRequest,
} from "../models";
import { IAlbum } from "../models/album";
import { corsHandler, processHeicToJpeg } from "../utils";

// Common function configuration for image uploads
const IMAGE_UPLOAD_CONFIG = {
  memory: "2GiB" as const,
  timeoutSeconds: 600,
  maxInstances: 20,
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

      const { file, fileName, mimeType } = request.body as UploadCommonRequest;

      if (!file || !fileName) {
        response.status(400).send("Dados incompletos!");
        return;
      }

      let tempFilePath: string | null = null;
      let convertedFilePath: string | null = null;

      try {
        // Generate unique filename if file already exists
        const uniqueFileName = await generateUniqueFileName(
          DatabaseTableKeys.Images,
          fileName
        );
        const destination = `${DatabaseTableKeys.Images}/${uniqueFileName}`;

        // Decode base64 file
        const base64Data = file.split(";base64,").pop();
        if (!base64Data) {
          response.status(400).send("Formato de arquivo inválido!");
          return;
        }

        tempFilePath = path.join(os.tmpdir(), uniqueFileName);
        const fileExtension = path.extname(fileName).toLowerCase();
        const isHeic = mimeType?.toLowerCase() === "image/heic";

        // Save temporary file
        fs.writeFileSync(tempFilePath, Buffer.from(base64Data, "base64"));

        let finalPath = tempFilePath;
        let contentType = `image/${fileExtension.slice(1)}`.toLowerCase();

        // Convert HEIC to JPEG if needed
        if (isHeic) {
          convertedFilePath = path.join(
            os.tmpdir(),
            `${path.parse(uniqueFileName).name}.jpeg`
          );
          finalPath = await processHeicToJpeg(tempFilePath, convertedFilePath);
          contentType = "image/jpeg";
        }

        // Upload to Firebase Storage
        await storage.bucket().upload(finalPath, {
          destination,
          metadata: { contentType },
        });

        // Get signed URL
        const fileRef = storage.bucket().file(destination);
        const [url] = await fileRef.getSignedUrl({
          action: "read",
          expires: Date.now() + 15 * 60 * 1000, // 15 minutes
        });

        console.log(`Imagem enviada com sucesso: ${uniqueFileName} -> ${url}`);

        response.status(200).send({ url, fileName: uniqueFileName });
      } catch (error) {
        console.error("Erro ao processar o arquivo:", error);
        response.status(500).send("Erro ao processar o arquivo.");
      } finally {
        // Clean up temporary files
        const filesToClean = [tempFilePath, convertedFilePath].filter(
          Boolean
        ) as string[];
        filesToClean.forEach((filePath) => {
          try {
            if (fs.existsSync(filePath)) {
              fs.unlinkSync(filePath);
            }
          } catch (cleanupError) {
            console.error(
              `Erro ao limpar arquivo temporário ${filePath}:`,
              cleanupError
            );
          }
        });
      }
    });
  }
);

/**
 * Creates a new album
 */
export const createAlbum = onRequest(
  { maxInstances: 10 },
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
          images: body.images,
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
  { maxInstances: 10 },
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
              updatedDate: admin.firestore.FieldValue.serverTimestamp(),
            };

            if (body.images?.length) {
              updatedAlbum.images = [...album.images, ...body.images];
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

              // Get preview image (first 1)
              const previewImages = album.images
                .filter((img) => img.name)
                .slice(0, 1);
              const images = await Promise.all(
                previewImages.map(async (img) => {
                  if (!img.name) {
                    return { ...img, url: undefined };
                  }

                  try {
                    const destination = `${DatabaseTableKeys.Images}/${img.name}`;
                    const fileRef = storage.bucket().file(destination);

                    const [url] = await fileRef.getSignedUrl({
                      action: "read",
                      expires: Date.now() + 15 * 60 * 1000,
                    });

                    return { ...img, url };
                  } catch (error) {
                    console.error(
                      `Erro ao obter URL da imagem ${img.name}:`,
                      error
                    );
                    return { ...img, url: undefined };
                  }
                })
              );

              return { ...album, id: doc.id, images };
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

        // Get all image URLs
        const images = await Promise.all(
          album.images
            .filter((img) => img.name)
            .map(async (img) => {
              if (!img.name) {
                return { ...img, url: undefined };
              }

              try {
                const destination = `${DatabaseTableKeys.Images}/${img.name}`;
                const fileRef = storage.bucket().file(destination);

                const [url] = await fileRef.getSignedUrl({
                  action: "read",
                  expires: Date.now() + 15 * 60 * 1000,
                });

                return { ...img, url };
              } catch (error) {
                console.error(
                  `Erro ao obter URL da imagem ${img.name}:`,
                  error
                );
                return { ...img, url: undefined };
              }
            })
        );

        response.status(200).json({ id: docSnap.id, ...album, images });
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
  { maxInstances: 10 },
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

        const { albumId, images } = body;
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
        await albumRef.update({ images: remainingImages });

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
  { maxInstances: 10 },
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
