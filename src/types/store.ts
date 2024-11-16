import { MembershipFields } from "@/enums/membership";

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
  [MembershipFields.Photo]?: IMemberPhoto;
  [MembershipFields.Id]?: string;
  [MembershipFields.Fullname]: string;
  [MembershipFields.BirthDate]?: string;
  [MembershipFields.Gender]?: number;
  [MembershipFields.MaritalStatus]?: number;
  [MembershipFields.PostalCode]?: string;
  [MembershipFields.Address]?: string;
  [MembershipFields.City]?: string;
  [MembershipFields.County]?: string;
  [MembershipFields.State]?: string;
  [MembershipFields.MotherName]?: string;
  [MembershipFields.FatherName]?: string;
  [MembershipFields.SpouseName]?: string;
  [MembershipFields.WeddingDate]?: string;
  [MembershipFields.Children]?: string[];
  [MembershipFields.BaptismChurch]?: string;
  [MembershipFields.BaptismDate]?: string;
  [MembershipFields.AdmissionType]?: string;
  [MembershipFields.BaptizedPastor]?: string;
  [MembershipFields.AdmissionDate]?: string;
  [MembershipFields.Congregation]?: string;
  [MembershipFields.ChurchRole]?: string;
  [MembershipFields.BelongsTo]?: string;
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
