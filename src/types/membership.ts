import { MembershipFields } from "@/features/membership/membership.enums";
import { Dayjs } from "dayjs";
import { MemberPayload } from "./store";
import { MemberChild } from "./user";
import { IMemberPhoto } from "./store";

export type ChildFormValue = {
  name: string;
  birthDate?: Dayjs;
};

export type ChildInput = MemberChild | string;

export interface MembershipValues {
  [MembershipFields.Photo]?: IMemberPhoto;
  [MembershipFields.Id]?: string;
  [MembershipFields.Fullname]: string;
  [MembershipFields.BirthDate]?: Dayjs;
  [MembershipFields.Gender]?: number;
  [MembershipFields.MaritalStatus]?: number;
  [MembershipFields.PostalCode]?: string;
  [MembershipFields.Address]?: string;
  [MembershipFields.AddressNumber]?: string;
  [MembershipFields.AddressFloor]?: string;
  [MembershipFields.AddressDoor]?: string;
  [MembershipFields.City]?: string;
  [MembershipFields.County]?: string;
  [MembershipFields.State]?: string;
  [MembershipFields.Email]?: string;
  [MembershipFields.MotherName]?: string;
  [MembershipFields.FatherName]?: string;
  [MembershipFields.SpouseName]?: string;
  [MembershipFields.WeddingDate]?: Dayjs;
  [MembershipFields.Children]?: ChildFormValue[];
  [MembershipFields.BaptismChurch]?: string;
  [MembershipFields.BaptismDate]?: Dayjs;
  [MembershipFields.AdmissionType]?: string;
  [MembershipFields.BaptizedPastor]?: string;
  [MembershipFields.AdmissionDate]?: Dayjs;
  [MembershipFields.Congregation]?: string;
  [MembershipFields.ChurchRole]?: string;
  [MembershipFields.BelongsTo]?: string;
  [MembershipFields.IsActive]?: boolean;
}

export type MembershipSubmissionPayload = MemberPayload;

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
