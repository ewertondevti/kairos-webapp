import * as cors from "cors";
import * as admin from "firebase-admin";
import { onRequest } from "firebase-functions/v2/https";
import { DatabaseTableKeys } from "./enums/app";
import { CreateAlbumPayload } from "./models";

admin.initializeApp();
const db = admin.firestore();

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
