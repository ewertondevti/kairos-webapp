import {
  DeleteImgFromAlbumPayload,
  IAlbumDTO,
  IAlbumPayload,
  IAlbumUpdatePayload,
} from "@/types/store";
import axios from "axios";

export const createAlbum = async (payload: IAlbumPayload) => {
  try {
    const response = await axios.post("/api/albums", payload);
    return response.data;
  } catch (error) {
    throw new Error("Erro ao criar álbum");
  }
};

export const updateAlbum = async (payload: IAlbumUpdatePayload) => {
  try {
    const response = await axios.post("/api/albums", payload);
    return response.data;
  } catch (error) {
    throw new Error("Erro ao atualizar álbum");
  }
};

export const getAlbums = async (): Promise<IAlbumDTO[]> => {
  try {
    const response = await axios.get("/api/albums");
    const data = response.data;

    // Handle case where response.data might be a string
    if (typeof data === "string") {
      try {
        const parsed = JSON.parse(data);
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        console.error("Erro ao fazer parse da resposta:", data);
        return [];
      }
    }

    return Array.isArray(data) ? data : [];
  } catch (error: unknown) {
    const err = error as { message?: string };
    console.error("Erro ao buscar álbuns:", {
      message: err?.message,
    });
    // Return empty array instead of throwing to prevent UI crashes
    return [];
  }
};

export const getAlbumById = async (
  id: string
): Promise<IAlbumDTO | undefined> => {
  try {
    const response = await axios.get(`/api/albums/${id}`);
    return response.data;
  } catch (error: unknown) {
    console.error("Erro ao buscar álbum por ID:", error);
    return undefined;
  }
};

export const deleteAlbum = async (id: string) => {
  const response = await axios.delete("/api/albums", { params: { id } });
  return response.data;
};

export const deleteImageFromAlbum = async (
  payload: DeleteImgFromAlbumPayload
) => {
  const response = await axios.post("/api/albums/delete-image", payload);
  return response.data;
};
