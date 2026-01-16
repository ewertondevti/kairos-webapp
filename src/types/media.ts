import { ICommonDTO, IImageDTO } from "./store";

export type MediaAlbumSummary = {
  id: string;
  name: string;
  eventDate?: string;
  imagesCount: number;
  coverUrl?: string;
};

export type MediaImageItem = IImageDTO & {
  id: string;
  albumId?: string;
  albumName?: string;
  eventDate?: string;
  storagePath: string;
};

export type MediaEventItem = ICommonDTO;

export type MediaImagesResponse = {
  images: MediaImageItem[];
  nextCursor?: string;
};

export type StorageImageItem = IImageDTO & {
  storagePath: string;
};
