import * as cors from "cors";
import * as admin from "firebase-admin";
import * as functions from "firebase-functions";
import { onRequest } from "firebase-functions/v2/https";
import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import * as sharp from "sharp";
import { DatabaseTableKeys } from "./enums/app";
import { CreateAlbumPayload } from "./models/image";

admin.initializeApp();
const db = admin.firestore();
const storage = admin.storage();

const corsHandler = cors({ origin: true });

export const getAlbums = onRequest((request, response) => {
  corsHandler(request, response, async () => {
    try {
      const querySnapshot = await db.collection(DatabaseTableKeys.Albums).get();

      const albums = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
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
    try {
      const id = request.query.id as string;

      if (!id) {
        response.status(400).send("ID do álbum não foi fornecido!");
        return;
      }

      const docSnap = await db
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

export const createAlbum = onRequest((request, response) => {
  corsHandler(request, response, async () => {
    if (request.method === "POST") {
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

        await db.collection(DatabaseTableKeys.Albums).add(newAlbum);

        response.status(201);
      } catch (error) {
        console.error(error);
        response.status(500).send("Houve um erro ao tentar criar o álbum.");
      }
    } else {
      response.set("Allow", "POST");
      response.status(405).send("Método não permitido. Use POST.");
    }
  });
});

export const getPresentations = onRequest((request, response) => {
  corsHandler(request, response, async () => {
    try {
      const querySnapshot = await db
        .collection(DatabaseTableKeys.Presentations)
        .get();

      const presentations = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      response.status(200).send(presentations);
    } catch (error) {
      console.error(error);
      response.status(500).send("Houve um erro ao buscar apresentação.");
    }
  });
});

export const getEvents = onRequest((request, response) => {
  corsHandler(request, response, async () => {
    try {
      const querySnapshot = await db.collection(DatabaseTableKeys.Events).get();

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

export const convertHeicToJpg = functions.storage.onObjectFinalized(
  async (object) => {
    const bucket = storage.bucket(object.bucket);
    const filePath = object.data.name || "";
    const tempFilePath = path.join(os.tmpdir(), path.basename(filePath));
    const outputFilePath = path.join(
      os.tmpdir(),
      `${path.basename(filePath, ".heic")}.jpg`
    );

    if (!filePath.endsWith(".heic")) {
      console.log("O arquivo não é .heic. Ignorando...");
      return null;
    }

    try {
      // Baixar o arquivo do Cloud Storage
      await bucket.file(filePath).download({ destination: tempFilePath });
      console.log("Arquivo HEIC baixado com sucesso:", tempFilePath);

      // Converter HEIC para JPG
      await sharp(tempFilePath).toFormat("jpeg").toFile(outputFilePath);
      console.log("Arquivo convertido para JPG:", outputFilePath);

      // Fazer upload do arquivo convertido de volta ao bucket
      const destination = filePath.replace(".heic", ".jpg");
      await bucket.upload(outputFilePath, {
        destination: destination,
        metadata: {
          contentType: "image/jpeg",
        },
      });

      console.log("Arquivo convertido enviado para o bucket:", destination);

      // Remover arquivos temporários
      fs.unlinkSync(tempFilePath);
      fs.unlinkSync(outputFilePath);
      return null;
    } catch (error) {
      console.error("Erro ao processar o arquivo HEIC:", error);
      return null;
    }
  }
);
