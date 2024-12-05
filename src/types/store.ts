import { MembershipFields } from "../enums/membership";

export interface ICommon {
  id?: string;
}

export interface IImageDTO {
  url: string;
  name: string;
}

export interface IAlbum {
  name: string;
  images: IImageDTO[];
}

export interface IAlbumDTO extends IAlbum, ICommon {}
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
