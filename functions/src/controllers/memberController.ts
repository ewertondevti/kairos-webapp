import {onRequest} from "firebase-functions/v2/https";
import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import {DatabaseTableKeys} from "../enums/app";
import {firestore, storage} from "../firebaseAdmin";
import {generateUniqueFileName} from "../helpers/common";
import {IMember, IMemberPayload} from "../models/member";
import {corsHandler} from "../utils";

// Common function configuration for member operations
const MEMBER_CONFIG = {
  memory: "1GiB" as const,
  timeoutSeconds: 300,
  maxInstances: 10,
  invoker: "public",
};

/**
 * Creates a new member with optional photo upload
 */
export const createNewMember = onRequest(
  MEMBER_CONFIG,
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
        const body = request.body as IMemberPayload;

        // Validate required fields
        const requiredFields = [
          "address",
          "birthDate",
          "city",
          "county",
          "state",
          "maritalStatus",
          "gender",
          "fullname",
          "email",
        ];

        const missingFields = requiredFields.filter(
          (field) => !body?.[field as keyof IMemberPayload]?.toString().trim()
        );

        if (missingFields.length > 0) {
          response.status(400).send("Dados incompletos ou inválidos!");
          return;
        }

        const member: IMember = {
          ...body,
          photo: undefined,
          isActive: body.isActive ?? true,
        };
        let tempFilePath: string | null = null;

        try {
          if (body.photo) {
            const {file, filename, type} = body.photo;

            if (!file || !filename || !type) {
              response.status(400).send("Dados da foto incompletos!");
              return;
            }

            // Generate unique filename if file already exists
            const uniqueFileName = await generateUniqueFileName(
              DatabaseTableKeys.Members,
              filename
            );
            const destination =
              `${DatabaseTableKeys.Members}/${uniqueFileName}`;

            // Decode base64 file
            const base64Data = file.split(";base64,").pop();
            if (!base64Data) {
              response.status(400).send("Formato de arquivo inválido!");
              return;
            }

            tempFilePath = path.join(os.tmpdir(), uniqueFileName);

            // Save temporary file
            fs.writeFileSync(tempFilePath, Buffer.from(base64Data, "base64"));

            // Upload to Firebase Storage
            await storage.bucket().upload(tempFilePath, {
              destination,
              metadata: {contentType: type},
            });

            // Get signed URL (long expiration for member photos)
            const fileRef = storage.bucket().file(destination);
            const [url] = await fileRef.getSignedUrl({
              action: "read",
              expires: Date.now() + 365 * 24 * 60 * 60 * 1000, // 1 year
            });

            member.photo = url;
            console.log(`Foto do membro enviada: ${uniqueFileName} -> ${url}`);
          }

          // Create member document
          await firestore.collection(DatabaseTableKeys.Members).add(member);

          console.log(`Membro criado com sucesso: ${body.fullname}`);
          response.status(201).send();
        } catch (photoError) {
          console.error("Erro ao processar foto do membro:", photoError);
          // Continue without photo if upload fails
          await firestore.collection(DatabaseTableKeys.Members).add(member);
          console.log(`Membro criado sem foto: ${body.fullname}`);
          response.status(201).send();
        } finally {
          // Clean up temporary file
          if (tempFilePath && fs.existsSync(tempFilePath)) {
            try {
              fs.unlinkSync(tempFilePath);
            } catch (cleanupError) {
              console.error(
                `Erro ao limpar arquivo temporário ${tempFilePath}:`,
                cleanupError
              );
            }
          }
        }
      } catch (error) {
        console.error("Erro ao criar membro:", error);
        response
          .status(500)
          .send("Houve um erro ao tentar adicionar novo membro.");
      }
    });
  }
);
