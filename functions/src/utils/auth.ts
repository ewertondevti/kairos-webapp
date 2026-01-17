import { DatabaseTableKeys } from "../enums/app";
import { UserRole } from "../enums/auth";
import { auth, firestore } from "../firebaseAdmin";

type RequestLike = {
  headers: {
    authorization?: string;
  };
};

type ResponseLike = {
  status: (_code: number) => ResponseLike;
  send: (_body?: string) => void;
};

export type AuthContext = {
  uid: string;
  role: UserRole;
  active: boolean;
  email?: string;
};

const getBearerToken = (request: RequestLike) => {
  const header = request.headers.authorization || "";
  if (!header.startsWith("Bearer ")) {
    return null;
  }
  return header.replace("Bearer ", "").trim();
};

export const requireAuth = async (
  request: RequestLike,
  response: ResponseLike
): Promise<AuthContext | null> => {
  const token = getBearerToken(request);

  if (!token) {
    response.status(401).send("Token não fornecido.");
    return null;
  }

  try {
    const decoded = await auth.verifyIdToken(token);
    let role = decoded.role as UserRole | undefined;
    let active =
      typeof decoded.active === "boolean" ? decoded.active : undefined;
    let email = decoded.email;

    const hasValidRole =
      typeof role === "number" &&
      [
        UserRole.Admin,
        UserRole.Secretaria,
        UserRole.Midia,
        UserRole.Member,
      ].includes(role);

    const hasActiveClaim = typeof active === "boolean";

    if (!hasValidRole || !hasActiveClaim) {
      try {
        const userSnap = await firestore
          .collection(DatabaseTableKeys.Users)
          .doc(decoded.uid)
          .get();

        if (userSnap.exists) {
          const userData = userSnap.data() as {
            role?: UserRole;
            active?: boolean;
            email?: string;
          };
          const roleFromDb = userData.role;
          const activeFromDb = userData.active;

          if (
            typeof roleFromDb === "number" &&
            [
              UserRole.Admin,
              UserRole.Secretaria,
              UserRole.Midia,
              UserRole.Member,
            ].includes(roleFromDb)
          ) {
            role = roleFromDb;
          }

          if (typeof activeFromDb === "boolean") {
            active = activeFromDb;
          }

          if (!email && userData.email?.trim()) {
            email = userData.email.trim();
          }

          const canPersistClaims =
            typeof role === "number" && typeof active === "boolean";

          if (canPersistClaims && (!hasValidRole || !hasActiveClaim)) {
            await auth.setCustomUserClaims(decoded.uid, {
              role,
              active,
            });
          }
        }
      } catch (error) {
        console.error("Falha ao carregar usuário no Firestore:", error);
      }
    }

    if (
      typeof role !== "number" ||
      ![
        UserRole.Admin,
        UserRole.Secretaria,
        UserRole.Midia,
        UserRole.Member,
      ].includes(role) ||
      typeof active !== "boolean"
    ) {
      response.status(403).send("Permissão insuficiente.");
      return null;
    }

    return {
      uid: decoded.uid,
      role,
      active,
      email,
    };
  } catch (error) {
    console.error("Falha ao validar token:", error);
    response.status(401).send("Token inválido.");
    return null;
  }
};

export const requireRoles = (
  context: AuthContext,
  allowedRoles: UserRole[],
  response: ResponseLike
) => {
  if (!context.active) {
    response.status(403).send("Usuário inativo.");
    return false;
  }

  if (!allowedRoles.includes(context.role)) {
    response.status(403).send("Permissão insuficiente.");
    return false;
  }

  return true;
};
