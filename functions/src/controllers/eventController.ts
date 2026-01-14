import { onRequest } from "firebase-functions/v2/https";
import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import { DatabaseTableKeys } from "../enums/app";
import { firestore, storage } from "../firebaseAdmin";
import { deleteImageStorage, generateUniqueFileName } from "../helpers/common";
import {
  CreateCommonPayload,
  DeleteCommonPayload,
  UploadCommonRequest,
} from "../models";
import { IEvent } from "../models/event";
import { corsHandler, processHeicToJpeg } from "../utils";

// Common function configuration for image uploads
const IMAGE_UPLOAD_CONFIG = {
  memory: "2GiB" as const,
  timeoutSeconds: 600,
  maxInstances: 20,
};

/**
 * Uploads an event image to Firebase Storage with automatic duplicate name handling
 */
export const uploadEvent = onRequest(
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
          DatabaseTableKeys.Events,
          fileName
        );
        const destination = `${DatabaseTableKeys.Events}/${uniqueFileName}`;

        // Decode base64 file
        const base64Data = file.split(";base64,").pop();
        if (!base64Data) {
          response.status(400).send("Formato de arquivo inválido!");
          return;
        }

        tempFilePath = path.join(os.tmpdir(), uniqueFileName);
        const fileExtension = path.extname(fileName).toLowerCase();
        const isHeic =
          mimeType?.toLowerCase() === "image/heic" || fileExtension === ".heic";

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

        console.log(`Evento enviado com sucesso: ${uniqueFileName} -> ${url}`);

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
 * Creates multiple events
 */
export const createEvents = onRequest(
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
        const body = request.body as CreateCommonPayload;

        if (!body?.images?.length) {
          response.status(400).send("Dados incompletos ou inválidos!");
          return;
        }

        const { images } = body;

        // Use batch write for better performance
        const batch = firestore.batch();
        const eventsRef = firestore.collection(DatabaseTableKeys.Events);

        images.forEach((img) => {
          const newEventRef = eventsRef.doc();
          batch.set(newEventRef, img);
        });

        await batch.commit();

        console.log(`${images.length} evento(s) criado(s) com sucesso!`);
        response.status(201).send();
      } catch (error) {
        console.error("Erro ao criar eventos:", error);
        response.status(500).send("Houve um erro ao tentar criar eventos.");
      }
    });
  }
);

/**
 * Retrieves all events with their image URLs
 */
export const getEvents = onRequest(
  { maxInstances: 10 },
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
          .collection(DatabaseTableKeys.Events)
          .get();

        if (querySnapshot.empty) {
          response.status(200).json([]);
          return;
        }

        const events = await Promise.all(
          querySnapshot.docs.map(async (doc) => {
            const event = doc.data() as IEvent;

            try {
              const destination = `${DatabaseTableKeys.Events}/${event.name}`;
              const fileRef = storage.bucket().file(destination);

              const [url] = await fileRef.getSignedUrl({
                action: "read",
                expires: Date.now() + 15 * 60 * 1000,
              });

              return { ...event, id: doc.id, url };
            } catch (error) {
              console.error(
                `Erro ao obter URL do evento ${event.name}:`,
                error
              );
              return { ...event, id: doc.id, url: undefined };
            }
          })
        );

        response.status(200).json(events);
      } catch (error) {
        console.error("Erro ao buscar eventos:", error);
        response.status(500).send("Houve um erro ao buscar eventos.");
      }
    });
  }
);

/**
 * Deletes multiple events and their associated images
 */
export const deleteEvents = onRequest(
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
        const body = request.body as DeleteCommonPayload;

        if (!body?.images?.length) {
          response
            .status(400)
            .send("Nenhuma imagem foi fornecida para exclusão!");
          return;
        }

        const { images } = body;

        // Delete Firestore documents using batch
        const batch = firestore.batch();
        const eventsToDelete = images.filter((img) => img.id);

        eventsToDelete.forEach((img) => {
          const eventRef = firestore
            .collection(DatabaseTableKeys.Events)
            .doc(img.id!);
          batch.delete(eventRef);
        });

        await batch.commit();

        // Delete images from storage
        const paths = images
          .filter((img) => img.name)
          .map((img) => `${DatabaseTableKeys.Events}/${img.name!}`);
        await deleteImageStorage(paths);

        console.log(`${images.length} evento(s) excluído(s) com sucesso!`);
        response.status(200).send();
      } catch (error) {
        console.error("Erro ao excluir eventos:", error);
        response.status(500).send("Houve um erro ao excluir os eventos.");
      }
    });
  }
);
