import {UserRole} from "../utils";

export type UserStatus = "pending" | "approved" | "rejected";

export type MemberChild = {
  name: string;
  birthDate?: string;
};

export interface IUser {
  authUid: string;
  fullname: string;
  email: string;
  role: UserRole;
  active: boolean;
  birthDate?: string;
  gender?: number;
  maritalStatus?: number;
  postalCode?: string;
  address?: string;
  addressNumber?: string;
  addressFloor?: string;
  addressDoor?: string;
  city?: string;
  county?: string;
  state?: string;
  motherName?: string;
  fatherName?: string;
  spouseName?: string;
  weddingDate?: string;
  children?: MemberChild[];
  baptismChurch?: string;
  baptismDate?: string;
  admissionType?: string;
  baptizedPastor?: string;
  admissionDate?: string;
  congregation?: string;
  churchRole?: string;
  belongsTo?: string;
  photo?: string;
  isActive?: boolean;
  createdAt: FirebaseFirestore.FieldValue;
  updatedAt: FirebaseFirestore.FieldValue;
  createdBy: string;
}

export interface IAccessRequest {
  fullname: string;
  email: string;
  status: UserStatus;
  createdAt: FirebaseFirestore.FieldValue;
}
