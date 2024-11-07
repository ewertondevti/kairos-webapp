import { User } from "firebase/auth";
import { createContext, useContext } from "react";
import { AppContext } from "./context/AppProvider";

interface AuthContextType {
  user: User | null;
}

const AuthContext = createContext<AuthContextType>({ user: null });

export const useAuth = () => useContext(AuthContext);
export const useAppState = () => useContext(AppContext);

export default AuthContext;
