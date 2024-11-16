import { onRequest } from "firebase-functions/https";
import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import * as sharp from "sharp";
import { DatabaseTableKeys } from "../enums/app";
import { firestore, storage } from "../firebaseAdmin";
import { deleteImageStorage } from "../helpers/common";
import { CreateCommonPayload, DeleteCommonPayload } from "../models";
import { corsHandler } from "../utils/corsHandler";

export const uploadEvent = onRequest((request, response) => {
  corsHandler(request, response, async () => {
    if (request.method !== "POST") {
      response.set("Allow", "POST");
      response.status(405).send("Método não permitido. Use POST.");
      return;
    }

    const { file, fileName, mimeType } = request.body;

    if (!file || !fileName || !mimeType) {
      response.status(400).send("Dados incompletos!");
      return;
    }

    try {
      // Decodifica o arquivo base64
      const base64Data = file.split(";base64,").pop();
      const tempFilePath = path.join(os.tmpdir(), fileName);

      // Salva o arquivo temporariamente
      fs.writeFileSync(tempFilePath, Buffer.from(base64Data, "base64"));

      let finalPath = tempFilePath;

      // Verifica se o tipo MIME é HEIC e realiza a conversão para JPEG
      if (mimeType === "image/heic" || mimeType === "image/heif") {
        const jpegFileName = `${path.parse(fileName).name}.jpeg`;
        const convertedFilePath = path.join(os.tmpdir(), jpegFileName);

        await sharp(tempFilePath).toFormat("jpeg").toFile(convertedFilePath);

        console.log(
          `Imagem convertida de HEIC para JPEG: ${convertedFilePath}`
        );
        finalPath = convertedFilePath;
      }

      // Faz o upload para o Firebase Storage
      const destination = `${DatabaseTableKeys.Events}/${fileName}`;
      await storage.bucket().upload(finalPath, {
        destination,
        metadata: {
          contentType: mimeType === "image/heic" ? "image/jpeg" : mimeType,
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

      const deletePromises = images.map(async ({ id, url }) => {
        if (!id || !url) {
          console.warn(`Imagem com dados inválidos: id=${id}, url=${url}`);
          return;
        }

        const presRef = firestore
          .collection(DatabaseTableKeys.Presentations)
          .doc(id);
        const presSnap = await presRef.get();

        if (presSnap.exists) {
          try {
            await deleteImageStorage([url]);
            console.log(`Imagem ${url} excluída do storage.`);

            await presRef.delete();
            console.log(`Evento com ID ${id} excluído com sucesso.`);
          } catch (error) {
            console.error(
              `Erro ao excluir imagem ou evento (ID ${id}):`,
              error
            );
          }
        } else {
          console.warn(`Evento com ID ${id} não encontrado.`);
        }
      });

      await Promise.all(deletePromises);

      response.status(200).send();
    } catch (error) {
      console.error("Erro ao excluir apresentações:", error);
      response.status(500).send("Houve um erro ao excluir as apresentações.");
    }
  });
});
