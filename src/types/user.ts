export enum UserRole {
  Admin = 0,
  Secretaria = 1,
  Midia = 2,
}

export type UserProfile = {
  id: string;
  authUid: string;
  fullname: string;
  email: string;
  role: UserRole;
  active: boolean;
  memberId?: string;
  member?: MemberProfile | null;
};

export type MemberProfile = {
  id: string;
  fullname: string;
  email: string;
  birthDate?: string;
  gender?: number;
  maritalStatus?: number;
  postalCode?: string;
  address?: string;
  city?: string;
  county?: string;
  state?: string;
  motherName?: string;
  fatherName?: string;
  spouseName?: string;
  weddingDate?: string;
  children?: string[];
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
