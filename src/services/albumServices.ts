import { DeleteImgFromAlbumPayload, IAlbum, IAlbumDTO } from "@/types/store";

export const createAlbum = async (payload: IAlbum) => {
  const response = await fetch("/api/albums", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error("Erro ao criar álbum");
  }

  return response.json();
};

export const updateAlbum = async (payload: IAlbumDTO) => {
  const response = await fetch("/api/albums", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error("Erro ao atualizar álbum");
  }

  return response.json();
};

export const getAlbums = async (): Promise<IAlbumDTO[]> => {
  try {
    const response = await fetch("/api/albums", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Erro ao buscar álbuns: ${response.statusText}`);
    }

    const data = await response.json();

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
  } catch (error: any) {
    console.error("Erro ao buscar álbuns:", {
      message: error?.message,
    });
    // Return empty array instead of throwing to prevent UI crashes
    return [];
  }
};

export const getAlbumById = async (
  id: string
): Promise<IAlbumDTO | undefined> => {
  try {
    const response = await fetch(`/api/albums/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Erro ao buscar álbum: ${response.statusText}`);
    }

    return response.json();
  } catch (error: any) {
    console.error("Erro ao buscar álbum por ID:", error);
    return undefined;
  }
};

export const deleteAlbum = async (id: string) => {
  const response = await fetch(`/api/albums?id=${id}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Erro ao deletar álbum");
  }

  return response.json();
};

export const deleteImageFromAlbum = async (
  payload: DeleteImgFromAlbumPayload
) => {
  const response = await fetch("/api/albums/delete-image", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error("Erro ao deletar imagem do álbum");
  }

  return response.json();
};
