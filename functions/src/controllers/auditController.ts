import * as admin from "firebase-admin";
import { onRequest } from "firebase-functions/v2/https";
import { DatabaseTableKeys } from "../enums/app";
import { firestore } from "../firebaseAdmin";
import { corsHandler, requireAuth, requireRoles, UserRole } from "../utils";

const AUDIT_CONFIG = {
  maxInstances: 10,
  invoker: "public",
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
