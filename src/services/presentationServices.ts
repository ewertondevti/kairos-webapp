import {
  CreateCommonPayload,
  DeleteCommonPayload,
  ICommonDTO,
} from "@/types/store";
import api from "./httpClient";

export const createPresentations = async (payload: CreateCommonPayload) => {
  const { data } = await api.post("/createPresentations", payload);

  return data;
};

export const getPresentations = async () => {
  const { data } = await api.get<ICommonDTO[]>("/getPresentations");

  return data;
};

export const deletePresentations = async (payload: DeleteCommonPayload) => {
  const { data } = await api.post("/deletePresentations", payload);

  return data;
};
