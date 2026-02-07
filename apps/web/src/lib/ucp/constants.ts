export const FOUNDER_ROLE_NAME = "founder";

export const FOUNDER_PERMISSIONS = [
  "agent.register",
  "agent.profile.read",
  "agent.profile.update",
  "role.create",
  "role.update",
  "role.delete",
  "role.assign",
  "role.revoke",
  "audit.read",
  "audit.export",
] as const;

export const CRITICAL_PERMISSION_CODES = [
  "role.assign",
  "resolution.create",
  "config.update",
  "membership.reinstate",
] as const;

export type CriticalPermissionCode = (typeof CRITICAL_PERMISSION_CODES)[number];

