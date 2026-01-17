import {
  CreateCommonPayload,
  DeleteCommonPayload,
  ICommonDTO,
} from "@/types/store";
import axios from "axios";
import api from "./httpClient";
import { getAuthHeaders } from "./authHeaders";

export const createEvents = async (payload: CreateCommonPayload) => {
  const headers = await getAuthHeaders();
  const response = await axios.post("/api/events", payload, { headers });
  return response.data;
};

export const getEvents = async (): Promise<ICommonDTO[]> => {
  try {
    const response = await api.get("/getEvents");
    return Array.isArray(response.data) ? response.data : [];
  } catch (error: unknown) {
    console.error("Erro ao buscar eventos:", error);
    return [];
  }
};

export const deleteEvents = async (payload: DeleteCommonPayload) => {
  const headers = await getAuthHeaders();
  const response = await axios.delete("/api/events", {
    data: payload,
    headers,
  });
  return response.data;
};
