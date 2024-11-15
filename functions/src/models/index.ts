import { IImage } from "./album";

export interface CreateAlbumPayload {
  name: string;
  images: Partial<IImage>[];
}

export interface DeleteImgFromAlbumPayload {
  albumId: string;
  images: IImage[];
}
