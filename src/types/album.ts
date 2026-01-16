import { IImageDTO } from "./store";

export type AlbumValuesType = {
  name: string;
  albumId?: string;
  images?: IImageDTO[];
};

export type AlbumByIdParams = {
  limit?: number;
  cursor?: string;
};
