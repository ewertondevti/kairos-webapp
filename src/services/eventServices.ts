import {
  CreateCommonPayload,
  DeleteCommonPayload,
  ICommonDTO,
} from "@/types/store";

export const createEvents = async (payload: CreateCommonPayload) => {
  const response = await fetch("/api/events", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error("Erro ao criar eventos");
  }

  return response.json();
};

export const getEvents = async (): Promise<ICommonDTO[]> => {
  try {
    const response = await fetch("/api/events", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Erro ao buscar eventos: ${response.statusText}`);
    }

    const data = await response.json();
    return Array.isArray(data) ? data : [];
  } catch (error: any) {
    console.error("Erro ao buscar eventos:", error);
    return [];
  }
};

export const deleteEvents = async (payload: DeleteCommonPayload) => {
  const response = await fetch("/api/events", {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error("Erro ao deletar eventos");
  }

  return response.json();
};
