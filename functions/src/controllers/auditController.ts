import * as admin from "firebase-admin";
import { onRequest } from "firebase-functions/v2/https";
import { DatabaseTableKeys } from "../enums/app";
import { firestore } from "../firebaseAdmin";
import { corsHandler, requireAuth, requireRoles, UserRole } from "../utils";

const AUDIT_CONFIG = {
  maxInstances: 10,
  invoker: "public",
};

const parseLimit = (value?: string) => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return 200;
  }
  return Math.min(parsed, 500);
};

export const createAuditLog = onRequest(
  AUDIT_CONFIG,
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
        const payload = request.body || {};
        const action = String(payload.action || "").trim();

        if (!action) {
          response.status(400).send("Dados incompletos ou inválidos!");
          return;
        }

        const actor = {
          ...(payload.actor || {}),
          uid: payload.actor?.uid ?? context.uid,
          email: payload.actor?.email ?? context.email ?? "",
          role: payload.actor?.role ?? context.role,
        };

        await firestore.collection(DatabaseTableKeys.AuditLogs).add({
          ...payload,
          action,
          actor,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        response.status(201).send();
      } catch (error) {
        console.error("Erro ao registrar auditoria:", error);
        response.status(500).send("Erro ao registrar auditoria.");
      }
    });
  }
);

export const getAuditLogs = onRequest(
  AUDIT_CONFIG,
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
        const limitParam = request.query.limit as string | undefined;
        const limit = parseLimit(limitParam);

        const snapshot = await firestore
          .collection(DatabaseTableKeys.AuditLogs)
          .orderBy("createdAt", "desc")
          .limit(limit)
          .get();

        const logs = snapshot.docs.map((doc) => {
          const data = doc.data() as Record<string, unknown>;
          const createdAt = data.createdAt as admin.firestore.Timestamp | null;
          return {
            id: doc.id,
            ...data,
            createdAt: createdAt ? createdAt.toDate().toISOString() : null,
          };
        });

        response.status(200).json(logs);
      } catch (error) {
        console.error("Erro ao buscar auditoria:", error);
        response.status(500).send("Erro ao buscar auditoria.");
      }
    });
  }
);
