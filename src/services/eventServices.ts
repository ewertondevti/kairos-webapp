import {
  CreateCommonPayload,
  DeleteCommonPayload,
  ICommonDTO,
} from "@/types/store";
import api from "./httpClient";

export const createEvents = async (payload: CreateCommonPayload) => {
  const { data } = await api.post("/createEvents", payload);

  return data;
};

export const getEvents = async () => {
  const { data } = await api.get<ICommonDTO[]>("/getEvents");

  return data;
};

export const deleteEvents = async (payload: DeleteCommonPayload) => {
  const { data } = await api.post("/deleteEvents", payload);

  return data;
};
