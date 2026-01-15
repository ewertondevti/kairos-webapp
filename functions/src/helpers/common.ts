import * as crypto from "crypto";
import * as path from "path";
import { storage } from "../firebaseAdmin";

/**
 * Generates a unique filename by appending a number suffix if the file already exists
 * Example: "nome-teste.jpg" -> "nome-teste (1).jpg" -> "nome-teste (2).jpg"
 */
export const generateUniqueFileName = async (
  basePath: string,
  fileName: string
): Promise<string> => {
  const fileExtension = path.extname(fileName);
  const fileNameWithoutExt = path.parse(fileName).name;
  let uniqueFileName = fileName;
  let counter = 1;

  while (true) {
    const destination = `${basePath}/${uniqueFileName}`;
    const fileRef = storage.bucket().file(destination);
    const [exists] = await fileRef.exists();

    if (!exists) {
      return uniqueFileName;
    }

    uniqueFileName = `${fileNameWithoutExt} (${counter})${fileExtension}`;
    counter++;
  }
};

export const buildStorageFileName = (
  originalName: string,
  overrideExtension?: string
) => {
  const safeName = path.basename(originalName);
  const parsed = path.parse(safeName);
  const extension =
    overrideExtension?.startsWith(".") ? overrideExtension : parsed.ext;
  const cleanBase = parsed.name.replace(/\s+/g, "-").toLowerCase();
  const uniqueSuffix = crypto.randomUUID();
  return `${cleanBase}-${uniqueSuffix}${extension || ""}`;
};

/**
 * Deletes multiple images from Firebase Storage
 */
export const deleteImageStorage = async (urls: string[]): Promise<void> => {
  try {
    const deletePromises = urls.map(async (url) => {
      try {
        await storage.bucket().file(url).delete();
        console.log(`Arquivo excluído com sucesso: ${url}`);
      } catch (error) {
        console.error(`Erro ao excluir o arquivo: ${url}`, error);
        // Don't throw - continue with other deletions
      }
    });

    await Promise.allSettled(deletePromises);
    console.log("Todas as exclusões foram processadas.");
  } catch (error) {
    console.error("Erro inesperado ao excluir imagens:", error);
    throw error;
  }
};
