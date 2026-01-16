import * as admin from "firebase-admin";
import { DatabaseTableKeys } from "../enums/app";
import { firestore } from "../firebaseAdmin";
import { AuthContext } from "./auth";

type AuditActor = {
  uid?: string;
  email?: string;
  role?: number;
};

type AuditEvent = {
  action: string;
  targetType?: string;
  targetId?: string;
  metadata?: Record<string, unknown>;
  actor?: AuditActor;
};

export const logAuditEvent = async (
  event: AuditEvent,
  context?: AuthContext | null
) => {
  try {
    const actor: AuditActor = {
      uid: event.actor?.uid ?? context?.uid,
      email: event.actor?.email ?? context?.email,
      role: event.actor?.role ?? context?.role,
    };

    await firestore.collection(DatabaseTableKeys.AuditLogs).add({
      ...event,
      actor,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
  } catch (error) {
    console.error("Erro ao registrar auditoria:", error);
  }
};
