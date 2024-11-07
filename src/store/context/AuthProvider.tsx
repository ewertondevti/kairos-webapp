import { firebaseAuth } from "@/firebase";
import AuthContext from "@/store";
import { onAuthStateChanged, User } from "firebase/auth";
import { FC, ReactNode, useEffect, useState } from "react";

type Props = {
  children: ReactNode;
};

const AuthProvider: FC<Props> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(firebaseAuth, (user) => {
      setUser(user);
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user }}>{children}</AuthContext.Provider>
  );
};

export default AuthProvider;
