import { MembershipFields } from "../enums/membership";

export interface ICommon {
  id?: string;
}

export interface IImageDTO {
  url: string;
  name: string;
}

export interface IAlbumDTO extends ICommon {
  name: string;
  eventDate?: string;
  images: IImageDTO[];
}

export interface IAlbumWithCursor extends IAlbumDTO {
  nextCursor?: string;
}

export type AlbumImagePayload = {
  name: string;
};

export interface IAlbumPayload {
  name: string;
  eventDate?: string;
  images: AlbumImagePayload[];
}

export interface IAlbumUpdatePayload extends IAlbumPayload, ICommon {}
export interface ICommonDTO extends IImageDTO, ICommon {}

export type MemberPayload = {
  [key in MembershipFields]?: IMemberPhoto | string | number | string[];
};

export interface IMemberPhoto {
  file: string;
  filename: string;
  type: string;
}

export type DeleteImgFromAlbumPayload = {
  albumId: string;
  images: IImageDTO[];
};

export type DeleteCommonPayload = {
  images: ICommonDTO[];
};

export type CreateCommonPayload = {
  images: IImageDTO[];
};
