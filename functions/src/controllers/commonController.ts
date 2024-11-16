import { onRequest } from "firebase-functions/v2/https";
import { deleteImageStorage } from "../helpers/common";
import { corsHandler } from "../utils/corsHandler";

export const deleteUploadedImage = onRequest((request, response) => {
  corsHandler(request, response, async () => {
    if (request.method !== "DELETE") {
      response.set("Allow", "DELETE");
      response.status(405).send("Método não permitido. Use DELETE.");
      return;
    }

    const imagePath = request.query.imagePath as string;

    if (!imagePath) {
      console.warn("Nenhuma URL de imagem fornecida para exclusão.");
      response.status(400).send("URL da imagem não foi fornecida.");
      return;
    }

    try {
      await deleteImageStorage([imagePath]);
      response.status(200).send("Imagem excluída com sucesso.");
    } catch (error) {
      console.error(error);
      response.status(500).send("Houve um erro ao tentar remover imagem.");
    }
  });
});
