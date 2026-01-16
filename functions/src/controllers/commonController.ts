import {onRequest} from "firebase-functions/v2/https";
import {deleteImageStorage} from "../helpers/common";
import {corsHandler, requireAuth, requireRoles} from "../utils";

// Common function configuration
const COMMON_CONFIG = {
  maxInstances: 10,
};

/**
 * Deletes a single uploaded image from Firebase Storage
 */
export const deleteUploadedImage = onRequest(
  COMMON_CONFIG,
  async (request, response) => {
    corsHandler(request, response, async () => {
      if (request.method === "OPTIONS") {
        response.status(204).send();
        return;
      }

      if (request.method !== "DELETE") {
        response.set("Allow", "DELETE");
        response.status(405).send("Método não permitido. Use DELETE.");
        return;
      }

      const context = await requireAuth(request, response);
      if (!context || !requireRoles(context, ["admin", "midia"], response)) {
        return;
      }

      const imagePath = request.query.imagePath as string;

      if (!imagePath?.trim()) {
        console.warn("Nenhuma URL de imagem fornecida para exclusão.");
        response.status(400).send("URL da imagem não foi fornecida.");
        return;
      }

      try {
        await deleteImageStorage([imagePath.trim()]);
        console.log(`Imagem excluída com sucesso: ${imagePath}`);
        response.status(200).send("Imagem excluída com sucesso.");
      } catch (error) {
        console.error("Erro ao excluir imagem:", error);
        response.status(500).send("Houve um erro ao tentar remover imagem.");
      }
    });
  }
);
