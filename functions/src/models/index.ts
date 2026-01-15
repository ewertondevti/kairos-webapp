import {IImage} from "./album";

export interface CreateCommonPayload {
  images: Partial<IImage>[];
}

export interface CreateAlbumPayload {
  name: string;
  eventDate?: string;
  images: Partial<IImage>[];
}

export interface UpdateAlbumPayload extends CreateAlbumPayload {
  id: string;
}

export interface DeleteImgFromAlbumPayload {
  albumId: string;
  images: IImage[];
}

export interface DeleteCommonPayload {
  images: IImage[];
}

export interface UploadCommonRequest {
  file: string;
  fileName: string;
  mimeType: string;
}
