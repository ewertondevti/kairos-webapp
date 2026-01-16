export const DatabaseTableKeys = {
  Images: "images",
  Albums: "albums",
  Presentations: "presentations",
  Events: "events",
  Users: "users",
  AccessRequests: "accessRequests",
  AuditLogs: "auditLogs",
} as const;

export type DatabaseTableKeys =
  (typeof DatabaseTableKeys)[keyof typeof DatabaseTableKeys];
