import { UserRole } from "@/features/auth/auth.enums";

export type CreateFormValues = {
  fullname: string;
  email: string;
  role: UserRole;
};
