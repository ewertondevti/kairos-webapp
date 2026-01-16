import { firebaseAuth } from "@/firebase";
import axios from "axios";
import { getAuthHeaders } from "@/services/authHeaders";
import { AuditLogEntry } from "@/types/audit";

type AuditActor = {
  uid?: string | null;
  email?: string | null;
  role?: number | null;
};

export type AuditEvent = {
  action: string;
  targetType?: string;
  targetId?: string | null;
  metadata?: Record<string, unknown>;
  actor?: AuditActor;
};

export const logAuditEvent = async (event: AuditEvent) => {
  try {
    const currentUser = firebaseAuth.currentUser;
    const actor: AuditActor = {
      uid: event.actor?.uid ?? currentUser?.uid ?? null,
      email: event.actor?.email ?? currentUser?.email ?? null,
      role: event.actor?.role ?? null,
    };

    const headers = await getAuthHeaders();
    await axios.post(
      "/api/audit-logs",
      {
        ...event,
        actor,
      },
      { headers }
    );
  } catch (error) {
    console.error("Erro ao registrar auditoria:", error);
  }
};

export const getAuditLogs = async (limit = 200): Promise<AuditLogEntry[]> => {
  const headers = await getAuthHeaders();
  const response = await axios.get("/api/audit-logs", {
    headers,
    params: { limit },
  });
  return Array.isArray(response.data) ? response.data : [];
};
