import { storage } from "../firebaseAdmin";

export const deleteImageStorage = async (urls: string[]) => {
  try {
    const deletePromises = urls.map(async (url) => {
      try {
        // Excluir o arquivo do Firebase Storage
        await storage.bucket().file(url).delete();

        console.log(`Arquivo excluído com sucesso: ${url}`);
      } catch (error) {
        console.error(`Erro ao excluir o arquivo: ${url}`, error);
      }
    });

    await Promise.all(deletePromises);
    console.log("Todas as exclusões foram processadas.");
  } catch (error) {
    console.error("Erro inesperado ao excluir apresentações:", error);
  }
};
