import { onRequest } from "firebase-functions/https";
import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import { DatabaseTableKeys } from "../enums/app";
import { firestore, storage } from "../firebaseAdmin";
import { IMember, IMemberPayload } from "../models/member";
import { corsHandler } from "../utils";

export const createNewMember = onRequest((request, response) => {
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
      const body = request.body as IMemberPayload;

      if (
        !body ||
        !body.address ||
        !body.birthDate ||
        !body.city ||
        !body.county ||
        !body.state ||
        !body.maritalStatus ||
        !body.gender ||
        !body.fullname
      ) {
        response.status(400).send("Dados incompletos ou inválidos!");
        return;
      }

      const member: IMember = { ...body, photo: undefined };

      if (body.photo) {
        const { file, filename, type } = body.photo;

        try {
          // Decodifica o arquivo base64
          const base64Data = file.split(";base64,").pop()!;
          const tempFilePath = path.join(os.tmpdir(), filename);

          // Salva o arquivo temporariamente
          fs.writeFileSync(tempFilePath, Buffer.from(base64Data, "base64"));

          // Faz o upload para o Firebase Storage
          const destination = `${DatabaseTableKeys.Members}/${filename}`;
          await storage.bucket().upload(tempFilePath, {
            destination,
            metadata: {
              contentType: type,
            },
          });

          // Obtém a URL pública do arquivo
          const fileRef = storage.bucket().file(destination);
          const [url] = await fileRef.getSignedUrl({
            action: "read",
            expires: "03-01-2500",
          });

          member.photo = url;
          console.log("Arquivo enviado para:", url);
        } catch (error) {
          console.error("Erro ao processar o arquivo:", error);
        } finally {
          // Remove o arquivo temporário
          const tempFilePath = path.join(os.tmpdir(), filename);
          if (fs.existsSync(tempFilePath)) {
            fs.unlinkSync(tempFilePath);
          }
        }
      }

      await firestore.collection(DatabaseTableKeys.Members).add(member);

      response.status(201).send();
    } catch (error) {
      console.error(error);
      response
        .status(500)
        .send("Houve um erro ao tentar adicionar novo membro.");
    }
  });
});
