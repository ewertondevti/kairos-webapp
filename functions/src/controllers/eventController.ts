import {onRequest} from "firebase-functions/v2/https";
import {DatabaseTableKeys} from "../enums/app";
import {firestore, storage} from "../firebaseAdmin";
import {deleteImageStorage} from "../helpers/common";
import {handleMultipartUpload} from "../helpers/upload";
import {CreateCommonPayload, DeleteCommonPayload} from "../models";
import {IEvent} from "../models/event";
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

/**
 * Uploads an event image to Firebase Storage
 * with automatic duplicate name handling.
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

      try {
        const result = await handleMultipartUpload(
          request,
          DatabaseTableKeys.Events,
          {
            maxFileSizeBytes: MAX_FILE_SIZE_BYTES,
            cacheControl: CACHE_CONTROL,
            urlExpiresMs: SIGNED_URL_EXPIRATION_MS,
          }
        );

        console.log(`Evento enviado com sucesso: ${result.fileName}`);
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
 * Creates multiple events
 */
export const createEvents = onRequest(
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
        const body = request.body as CreateCommonPayload;

        if (!body?.images?.length) {
          response.status(400).send("Dados incompletos ou inválidos!");
          return;
        }

        const {images} = body;

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
  {maxInstances: 10},
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

        const events = await mapWithConcurrency(
          querySnapshot.docs,
          SIGNED_URL_CONCURRENCY,
          async (doc) => {
            const event = doc.data() as IEvent;

            try {
              const destination = `${DatabaseTableKeys.Events}/${event.name}`;
              const fileRef = storage.bucket().file(destination);

              const [url] = await fileRef.getSignedUrl({
                action: "read",
                expires: Date.now() + SIGNED_URL_EXPIRATION_MS,
              });

              return {...event, id: doc.id, url};
            } catch (error) {
              console.error(
                `Erro ao obter URL do evento ${event.name}:`,
                error
              );
              return {...event, id: doc.id, url: undefined};
            }
          }
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
        const body = request.body as DeleteCommonPayload;

        if (!body?.images?.length) {
          response
            .status(400)
            .send("Nenhuma imagem foi fornecida para exclusão!");
          return;
        }

        const {images} = body;

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
