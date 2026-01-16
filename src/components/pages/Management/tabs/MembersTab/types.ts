import { UserRole } from "@/types/user";

export type CreateFormValues = {
  fullname: string;
  email: string;
  role: UserRole;
};
