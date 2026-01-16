"use client";

import firebaseDB, { firebaseAuth } from "@/firebase";
import { syncUserClaims } from "@/services/userServices";
import AuthContext from "@/store";
import { UserProfile, UserRole } from "@/types/user";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
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
  const parseRole = (value: unknown): UserRole | null => {
    if (typeof value === "number" && [0, 1, 2].includes(value)) {
      return value as UserRole;
    }

    const parsedValue = Number(value);
    return [0, 1, 2].includes(parsedValue)
      ? (parsedValue as UserRole)
      : null;
  };

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
        let claimRole = parseRole(tokenResult.claims.role);
        let activeClaim = tokenResult.claims.active as boolean | undefined;

        if (claimRole === null || typeof activeClaim !== "boolean") {
          try {
            await syncUserClaims();
            const refreshedToken = await user.getIdTokenResult(true);
            claimRole = parseRole(refreshedToken.claims.role);
            activeClaim = refreshedToken.claims.active as boolean | undefined;
          } catch (syncError) {
            console.error("Erro ao sincronizar claims:", syncError);
          }
        }

        const hasActiveClaim = typeof activeClaim === "boolean";
        const claimActive = Boolean(activeClaim);

        if (claimRole === null || !hasActiveClaim || !claimActive) {
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
