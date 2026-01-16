import { User } from "firebase/auth";
import { UserProfile, UserRole } from "@/types/user";

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
