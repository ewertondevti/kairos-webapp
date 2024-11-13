import { MembershipFields } from "@/enums/membership";

export type CommonType = {
  id?: string;
};

export type ImageType = {
  url: string;
  name: string;
};

export type AlbumType = {
  name: string;
  images: ImageResult[];
};

export type ImageResult = ImageType & CommonType;
export type AlbumResult = AlbumType & CommonType;
export type PresentationResult = ImageType & CommonType;
export type EventResult = ImageType & CommonType;

export type AddDocumentPayload = {
  collectionId: string;
  documentId?: string;
  data: any;
};

export type MemberType = {
  [MembershipFields.Photo]?: string;
  [MembershipFields.Code]: string;
  [MembershipFields.Fullname]: string;
  [MembershipFields.Birthdate]?: string;
  [MembershipFields.Gender]?: number;
  [MembershipFields.MaritalStatus]?: number;
  [MembershipFields.PostalCode]?: string;
  [MembershipFields.Address]?: string;
  [MembershipFields.Neighborhood]?: string;
  [MembershipFields.City]?: string;
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
