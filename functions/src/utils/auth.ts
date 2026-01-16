import { auth } from "../firebaseAdmin";

export enum UserRole {
  Admin = 0,
  Secretaria = 1,
  Midia = 2,
}

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
    const role = decoded.role as UserRole | undefined;
    const active = Boolean(decoded.active);

    if (
      typeof role !== "number" ||
      ![UserRole.Admin, UserRole.Secretaria, UserRole.Midia].includes(role)
    ) {
      response.status(403).send("Permissão insuficiente.");
      return null;
    }

    return {
      uid: decoded.uid,
      role,
      active,
      email: decoded.email,
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
