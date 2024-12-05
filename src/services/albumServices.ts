import { DeleteImgFromAlbumPayload, IAlbum, IAlbumDTO } from "@/types/store";
import api from "./httpClient";

export const createAlbum = async (payload: IAlbum) => {
  const { data } = await api.post("/createAlbum", payload);
  return data;
};

export const updateAlbum = async (payload: IAlbumDTO) => {
  const { data } = await api.post("/updateAlbum", payload);
  return data;
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

export const deleteAlbum = async (id: string) => {
  const { data } = await api.delete("/deleteAlbum", { params: { id } });
  return data;
};

export const deleteImageFromAlbum = async (
  payload: DeleteImgFromAlbumPayload
) => {
  const { data } = await api.post("/deleteImageFromAlbum", payload);
  return data;
};
