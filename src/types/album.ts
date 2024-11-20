import { IImageDTO } from "./store";

export type AlbumValuesType = {
  name: string;
  albumId?: string;
  images?: IImageDTO[];
};
