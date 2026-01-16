'use client';

import firebaseDB, { firebaseAuth } from "@/firebase";
import AuthContext from "@/store";
import { UserProfile, UserRole } from "@/types/user";
import { onAuthStateChanged, User, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { FC, ReactNode, useEffect, useState } from "react";

type Props = {
  children: ReactNode;
};

const AuthProvider: FC<Props> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [active, setActive] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(firebaseAuth, async (user) => {
      setLoading(true);
      setUser(user);
      setRole(null);
      setActive(false);
      setProfile(null);

      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const tokenResult = await user.getIdTokenResult(true);
        const claimRole = tokenResult.claims.role as UserRole | undefined;
        const claimActive = Boolean(tokenResult.claims.active);

        if (!claimRole || !claimActive) {
          await signOut(firebaseAuth);
          setLoading(false);
          return;
        }

        setRole(claimRole);
        setActive(claimActive);

        const userDoc = await getDoc(doc(firebaseDB, "users", user.uid));
        if (userDoc.exists()) {
          const profileData = userDoc.data() as UserProfile;
          setProfile({ ...profileData, id: userDoc.id });
        }
      } catch (error) {
        console.error("Erro ao carregar sessão:", error);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, role, active, profile, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
