import { IImage } from "./album";

export interface CreateCommonPayload {
  images: Partial<IImage>[];
}

export interface CreateAlbumPayload {
  name: string;
  images: Partial<IImage>[];
}

export interface DeleteImgFromAlbumPayload {
  albumId: string;
  images: IImage[];
}

export interface DeleteCommonPayload {
  images: IImage[];
}
