import * as admin from "firebase-admin";
import {onRequest} from "firebase-functions/v2/https";
import {DatabaseTableKeys} from "../enums/app";
import {auth, firestore} from "../firebaseAdmin";
import {generateSecurePassword, normalizeText} from "../helpers/common";
import {IAccessRequest, IUser} from "../models";
import {corsHandler, requireAuth, requireRoles, UserRole} from "../utils";

const USER_CONFIG = {
  maxInstances: 10,
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

const findMemberByNormalized = async (
  fullname: string,
  email: string,
  normalizedFullname: string,
  normalizedEmail: string
) => {
  const normalizedSnapshot = await firestore
    .collection(DatabaseTableKeys.Members)
    .where("normalizedFullname", "==", normalizedFullname)
    .where("normalizedEmail", "==", normalizedEmail)
    .limit(1)
    .get();

  if (!normalizedSnapshot.empty) {
    const doc = normalizedSnapshot.docs[0];
    return {id: doc.id, data: doc.data()};
  }

  const legacySnapshot = await firestore
    .collection(DatabaseTableKeys.Members)
    .where("fullname", "==", fullname)
    .where("email", "==", email)
    .limit(1)
    .get();

  if (legacySnapshot.empty) {
    return null;
  }

  const doc = legacySnapshot.docs[0];
  return {id: doc.id, data: doc.data()};
};

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

        const normalizedFullname = normalizeText(fullname);
        const normalizedEmail = normalizeText(email);

        const accessRequest: IAccessRequest = {
          fullname: fullname.trim(),
          email: email.trim(),
          normalizedFullname,
          normalizedEmail,
          status: "pending",
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
        };

        await firestore
          .collection(DatabaseTableKeys.AccessRequests)
          .add(accessRequest);

        const recipients = await getUsersByRoles(["admin", "secretaria"]);

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
      if (!context || !requireRoles(context, ["admin"], response)) {
        return;
      }

      try {
        const {fullname, email, role} = request.body || {};
        const allowedRoles: UserRole[] = ["admin", "secretaria", "midia"];
        const roleValue = String(role || "").trim().toLowerCase();

        if (!fullname?.trim() || !email?.trim() || !roleValue) {
          response.status(400).send("Dados incompletos ou inválidos!");
          return;
        }

        const normalizedRole = roleValue as UserRole;

        if (!allowedRoles.includes(normalizedRole)) {
          response.status(400).send("Perfil inválido.");
          return;
        }

        const normalizedFullname = normalizeText(fullname);
        const normalizedEmail = normalizeText(email);
        const password = generateSecurePassword();

        const existing = await firestore
          .collection(DatabaseTableKeys.Users)
          .where("normalizedEmail", "==", normalizedEmail)
          .where("normalizedFullname", "==", normalizedFullname)
          .limit(1)
          .get();

        if (!existing.empty) {
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
          email.trim(),
          normalizedFullname,
          normalizedEmail
        );

        const userDoc: IUser = {
          authUid: authUser.uid,
          fullname: fullname.trim(),
          email: email.trim(),
          role: normalizedRole,
          active: true,
          memberId: memberMatch?.id,
          normalizedFullname,
          normalizedEmail,
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
              normalizedFullname,
              normalizedEmail,
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
        !requireRoles(context, ["admin", "secretaria", "midia"], response)
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

        if (targetUid !== context.uid && context.role === "midia") {
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
        const normalizedFullname = normalizeText(fullname);
        const normalizedEmail = normalizeText(email);

        const {active, role, ...safePayload} = payload;
        void active;
        void role;
        const updatePayload = {
          ...safePayload,
          fullname,
          email,
          normalizedFullname,
          normalizedEmail,
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
              normalizedFullname,
              normalizedEmail,
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
        !requireRoles(context, ["admin", "secretaria"], response)
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
        !requireRoles(context, ["admin", "secretaria"], response)
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
        !requireRoles(context, ["admin", "secretaria", "midia"], response)
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
