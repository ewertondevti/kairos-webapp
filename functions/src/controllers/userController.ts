import * as admin from "firebase-admin";
import { onRequest } from "firebase-functions/v2/https";
import { DatabaseTableKeys } from "../enums/app";
import { auth, firestore, storage } from "../firebaseAdmin";
import {
  buildStorageFileName,
  generateSecurePassword,
  normalizeText,
} from "../helpers/common";
import { IAccessRequest, IUser } from "../models";
import { corsHandler, requireAuth, requireRoles, UserRole } from "../utils";
import { logAuditEvent } from "../utils/audit";

const USER_CONFIG = {
  maxInstances: 10,
  invoker: "public",
};

const USER_PHOTO_CACHE_CONTROL = "public, max-age=31536000, immutable";
const USER_PHOTO_URL_EXPIRES_MS = 10 * 365 * 24 * 60 * 60 * 1000;

type PhotoPayload = {
  file?: string;
  filename?: string;
  type?: string;
};

const normalizeTimestamp = (value?: admin.firestore.Timestamp | null) =>
  value ? value.toDate().toISOString() : null;

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

const isPhotoPayload = (value: unknown): value is PhotoPayload =>
  Boolean(
    value &&
      typeof value === "object" &&
      "file" in value &&
      typeof (value as PhotoPayload).file === "string"
  );

const parseDataUrl = (value: string) => {
  const match = value.match(/^data:(.+);base64,(.+)$/);
  if (!match) return null;
  return { mimeType: match[1], base64: match[2] };
};

const getExtensionFromMime = (mimeType?: string) => {
  if (!mimeType) return undefined;
  if (mimeType === "image/jpeg") return ".jpg";
  if (mimeType === "image/png") return ".png";
  if (mimeType === "image/webp") return ".webp";
  return undefined;
};

const isRemotePhotoUrl = (value: string) => /^https?:\/\//i.test(value);

const uploadUserPhoto = async (photo: PhotoPayload, uid: string) => {
  const dataUrl = photo.file?.trim();
  if (!dataUrl) {
    return undefined;
  }

  const parsed = parseDataUrl(dataUrl);
  if (!parsed) {
    return undefined;
  }

  const contentType = photo.type?.trim() || parsed.mimeType;
  if (!contentType.startsWith("image/")) {
    return undefined;
  }

  const buffer = Buffer.from(parsed.base64, "base64");
  const extension = getExtensionFromMime(contentType);
  const fileName = buildStorageFileName(photo.filename || "profile", extension);
  const destination = `${DatabaseTableKeys.Users}/${uid}/${fileName}`;
  const fileRef = storage.bucket().file(destination);

  await fileRef.save(buffer, {
    metadata: {
      contentType,
      cacheControl: USER_PHOTO_CACHE_CONTROL,
    },
  });

  const [url] = await fileRef.getSignedUrl({
    action: "read",
    expires: Date.now() + USER_PHOTO_URL_EXPIRES_MS,
  });

  return { url, storagePath: destination };
};

const getPhotoUrlFromStoragePath = async (storagePath?: string) => {
  const normalizedPath = storagePath?.trim();
  if (!normalizedPath) {
    return undefined;
  }

  try {
    const fileRef = storage.bucket().file(normalizedPath);
    const [url] = await fileRef.getSignedUrl({
      action: "read",
      expires: Date.now() + USER_PHOTO_URL_EXPIRES_MS,
    });
    return url;
  } catch (error) {
    console.warn("Erro ao gerar URL da foto:", error);
    return undefined;
  }
};

const findUserByNormalized = async (fullname: string, email: string) => {
  const normalizedFullname = normalizeComparable(fullname);
  const normalizedEmail = normalizeComparable(email);

  const snapshot = await firestore.collection(DatabaseTableKeys.Users).get();

  const match = snapshot.docs.find((doc) => {
    const user = doc.data() as IUser;
    return (
      normalizeComparable(user.fullname) === normalizedFullname &&
      normalizeComparable(user.email) === normalizedEmail
    );
  });

  return match ? { id: match.id, data: match.data() } : null;
};

const USER_ROLE_VALUES: UserRole[] = [
  UserRole.Admin,
  UserRole.Secretaria,
  UserRole.Midia,
  UserRole.Member,
];

const parseUserRole = (value: unknown) => {
  if (typeof value === "number" && USER_ROLE_VALUES.includes(value)) {
    return value as UserRole;
  }

  const roleValue = Number(value);
  return USER_ROLE_VALUES.includes(roleValue) ? (roleValue as UserRole) : null;
};

const isValidUserRole = (value: unknown): value is UserRole =>
  typeof value === "number" && USER_ROLE_VALUES.includes(value);

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
        const { fullname, email } = request.body || {};

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

        void logAuditEvent({
          action: "accessRequest.create",
          targetType: "accessRequest",
          metadata: {
            fullname: accessRequest.fullname,
            email: accessRequest.email,
            status: accessRequest.status,
          },
          actor: { email: accessRequest.email },
        });

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

export const getAccessRequests = onRequest(
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
      if (!context || !requireRoles(context, [UserRole.Admin], response)) {
        return;
      }

      try {
        const snapshot = await firestore
          .collection(DatabaseTableKeys.AccessRequests)
          .get();

        const requests = snapshot.docs.map((doc) => {
          const data = doc.data() as IAccessRequest;
          return {
            id: doc.id,
            ...data,
            createdAt: normalizeTimestamp(
              data.createdAt as admin.firestore.Timestamp
            ),
            updatedAt: normalizeTimestamp(
              data.updatedAt as admin.firestore.Timestamp
            ),
          };
        });

        response.status(200).json(requests);
      } catch (error) {
        console.error("Erro ao buscar solicitações:", error);
        response.status(500).send("Erro ao buscar solicitações.");
      }
    });
  }
);

export const updateAccessRequestStatus = onRequest(
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
        const { id, status } = request.body || {};
        const normalizedStatus = String(status || "").trim();
        const allowedStatuses = ["pending", "approved", "rejected"];

        if (!id?.trim() || !allowedStatuses.includes(normalizedStatus)) {
          response.status(400).send("Dados incompletos ou inválidos!");
          return;
        }

        const requestRef = firestore
          .collection(DatabaseTableKeys.AccessRequests)
          .doc(id);
        const requestSnap = await requestRef.get();

        if (!requestSnap.exists) {
          response.status(404).send("Solicitação não encontrada.");
          return;
        }

        await requestRef.update({
          status: normalizedStatus,
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedBy: context.uid,
        });

        void logAuditEvent(
          {
            action: "accessRequest.status.update",
            targetType: "accessRequest",
            targetId: id,
            metadata: { status: normalizedStatus },
          },
          context
        );

        response.status(200).send();
      } catch (error) {
        console.error("Erro ao atualizar solicitação:", error);
        response.status(500).send("Erro ao atualizar solicitação.");
      }
    });
  }
);

export const deleteAccessRequest = onRequest(
  USER_CONFIG,
  async (request, response) => {
    corsHandler(request, response, async () => {
      if (request.method === "OPTIONS") {
        response.status(204).send();
        return;
      }

      if (request.method !== "DELETE") {
        response.set("Allow", "DELETE");
        response.status(405).send("Método não permitido. Use DELETE.");
        return;
      }

      const context = await requireAuth(request, response);
      if (!context || !requireRoles(context, [UserRole.Admin], response)) {
        return;
      }

      try {
        const { id } = request.body || {};
        if (!id?.trim()) {
          response.status(400).send("Dados incompletos ou inválidos!");
          return;
        }

        await firestore
          .collection(DatabaseTableKeys.AccessRequests)
          .doc(id)
          .delete();

        void logAuditEvent(
          {
            action: "accessRequest.delete",
            targetType: "accessRequest",
            targetId: id,
          },
          context
        );

        response.status(200).send();
      } catch (error) {
        console.error("Erro ao excluir solicitação:", error);
        response.status(500).send("Erro ao excluir solicitação.");
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

          void logAuditEvent({
            action: "user.sync.create",
            targetType: "user",
            targetId: decoded.uid,
            metadata: { role: UserRole.Admin, active: true },
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
          void logAuditEvent({
            action: "user.sync.update",
            targetType: "user",
            targetId: decoded.uid,
            metadata: { role, active, fullname, email },
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

export const createUser = onRequest(USER_CONFIG, async (request, response) => {
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
      const { fullname, email, role } = request.body || {};
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

      const userDoc: IUser = {
        authUid: authUser.uid,
        fullname: fullname.trim(),
        email: email.trim(),
        role: normalizedRole,
        active: true,
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

      void logAuditEvent(
        {
          action: "user.create",
          targetType: "user",
          targetId: authUser.uid,
          metadata: { email: userDoc.email, fullname: userDoc.fullname },
        },
        context
      );

      await sendMail(
        [userDoc.email],
        "Seus dados de acesso",
        `<p>Olá, ${userDoc.fullname}.</p>
           <p>Seu acesso foi criado com sucesso.</p>
           <p><strong>Email:</strong> ${userDoc.email}</p>
           <p><strong>Senha temporária:</strong> ${password}</p>
           <p>Recomendamos alterar a senha após o primeiro acesso.</p>`
      );

      response.status(201).send({ uid: authUser.uid });
    } catch (error) {
      console.error("Erro ao criar usuário:", error);
      response.status(500).send("Erro ao criar usuário.");
    }
  });
});

export const createNewMember = onRequest(
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
        const { fullname, email, payload } = request.body || {};

        if (!fullname?.trim() || !email?.trim()) {
          response.status(400).send("Dados incompletos ou inválidos!");
          return;
        }

        const existing = await findUserByNormalized(
          fullname.trim(),
          email.trim()
        );

        if (existing) {
          response.status(409).send("Usuário já existe.");
          return;
        }

        const password = generateSecurePassword();

        const authUser = await auth.createUser({
          email: email.trim(),
          password,
          displayName: fullname.trim(),
        });

        const normalizedPayload =
          payload && typeof payload === "object" ? payload : {};
        const { active, role, photo, ...safePayload } =
          normalizedPayload as Record<string, unknown>;
        void active;
        void role;

        const userDoc: IUser = {
          authUid: authUser.uid,
          fullname: fullname.trim(),
          email: email.trim(),
          role: UserRole.Member,
          active: true,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          createdBy: context.uid,
          ...safePayload,
        };

        if (isPhotoPayload(photo)) {
          const uploadedPhoto = await uploadUserPhoto(photo, authUser.uid);
          if (uploadedPhoto) {
            userDoc.photo = uploadedPhoto.url;
            userDoc.photoStoragePath = uploadedPhoto.storagePath;
          }
        } else if (typeof photo === "string" && photo.trim()) {
          if (photo.startsWith("data:image/")) {
            const uploadedPhoto = await uploadUserPhoto(
              { file: photo, filename: "profile" },
              authUser.uid
            );
            if (uploadedPhoto) {
              userDoc.photo = uploadedPhoto.url;
              userDoc.photoStoragePath = uploadedPhoto.storagePath;
            }
          } else if (isRemotePhotoUrl(photo)) {
            userDoc.photo = photo;
          }
        }

        await firestore
          .collection(DatabaseTableKeys.Users)
          .doc(authUser.uid)
          .set(userDoc);

        await auth.setCustomUserClaims(authUser.uid, {
          role: UserRole.Member,
          active: true,
        });

        void logAuditEvent(
          {
            action: "member.create",
            targetType: "user",
            targetId: authUser.uid,
            metadata: { email: userDoc.email, fullname: userDoc.fullname },
          },
          context
        );

        await sendMail(
          [userDoc.email],
          "Seus dados de acesso",
          `<p>Olá, ${userDoc.fullname}.</p>
           <p>Seu acesso foi criado com sucesso.</p>
           <p><strong>Email:</strong> ${userDoc.email}</p>
           <p><strong>Senha temporária:</strong> ${password}</p>
           <p>Recomendamos alterar a senha após o primeiro acesso.</p>`
        );

        response.status(201).send({ uid: authUser.uid });
      } catch (error) {
        console.error("Erro ao criar membro:", error);
        response.status(500).send("Erro ao criar membro.");
      }
    });
  }
);

export const setUserRole = onRequest(USER_CONFIG, async (request, response) => {
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
      const { uid, role } = request.body || {};
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

      void logAuditEvent(
        {
          action: "user.role.update",
          targetType: "user",
          targetId: uid,
          metadata: { role: normalizedRole },
        },
        context
      );

      response.status(200).send();
    } catch (error) {
      console.error("Erro ao atualizar perfil:", error);
      response.status(500).send("Erro ao atualizar perfil.");
    }
  });
});

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
        const { uid, payload } = request.body || {};
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
        const { active, role, photo, ...safePayload } = payload;
        void active;
        void role;

        const updatePayload: Record<string, unknown> = {
          ...safePayload,
          fullname,
          email,
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        };

        if (isPhotoPayload(photo)) {
          const uploadedPhoto = await uploadUserPhoto(photo, targetUid);
          if (uploadedPhoto) {
            updatePayload.photo = uploadedPhoto.url;
            updatePayload.photoStoragePath = uploadedPhoto.storagePath;
          }
        } else if (typeof photo === "string" && photo.trim()) {
          if (photo.startsWith("data:image/")) {
            const uploadedPhoto = await uploadUserPhoto(
              { file: photo, filename: "profile" },
              targetUid
            );
            if (uploadedPhoto) {
              updatePayload.photo = uploadedPhoto.url;
              updatePayload.photoStoragePath = uploadedPhoto.storagePath;
            }
          } else if (isRemotePhotoUrl(photo)) {
            updatePayload.photo = photo;
          }
        }

        await userRef.update(updatePayload);

        if (payload.email || payload.fullname) {
          await auth.updateUser(targetUid, {
            email,
            displayName: fullname,
          });
        }

        void logAuditEvent(
          {
            action: "user.profile.update",
            targetType: "user",
            targetId: targetUid,
            metadata: { fields: Object.keys(payload || {}) },
          },
          context
        );

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
        !requireRoles(context, [UserRole.Admin, UserRole.Secretaria], response)
      ) {
        return;
      }

      try {
        const { uid, active } = request.body || {};

        if (!uid || typeof active !== "boolean") {
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

        void logAuditEvent(
          {
            action: "user.active.update",
            targetType: "user",
            targetId: uid,
            metadata: { active },
          },
          context
        );

        response.status(200).send();
      } catch (error) {
        console.error("Erro ao atualizar status:", error);
        response.status(500).send("Erro ao atualizar status.");
      }
    });
  }
);

export const getUsers = onRequest(USER_CONFIG, async (request, response) => {
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
          const data = doc.data() as IUser;
          const fallbackPhoto =
            !data.photo && data.photoStoragePath
              ? await getPhotoUrlFromStoragePath(data.photoStoragePath)
              : undefined;

          return {
            id: doc.id,
            ...data,
            photo: data.photo || fallbackPhoto,
          };
        })
      );

      response.status(200).json(users);
    } catch (error) {
      console.error("Erro ao buscar usuários:", error);
      response.status(500).send("Erro ao buscar usuários.");
    }
  });
});

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
        const userRef = firestore
          .collection(DatabaseTableKeys.Users)
          .doc(context.uid);
        const userSnap = await userRef.get();

        if (!userSnap.exists) {
          response.status(404).send("Usuário não encontrado.");
          return;
        }

        const user = userSnap.data() as IUser;
        const fallbackPhoto =
          !user.photo && user.photoStoragePath
            ? await getPhotoUrlFromStoragePath(user.photoStoragePath)
            : undefined;

        response.status(200).json({
          user: {
            id: userSnap.id,
            ...user,
            photo: user.photo || fallbackPhoto,
          },
        });
      } catch (error) {
        console.error("Erro ao buscar perfil:", error);
        response.status(500).send("Erro ao buscar perfil.");
      }
    });
  }
);
