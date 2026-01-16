import * as admin from "firebase-admin";
import {onRequest} from "firebase-functions/v2/https";
import {DatabaseTableKeys} from "../enums/app";
import {auth, firestore} from "../firebaseAdmin";
import {generateSecurePassword, normalizeText} from "../helpers/common";
import {IAccessRequest, IUser} from "../models";
import {IMember} from "../models/member";
import {corsHandler, requireAuth, requireRoles, UserRole} from "../utils";

const USER_CONFIG = {
  maxInstances: 10,
  invoker: "public",
};

const getUsersByRoles = async (roles: UserRole[]) => {
  const snapshot = await firestore
    .collection(DatabaseTableKeys.Users)
    .where("role", "in", roles)
    .where("active", "==", true)
    .get();

  return snapshot.docs
    .map((doc) => doc.data() as IUser)
    .filter((user) => user.email?.trim())
    .map((user) => user.email.trim());
};

const sendMail = async (to: string[], subject: string, html: string) => {
  if (!to.length) {
    return;
  }

  await firestore.collection("mail").add({
    to,
    message: {
      subject,
      html,
    },
  });
};

const normalizeComparable = (value?: string) => normalizeText(value ?? "");

const findMemberByNormalized = async (fullname: string, email: string) => {
  const normalizedFullname = normalizeComparable(fullname);
  const normalizedEmail = normalizeComparable(email);

  const snapshot = await firestore
    .collection(DatabaseTableKeys.Members)
    .get();

  const match = snapshot.docs.find((doc) => {
    const member = doc.data() as IMember;
    return (
      normalizeComparable(member.fullname) === normalizedFullname &&
      normalizeComparable(member.email) === normalizedEmail
    );
  });

  return match ? {id: match.id, data: match.data()} : null;
};

const findUserByNormalized = async (fullname: string, email: string) => {
  const normalizedFullname = normalizeComparable(fullname);
  const normalizedEmail = normalizeComparable(email);

  const snapshot = await firestore
    .collection(DatabaseTableKeys.Users)
    .get();

  const match = snapshot.docs.find((doc) => {
    const user = doc.data() as IUser;
    return (
      normalizeComparable(user.fullname) === normalizedFullname &&
      normalizeComparable(user.email) === normalizedEmail
    );
  });

  return match ? {id: match.id, data: match.data()} : null;
};

const parseUserRole = (value: unknown) => {
  if (typeof value === "number" && [0, 1, 2].includes(value)) {
    return value as UserRole;
  }

  const roleValue = Number(value);
  return [0, 1, 2].includes(roleValue) ? (roleValue as UserRole) : null;
};

const isValidUserRole = (value: unknown): value is UserRole =>
  typeof value === "number" && [0, 1, 2].includes(value);

const getMemberById = async (memberId?: string) => {
  if (!memberId) {
    return null;
  }

  const doc = await firestore
    .collection(DatabaseTableKeys.Members)
    .doc(memberId)
    .get();

  if (!doc.exists) {
    return null;
  }

  return {id: doc.id, data: doc.data()};
};

export const requestAccess = onRequest(
  USER_CONFIG,
  async (request, response) => {
    corsHandler(request, response, async () => {
      if (request.method === "OPTIONS") {
        response.status(204).send();
        return;
      }

      if (request.method !== "POST") {
        response.set("Allow", "POST");
        response.status(405).send("Método não permitido. Use POST.");
        return;
      }

      try {
        const {fullname, email} = request.body || {};

        if (!fullname?.trim() || !email?.trim()) {
          response.status(400).send("Dados incompletos ou inválidos!");
          return;
        }

        const accessRequest: IAccessRequest = {
          fullname: fullname.trim(),
          email: email.trim(),
          status: "pending",
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
        };

        await firestore
          .collection(DatabaseTableKeys.AccessRequests)
          .add(accessRequest);

        const recipients = await getUsersByRoles([
          UserRole.Admin,
          UserRole.Secretaria,
        ]);

        await sendMail(
          recipients,
          "Novo pedido de acesso",
          `<p>Novo pedido de acesso recebido.</p>
           <p><strong>Nome:</strong> ${accessRequest.fullname}</p>
           <p><strong>Email:</strong> ${accessRequest.email}</p>`
        );

        response.status(201).send();
      } catch (error) {
        console.error("Erro ao solicitar acesso:", error);
        response.status(500).send("Erro ao solicitar acesso.");
      }
    });
  }
);

export const syncUserClaims = onRequest(
  USER_CONFIG,
  async (request, response) => {
    corsHandler(request, response, async () => {
      if (request.method === "OPTIONS") {
        response.status(204).send();
        return;
      }

      if (request.method !== "POST") {
        response.set("Allow", "POST");
        response.status(405).send("Método não permitido. Use POST.");
        return;
      }

      const authorization = request.headers.authorization || "";
      if (!authorization.startsWith("Bearer ")) {
        response.status(401).send("Token não fornecido.");
        return;
      }

      try {
        const token = authorization.replace("Bearer ", "").trim();
        const decoded = await auth.verifyIdToken(token);

        const userRef = firestore
          .collection(DatabaseTableKeys.Users)
          .doc(decoded.uid);
        const userSnap = await userRef.get();

        const safeFullname =
          decoded.name?.trim() || decoded.email?.trim() || "Usuário";
        const safeEmail = decoded.email?.trim() || "";

        if (!userSnap.exists) {
          const userDoc: IUser = {
            authUid: decoded.uid,
            fullname: safeFullname,
            email: safeEmail,
            role: UserRole.Admin,
            active: true,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            createdBy: decoded.uid,
          };

          await userRef.set(userDoc);

          await auth.setCustomUserClaims(decoded.uid, {
            role: UserRole.Admin,
            active: true,
          });

          response.status(200).json({
            role: UserRole.Admin,
            active: true,
          });
          return;
        }

        const user = userSnap.data() as IUser;
        const role = isValidUserRole(user.role) ? user.role : UserRole.Admin;
        const active = typeof user.active === "boolean" ? user.active : true;
        const fullname = user.fullname?.trim() || safeFullname;
        const email = user.email?.trim() || safeEmail;
        const shouldUpdate =
          role !== user.role ||
          active !== user.active ||
          fullname !== user.fullname ||
          email !== user.email;

        if (shouldUpdate) {
          await userRef.update({
            role,
            active,
            fullname,
            email,
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          });
        }

        await auth.setCustomUserClaims(decoded.uid, {
          role,
          active,
        });

        if (!active) {
          await auth.revokeRefreshTokens(decoded.uid);
        }

        response.status(200).json({ role, active });
      } catch (error) {
        console.error("Erro ao sincronizar claims:", error);
        response.status(500).send("Erro ao sincronizar claims.");
      }
    });
  }
);

export const createUser = onRequest(
  USER_CONFIG,
  async (request, response) => {
    corsHandler(request, response, async () => {
      if (request.method === "OPTIONS") {
        response.status(204).send();
        return;
      }

      if (request.method !== "POST") {
        response.set("Allow", "POST");
        response.status(405).send("Método não permitido. Use POST.");
        return;
      }

      const context = await requireAuth(request, response);
      if (!context || !requireRoles(context, [UserRole.Admin], response)) {
        return;
      }

      try {
        const {fullname, email, role} = request.body || {};
        const normalizedRole = parseUserRole(role);

        if (!fullname?.trim() || !email?.trim() || normalizedRole === null) {
          response.status(400).send("Dados incompletos ou inválidos!");
          return;
        }

        const password = generateSecurePassword();

        const existing = await findUserByNormalized(
          fullname.trim(),
          email.trim()
        );

        if (existing) {
          response.status(409).send("Usuário já existe.");
          return;
        }

        const authUser = await auth.createUser({
          email: email.trim(),
          password,
          displayName: fullname.trim(),
        });

        const memberMatch = await findMemberByNormalized(
          fullname.trim(),
          email.trim()
        );

        const userDoc: IUser = {
          authUid: authUser.uid,
          fullname: fullname.trim(),
          email: email.trim(),
          role: normalizedRole,
          active: true,
          memberId: memberMatch?.id,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          createdBy: context.uid,
        };

        await firestore
          .collection(DatabaseTableKeys.Users)
          .doc(authUser.uid)
          .set(userDoc);

        await auth.setCustomUserClaims(authUser.uid, {
          role: normalizedRole,
          active: true,
        });

        if (memberMatch?.id) {
          await firestore
            .collection(DatabaseTableKeys.Members)
            .doc(memberMatch.id)
            .update({
              isActive: true,
            });
        }

        await sendMail(
          [userDoc.email],
          "Seus dados de acesso",
          `<p>Olá, ${userDoc.fullname}.</p>
           <p>Seu acesso foi criado com sucesso.</p>
           <p><strong>Email:</strong> ${userDoc.email}</p>
           <p><strong>Senha temporária:</strong> ${password}</p>
           <p>Recomendamos alterar a senha após o primeiro acesso.</p>`
        );

        response.status(201).send({uid: authUser.uid});
      } catch (error) {
        console.error("Erro ao criar usuário:", error);
        response.status(500).send("Erro ao criar usuário.");
      }
    });
  }
);

export const setUserRole = onRequest(
  USER_CONFIG,
  async (request, response) => {
    corsHandler(request, response, async () => {
      if (request.method === "OPTIONS") {
        response.status(204).send();
        return;
      }

      if (request.method !== "PATCH") {
        response.set("Allow", "PATCH");
        response.status(405).send("Método não permitido. Use PATCH.");
        return;
      }

      const context = await requireAuth(request, response);
      if (!context || !requireRoles(context, [UserRole.Admin], response)) {
        return;
      }

      try {
        const {uid, role} = request.body || {};
        const normalizedRole = parseUserRole(role);

        if (!uid?.trim() || normalizedRole === null) {
          response.status(400).send("Dados incompletos ou inválidos!");
          return;
        }

        const userRef = firestore.collection(DatabaseTableKeys.Users).doc(uid);
        const userSnap = await userRef.get();

        if (!userSnap.exists) {
          response.status(404).send("Usuário não encontrado.");
          return;
        }

        const user = userSnap.data() as IUser;

        await userRef.update({
          role: normalizedRole,
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        await auth.setCustomUserClaims(uid, {
          role: normalizedRole,
          active: user.active,
        });

        response.status(200).send();
      } catch (error) {
        console.error("Erro ao atualizar perfil:", error);
        response.status(500).send("Erro ao atualizar perfil.");
      }
    });
  }
);

export const updateUserProfile = onRequest(
  USER_CONFIG,
  async (request, response) => {
    corsHandler(request, response, async () => {
      if (request.method === "OPTIONS") {
        response.status(204).send();
        return;
      }

      if (request.method !== "PATCH") {
        response.set("Allow", "PATCH");
        response.status(405).send("Método não permitido. Use PATCH.");
        return;
      }

      const context = await requireAuth(request, response);
      if (
        !context ||
        !requireRoles(
          context,
          [UserRole.Admin, UserRole.Secretaria, UserRole.Midia],
          response
        )
      ) {
        return;
      }

      try {
        const {uid, payload} = request.body || {};
        const targetUid = uid || context.uid;

        if (!payload || !targetUid) {
          response.status(400).send("Dados incompletos ou inválidos!");
          return;
        }

        if (targetUid !== context.uid && context.role === UserRole.Midia) {
          response.status(403).send("Permissão insuficiente.");
          return;
        }

        const userRef = firestore
          .collection(DatabaseTableKeys.Users)
          .doc(targetUid);
        const userSnap = await userRef.get();

        if (!userSnap.exists) {
          response.status(404).send("Usuário não encontrado.");
          return;
        }

        const user = userSnap.data() as IUser;
        const fullname = payload.fullname?.trim() || user.fullname;
        const email = payload.email?.trim() || user.email;
        const {active, role, ...safePayload} = payload;
        void active;
        void role;
        const updatePayload = {
          ...safePayload,
          fullname,
          email,
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        };

        await userRef.update(updatePayload);

        if (payload.email || payload.fullname) {
          await auth.updateUser(targetUid, {
            email,
            displayName: fullname,
          });
        }

        if (user.memberId) {
          await firestore
            .collection(DatabaseTableKeys.Members)
            .doc(user.memberId)
            .update({
              ...safePayload,
              fullname,
              email,
            });
        }

        response.status(200).send();
      } catch (error) {
        console.error("Erro ao atualizar usuário:", error);
        response.status(500).send("Erro ao atualizar usuário.");
      }
    });
  }
);

export const setUserActive = onRequest(
  USER_CONFIG,
  async (request, response) => {
    corsHandler(request, response, async () => {
      if (request.method === "OPTIONS") {
        response.status(204).send();
        return;
      }

      if (request.method !== "PATCH") {
        response.set("Allow", "PATCH");
        response.status(405).send("Método não permitido. Use PATCH.");
        return;
      }

      const context = await requireAuth(request, response);
      if (
        !context ||
        !requireRoles(
          context,
          [UserRole.Admin, UserRole.Secretaria],
          response
        )
      ) {
        return;
      }

      try {
        const {uid, active} = request.body || {};

        if (!uid || typeof active !== "boolean") {
          response.status(400).send("Dados incompletos ou inválidos!");
          return;
        }

        const userRef = firestore
          .collection(DatabaseTableKeys.Users)
          .doc(uid);
        const userSnap = await userRef.get();

        if (!userSnap.exists) {
          response.status(404).send("Usuário não encontrado.");
          return;
        }

        const user = userSnap.data() as IUser;

        await userRef.update({
          active,
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        await auth.setCustomUserClaims(uid, {
          role: user.role,
          active,
        });

        if (!active) {
          await auth.revokeRefreshTokens(uid);
        }

        if (user.memberId) {
          await firestore
            .collection(DatabaseTableKeys.Members)
            .doc(user.memberId)
            .update({isActive: active});
        }

        response.status(200).send();
      } catch (error) {
        console.error("Erro ao atualizar status:", error);
        response.status(500).send("Erro ao atualizar status.");
      }
    });
  }
);

export const getUsers = onRequest(
  USER_CONFIG,
  async (request, response) => {
    corsHandler(request, response, async () => {
      if (request.method === "OPTIONS") {
        response.status(204).send();
        return;
      }

      if (request.method !== "GET") {
        response.set("Allow", "GET");
        response.status(405).send("Método não permitido. Use GET.");
        return;
      }

      const context = await requireAuth(request, response);
      if (
        !context ||
        !requireRoles(context, [UserRole.Admin, UserRole.Secretaria], response)
      ) {
        return;
      }

      try {
        const snapshot = await firestore
          .collection(DatabaseTableKeys.Users)
          .orderBy("fullname")
          .get();

        const users = await Promise.all(
          snapshot.docs.map(async (doc) => {
            const user = doc.data() as IUser;
            const member = await getMemberById(user.memberId);
            return {
              id: doc.id,
              ...user,
              member: member ? {id: member.id, ...member.data} : null,
            };
          })
        );

        response.status(200).json(users);
      } catch (error) {
        console.error("Erro ao buscar usuários:", error);
        response.status(500).send("Erro ao buscar usuários.");
      }
    });
  }
);

export const getUserProfile = onRequest(
  USER_CONFIG,
  async (request, response) => {
    corsHandler(request, response, async () => {
      if (request.method === "OPTIONS") {
        response.status(204).send();
        return;
      }

      if (request.method !== "GET") {
        response.set("Allow", "GET");
        response.status(405).send("Método não permitido. Use GET.");
        return;
      }

      const context = await requireAuth(request, response);
      if (
        !context ||
        !requireRoles(
          context,
          [UserRole.Admin, UserRole.Secretaria, UserRole.Midia],
          response
        )
      ) {
        return;
      }

      try {
        const userSnap = await firestore
          .collection(DatabaseTableKeys.Users)
          .doc(context.uid)
          .get();

        if (!userSnap.exists) {
          response.status(404).send("Usuário não encontrado.");
          return;
        }

        const user = userSnap.data() as IUser;
        const member = await getMemberById(user.memberId);

        response.status(200).json({
          user: {id: userSnap.id, ...user},
          member: member ? {id: member.id, ...member.data} : null,
        });
      } catch (error) {
        console.error("Erro ao buscar perfil:", error);
        response.status(500).send("Erro ao buscar perfil.");
      }
    });
  }
);
