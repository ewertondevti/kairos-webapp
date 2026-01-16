import {IAlbumImage} from "./album";

export interface CreateCommonPayload {
  images: Partial<IAlbumImage>[];
}

export interface CreateAlbumPayload {
  name: string;
  eventDate?: string;
  images: Partial<IAlbumImage>[];
}

export interface UpdateAlbumPayload extends CreateAlbumPayload {
  id: string;
}

export interface DeleteImgFromAlbumPayload {
  albumId: string;
  images: IAlbumImage[];
}

export interface DeleteCommonPayload {
  images: IAlbumImage[];
}

export interface UploadCommonRequest {
  file: string;
  fileName: string;
  mimeType: string;
}

export * from "./user";
