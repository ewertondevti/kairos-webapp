export type AuditActor = {
  uid?: string | null;
  email?: string | null;
  role?: number | null;
};

export type AuditLogEntry = {
  id: string;
  action: string;
  targetType?: string;
  targetId?: string | null;
  metadata?: Record<string, unknown>;
  actor?: AuditActor;
  createdAt?: string | null;
};
