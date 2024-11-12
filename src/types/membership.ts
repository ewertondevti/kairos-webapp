import { MembershipFields } from "@/enums/membership";
import { Dayjs } from "dayjs";

export interface MembershipValues {
  [MembershipFields.Photo]?: File;
  [MembershipFields.Code]: string;
  [MembershipFields.Fullname]: string;
  [MembershipFields.Birthdate]?: Dayjs;
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
  [MembershipFields.WeddingDate]?: Dayjs;
  [MembershipFields.Children]?: string[];
  [MembershipFields.BaptismChurch]?: string;
  [MembershipFields.BaptismDate]?: Dayjs;
  [MembershipFields.AdmissionType]?: string;
  [MembershipFields.BaptizedPastor]?: string;
  [MembershipFields.AdmissionDate]?: Dayjs;
  [MembershipFields.Congregation]?: string;
  [MembershipFields.ChurchRole]?: string;
  [MembershipFields.BelongsTo]?: string;
}

export interface IPostalCode {
  ID: number;
  CodigoPostal: string;
  Morada: string;
  NumeroPorta: string;
  Localidade: string;
  Freguesia: string;
  Concelho: string;
  CodigoDistrito: number;
  Distrito: string;
  Latitude: string;
  Longitude: string;
}
