export enum UserRole {
  Admin = 0,
  Secretaria = 1,
  Midia = 2,
}

export type MemberChild = {
  name: string;
  birthDate?: string;
};

export type UserProfile = {
  id: string;
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
};
