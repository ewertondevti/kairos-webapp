import {
  DeleteImgFromAlbumPayload,
  IAlbumDTO,
  IAlbumWithCursor,
  IAlbumPayload,
  IAlbumUpdatePayload,
} from "@/types/store";
import { AlbumByIdParams, AlbumListResponse } from "@/types/album";
import { MediaImagesResponse } from "@/types/media";
import axios from "axios";
import api from "./httpClient";
import { getAuthHeaders } from "./authHeaders";

export const createAlbum = async (payload: IAlbumPayload) => {
  try {
    const headers = await getAuthHeaders();
    const response = await axios.post("/api/albums", payload, { headers });
    return response.data;
  } catch (error) {
    throw new Error("Erro ao criar álbum");
  }
};

export const updateAlbum = async (payload: IAlbumUpdatePayload) => {
  try {
    const headers = await getAuthHeaders();
    const response = await axios.post("/api/albums", payload, { headers });
    return response.data;
  } catch (error) {
    throw new Error("Erro ao atualizar álbum");
  }
};

export const getAlbums = async (): Promise<IAlbumDTO[]> => {
  try {
    const response = await api.get("/getAlbums");
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

export const getAlbumsPaged = async (
  params?: AlbumByIdParams
): Promise<AlbumListResponse> => {
  try {
    const response = await api.get<AlbumListResponse>("/getAlbumsPaged", {
      params: {
        limit: params?.limit,
        cursor: params?.cursor,
      },
    });
    return response.data;
  } catch (error: unknown) {
    console.error("Erro ao buscar álbuns paginados:", error);
    return { albums: [] };
  }
};

export const getAlbumById = async (
  id: string,
  params?: AlbumByIdParams
): Promise<IAlbumWithCursor | undefined> => {
  try {
    const response = await api.get("/getAlbumById", {
      params: {
        id,
        limit: params?.limit,
        cursor: params?.cursor,
      },
    });
    return response.data;
  } catch (error: unknown) {
    console.error("Erro ao buscar álbum por ID:", error);
    return undefined;
  }
};

export const getAlbumImages = async (
  params?: AlbumByIdParams
): Promise<MediaImagesResponse> => {
  try {
    const response = await api.get<MediaImagesResponse>("/getAlbumImages", {
      params: {
        limit: params?.limit,
        cursor: params?.cursor,
      },
    });
    return response.data;
  } catch (error: unknown) {
    console.error("Erro ao buscar imagens dos álbuns:", error);
    return { images: [] };
  }
};

export const deleteAlbum = async (id: string) => {
  const headers = await getAuthHeaders();
  const response = await axios.delete("/api/albums", {
    params: { id },
    headers,
  });
  return response.data;
};

export const deleteImageFromAlbum = async (
  payload: DeleteImgFromAlbumPayload
) => {
  const headers = await getAuthHeaders();
  const response = await axios.post("/api/albums/delete-image", payload, {
    headers,
  });
  return response.data;
};
