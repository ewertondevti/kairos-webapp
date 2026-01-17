import { User } from "firebase/auth";
import { UserRole } from "@/features/auth/auth.enums";
import { UserProfile } from "@/types/user";

export type LoginFormType = {
  email: string;
  password: string;
};

export interface AuthContextType {
  user: User | null;
  role?: UserRole | null;
  active?: boolean;
  profile?: UserProfile | null;
  loading?: boolean;
}
