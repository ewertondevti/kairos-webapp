import {UserRole} from "../utils";

export type UserStatus = "pending" | "approved" | "rejected";

export interface IUser {
  authUid: string;
  fullname: string;
  email: string;
  role: UserRole;
  active: boolean;
  memberId?: string;
  normalizedFullname: string;
  normalizedEmail: string;
  createdAt: FirebaseFirestore.FieldValue;
  updatedAt: FirebaseFirestore.FieldValue;
  createdBy: string;
}

export interface IAccessRequest {
  fullname: string;
  email: string;
  normalizedFullname: string;
  normalizedEmail: string;
  status: UserStatus;
  createdAt: FirebaseFirestore.FieldValue;
}
