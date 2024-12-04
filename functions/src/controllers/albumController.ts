import * as admin from "firebase-admin";
import { onRequest } from "firebase-functions/v2/https";
import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import { DatabaseTableKeys } from "../enums/app";
import { firestore, storage } from "../firebaseAdmin";
import { deleteImageStorage } from "../helpers/common";
import {
  CreateAlbumPayload,
  DeleteImgFromAlbumPayload,
  UpdateAlbumPayload,
  UploadCommonRequest,
} from "../models";
import { IAlbum } from "../models/album";
import { corsHandler, processHeicToJpeg } from "../utils";

export const uploadImage = onRequest(
  { memory: "2GiB", timeoutSeconds: 600, maxInstances: 20 },
  async (request, response) => {
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

      // Verifica se a imagem já existe
      const destination = `${DatabaseTableKeys.Images}/${fileName}`;
      const fileRef = storage.bucket().file(destination);
      const isExists = await fileRef.exists();

      if (isExists[0]) {
        const url = await fileRef.getSignedUrl({
          action: "read",
          expires: "03-01-2500",
        });

        response.status(200).send({ url });
        return;
      }

      try {
        await firestore.runTransaction(async () => {
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

          // Define o caminho final para upload
          let finalPath = tempFilePath;

          // Verifica se o arquivo é HEIC e realiza a conversão
          if ([mimeType, type].includes("image/heic")) {
            // Converte HEIC para JPEG
            finalPath = await processHeicToJpeg(
              tempFilePath,
              convertedFilePath
            );
          }

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
        });
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
  }
);

export const createAlbum = onRequest((request, response) => {
  corsHandler(request, response, async () => {
    if (request.method !== "POST") {
      response.set("Allow", "POST");
      response.status(405).send("Método não permitido. Use POST.");
      return;
    }

    try {
      const body = request.body as CreateAlbumPayload;

      if (!body || !body.name || !body.images?.length) {
        response.status(400).send("Dados incompletos ou inválidos!");
        return;
      }

      const newAlbum = {
        ...body,
        creationDate: admin.firestore.FieldValue.serverTimestamp(),
      };

      await firestore.collection(DatabaseTableKeys.Albums).add(newAlbum);

      response.status(201).send();
    } catch (error) {
      console.error(error);
      response.status(500).send("Houve um erro ao tentar criar o álbum.");
    }
  });
});

export const updateAlbum = onRequest((request, response) => {
  corsHandler(request, response, async () => {
    if (request.method !== "POST") {
      response.set("Allow", "POST");
      response.status(405).send("Método não permitido. Use POST.");
      return;
    }

    try {
      const body = request.body as UpdateAlbumPayload;

      if (!body || !body.id || !body.name) {
        response.status(400).send("Dados incompletos ou inválidos!");
        return;
      }

      const albumRef = firestore
        .collection(DatabaseTableKeys.Albums)
        .doc(body.id);

      await firestore.runTransaction(async (transaction) => {
        const albumSnap = await transaction.get(albumRef);

        if (!albumSnap.exists) {
          response.status(404).send("Álbum não encontrado.");
          return;
        }

        const album = albumSnap.data() as IAlbum;

        const updatedAlbum: Partial<IAlbum> = {
          name: body.name,
          updatedDate: admin.firestore.FieldValue.serverTimestamp(),
        };

        if (body.images.length) {
          updatedAlbum.images = [...album.images, ...body.images];
        }

        transaction.update(albumRef, updatedAlbum);
      });

      response.status(200).send("Álbum atualizado com sucesso.");
    } catch (error) {
      console.error(error);
      response.status(500).send("Houve um erro ao tentar atualizar o álbum.");
    }
  });
});

export const getAlbums = onRequest((request, response) => {
  corsHandler(request, response, async () => {
    if (request.method !== "GET") {
      response.set("Allow", "GET");
      response.status(405).send("Método não permitido. Use GET.");
      return;
    }

    try {
      const querySnapshot = await firestore
        .collection(DatabaseTableKeys.Albums)
        .get();

      const albums = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as IAlbum).images.map(async (img) => {
          const destination = `${DatabaseTableKeys.Images}/${img.name}`;
          const fileRef = storage.bucket().file(destination);

          const url = await fileRef.getSignedUrl({
            action: "read",
            expires: Date.now() + 15 * 60 * 1000,
          });

          return { ...img, url };
        }),
      }));

      response.status(200).json(albums);
    } catch (error) {
      console.error("Erro ao buscar álbuns:", error);
      response.status(500).send("Erro ao buscar álbuns.");
    }
  });
});

export const getAlbumById = onRequest((request, response) => {
  corsHandler(request, response, async () => {
    if (request.method !== "GET") {
      response.set("Allow", "GET");
      response.status(405).send("Método não permitido. Use GET.");
      return;
    }

    try {
      const id = request.query.id as string;

      if (!id) {
        response.status(400).send("ID do álbum não foi fornecido!");
        return;
      }

      const docSnap = await firestore
        .collection(DatabaseTableKeys.Albums)
        .doc(id)
        .get();

      if (docSnap.exists) {
        response.status(200).json({ id: docSnap.id, ...docSnap.data() });
      }

      response.status(404).send("Álbum não existe!");
    } catch (error) {
      console.error("Erro ao buscar álbuns:", error);
      response.status(500).send("Erro ao buscar álbuns.");
    }
  });
});

export const deleteImageFromAlbum = onRequest((request, response) => {
  corsHandler(request, response, async () => {
    if (request.method !== "POST") {
      response.set("Allow", "POST");
      response.status(405).send("Método não permitido. Use POST.");
      return;
    }

    try {
      const body = request.body as DeleteImgFromAlbumPayload;

      if (!body || !body.albumId || !body.images?.length) {
        response
          .status(400)
          .send("ID do álbum ou imagens não foram fornecidos!");
        return;
      }

      const { albumId, images } = body;

      const albumRef = firestore
        .collection(DatabaseTableKeys.Albums)
        .doc(albumId);
      const albumSnap = await albumRef.get();

      if (!albumSnap.exists) {
        response.status(404).send("Álbum não encontrado!");
        return;
      }

      await albumRef.update({
        images: admin.firestore.FieldValue.arrayRemove(...images),
      });

      const paths = images.map(
        (img) => `${DatabaseTableKeys.Images}/${img.name}`
      );

      await deleteImageStorage(paths);

      response.status(200).send();
    } catch (error) {
      console.error(error);
      response.status(500).send("Houve um erro ao remover imagens.");
    }
  });
});

export const deleteAlbum = onRequest((request, response) => {
  corsHandler(request, response, async () => {
    if (request.method !== "DELETE") {
      response.set("Allow", "DELETE");
      response.status(405).send("Método não permitido. Use DELETE.");
      return;
    }

    try {
      const id = request.query.id as string;

      if (!id) {
        response.status(400).send("ID do álbum não foi fornecido!");
        return;
      }

      const albumRef = firestore.collection(DatabaseTableKeys.Albums).doc(id);
      const albumSnap = await albumRef.get();

      if (!albumSnap.exists) {
        response.status(404).send("Álbum não encontrado!");
        return;
      }

      const data = albumSnap.data() as IAlbum;

      if (data.images.length) {
        const paths = data.images.map(
          (img) => `${DatabaseTableKeys.Images}/${img.name}`
        );

        await deleteImageStorage(paths);
      }

      await albumRef.delete();
      response.status(200).send();
    } catch (error) {
      console.error(error);
      response.status(500).send("Houve um erro ao buscar eventos.");
    }
  });
});
