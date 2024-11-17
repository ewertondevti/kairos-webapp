import { onRequest } from "firebase-functions/https";
import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import * as sharp from "sharp";
import { DatabaseTableKeys } from "../enums/app";
import { firestore, storage } from "../firebaseAdmin";
import { deleteImageStorage } from "../helpers/common";
import {
  CreateCommonPayload,
  DeleteCommonPayload,
  UploadCommonRequest,
} from "../models";
import { corsHandler } from "../utils/corsHandler";

export const uploadEvent = onRequest((request, response) => {
  corsHandler(request, response, async () => {
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

    const destination = `${DatabaseTableKeys.Events}/${fileName}`;
    const storedFile = storage.bucket().file(destination);
    const isExists = await storedFile.exists();

    if (isExists[0]) {
      const url = await storedFile.getSignedUrl({
        action: "read",
        expires: "03-01-2500",
      });

      response.status(200).send({ url });
      return;
    }

    try {
      // Decodifica o arquivo base64
      const base64Data = file.split(";base64,").pop()!;
      const tempFilePath = path.join(os.tmpdir(), fileName);
      const convertedFilePath = path.join(
        os.tmpdir(),
        `${path.parse(fileName).name}.jpeg`
      );

      // Salva o arquivo temporariamente
      fs.writeFileSync(tempFilePath, Buffer.from(base64Data, "base64"));

      const type = `image/${fileName.split(".").pop()}`.toLowerCase();

      // Verifica se o arquivo é HEIC e realiza a conversão
      if ([mimeType, type].includes("image/heic")) {
        await sharp(tempFilePath).toFormat("jpeg").toFile(convertedFilePath);
        console.log(
          `Arquivo convertido de HEIC para JPEG: ${convertedFilePath}`
        );
      }

      // Define o caminho final para upload
      const finalPath = [mimeType, type].includes("image/heic")
        ? convertedFilePath
        : tempFilePath;

      // Faz o upload para o Firebase Storage
      await storage.bucket().upload(finalPath, {
        destination,
        metadata: {
          contentType: type === "image/heic" ? "image/jpeg" : type,
        },
      });

      // Obtém a URL pública do arquivo
      const fileRef = storage.bucket().file(destination);
      const [url] = await fileRef.getSignedUrl({
        action: "read",
        expires: "03-01-2500",
      });

      console.log("Arquivo enviado para:", url);

      // Responde com a URL do arquivo
      response.status(200).send({ url });
    } catch (error) {
      console.error("Erro ao processar o arquivo:", error);
      response.status(500).send("Erro ao processar o arquivo.");
    } finally {
      // Remove o arquivo temporário
      const tempFilePath = path.join(os.tmpdir(), fileName);
      if (fs.existsSync(tempFilePath)) {
        fs.unlinkSync(tempFilePath);
      }
    }
  });
});

export const createEvents = onRequest((request, response) => {
  corsHandler(request, response, async () => {
    if (request.method !== "POST") {
      response.set("Allow", "POST");
      response.status(405).send("Método não permitido. Use POST.");
      return;
    }

    try {
      const body = request.body as CreateCommonPayload;

      if (!body || !body.images?.length) {
        response.status(400).send("Dados incompletos ou inválidos!");
        return;
      }

      const { images } = body;

      const promises = images.map(async (img) => {
        await firestore.collection(DatabaseTableKeys.Events).add(img);
        console.log("Evento criado com sucesso!");
      });

      await Promise.all(promises);

      response.status(201).send();
    } catch (error) {
      console.error(error);
      response.status(500).send("Houve um erro ao tentar criar eventos.");
    }
  });
});

export const getEvents = onRequest((request, response) => {
  corsHandler(request, response, async () => {
    try {
      const querySnapshot = await firestore
        .collection(DatabaseTableKeys.Events)
        .get();

      const events = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      response.status(200).send(events);
    } catch (error) {
      console.error(error);
      response.status(500).send("Houve um erro ao buscar eventos.");
    }
  });
});

export const deleteEvents = onRequest((request, response) => {
  corsHandler(request, response, async () => {
    if (request.method !== "POST") {
      response.set("Allow", "POST");
      response.status(405).send("Método não permitido. Use POST.");
      return;
    }

    try {
      const body = request.body as DeleteCommonPayload;

      if (!body || !body.images?.length) {
        response
          .status(400)
          .send("Nenhuma imagem foi fornecida para exclusão!");
        return;
      }

      const { images } = body;

      const firestoreDeletePromises = images.map(async ({ id, url }) => {
        try {
          const eventRef = firestore
            .collection(DatabaseTableKeys.Events)
            .doc(id);

          const eventSnap = await eventRef.get();

          if (eventSnap.exists) {
            await eventRef.delete();
            console.log(`Documento excluído no Firestore com ID: ${id}`);
          } else {
            console.warn(`Documento com ID ${id} não encontrado.`);
          }

          return { id, url, status: "success" };
        } catch (error) {
          console.error(`Erro ao excluir documento com ID: ${id}`, error);
          return { id, url, status: "error", error };
        }
      });

      await Promise.allSettled(firestoreDeletePromises);

      const paths = images.map(
        (img) => `${DatabaseTableKeys.Events}/${img.name}`
      );

      await deleteImageStorage(paths);

      response.status(200).send();
    } catch (error) {
      console.error("Erro ao excluir apresentações:", error);
      response.status(500).send("Houve um erro ao excluir as apresentações.");
    }
  });
});
