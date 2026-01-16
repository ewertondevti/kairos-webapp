import { firebaseStorage } from "@/firebase";
import { StorageImageItem } from "@/types/media";
import { getDownloadURL, listAll, ref } from "firebase/storage";

export const getStorageImages = async (): Promise<StorageImageItem[]> => {
  try {
    const baseRef = ref(firebaseStorage, "images");
    const result = await listAll(baseRef);
    const items = await Promise.all(
      result.items.map(async (item) => {
        const url = await getDownloadURL(item);
        return {
          name: item.name,
          url,
          storagePath: item.fullPath,
        };
      })
    );

    return items;
  } catch (error) {
    console.error("Erro ao listar imagens do storage:", error);
    return [];
  }
};
