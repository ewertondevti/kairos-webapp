import { IAlbumDTO, ICommonDTO } from "@/types/store";
import api from "./httpClient";

export const convertHeicToJpeg = async (imageUrl: string) => {
  const { data } = await api.get("/convertHeicToJpeg", {
    params: { url: imageUrl },
    responseType: "blob",
  });

  return URL.createObjectURL(data);
};

export const getAlbums = async () => {
  const { data } = await api.get<IAlbumDTO[]>("/getAlbums");

  return data;
};

export const getAlbumById = async (
  id: string
): Promise<IAlbumDTO | undefined> => {
  const { data } = await api.get<IAlbumDTO>("/getAlbumById", {
    params: { id },
  });

  return data;
};

export const createAlbum = async (payload: Partial<IAlbumDTO>) => {
  const { data } = await api.post("/createAlbum", payload);

  return data;
};

export const getPresentations = async () => {
  const { data } = await api.get<ICommonDTO[]>("/getPresentations");

  return data;
};

export const getEvents = async () => {
  const { data } = await api.get<ICommonDTO[]>("/getEvents");

  return data;
};
