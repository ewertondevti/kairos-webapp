export interface IMemberPhoto {
  file: string;
  filename: string;
  type: string;
}

export interface IMemberPayload {
  photo?: IMemberPhoto;
  fullname: string;
  email: string;
  birthDate: string;
  gender: number;
  maritalStatus: number;
  postalCode: string;
  address: string;
  city: string;
  county: string;
  state: string;
  motherName?: string;
  fatherName?: string;
  spouseName?: string;
  weddingDate: string;
  children: string[];
  baptismChurch?: string;
  baptismDate?: string;
  admissionType?: string;
  baptizedPastor?: string;
  admissionDate?: string;
  congregation?: string;
  churchRole?: string;
  belongsTo?: string;
  isActive?: boolean;
  normalizedFullname?: string;
  normalizedEmail?: string;
}

export interface IMember {
  photo?: string;
  fullname: string;
  email: string;
  birthDate: string;
  gender: number;
  maritalStatus: number;
  postalCode: string;
  address: string;
  city: string;
  county: string;
  state: string;
  motherName?: string;
  fatherName?: string;
  spouseName?: string;
  weddingDate: string;
  children: string[];
  baptismChurch?: string;
  baptismDate?: string;
  admissionType?: string;
  baptizedPastor?: string;
  admissionDate?: string;
  congregation?: string;
  churchRole?: string;
  belongsTo?: string;
  isActive?: boolean;
  normalizedFullname?: string;
  normalizedEmail?: string;
}
