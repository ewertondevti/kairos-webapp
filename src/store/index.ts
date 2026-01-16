import { User } from "firebase/auth";
import { UserProfile, UserRole } from "@/types/user";
import { createContext, useContext } from "react";
import { AppContext } from "./context/AppProvider";

interface AuthContextType {
  user: User | null;
  role?: UserRole | null;
  active?: boolean;
  profile?: UserProfile | null;
  loading?: boolean;
}

const AuthContext = createContext<AuthContextType>({ user: null });

export const useAuth = () => useContext(AuthContext);
export const useAppState = () => useContext(AppContext);

export default AuthContext;
