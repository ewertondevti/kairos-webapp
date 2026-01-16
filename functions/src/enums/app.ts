export const DatabaseTableKeys = {
  Images: "images",
  Albums: "albums",
  Presentations: "presentations",
  Events: "events",
  Members: "members",
  Users: "users",
  AccessRequests: "accessRequests",
} as const;

export type DatabaseTableKeys =
  (typeof DatabaseTableKeys)[keyof typeof DatabaseTableKeys];
