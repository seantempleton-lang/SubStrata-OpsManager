export const APP_ROLE_ORDER = [
  "FieldUser",
  "Maintenance",
  "Supervisor",
  "Administrator",
  "SuperUser",
];

const APP_ROLE_RANK = new Map(
  APP_ROLE_ORDER.map((role, index) => [role, index]),
);

export function isKnownAppRole(role) {
  return APP_ROLE_RANK.has(role);
}

export function normalizeAppRole(role) {
  return APP_ROLE_RANK.has(role) ? role : "FieldUser";
}

export function getAppRoleRank(role) {
  return APP_ROLE_RANK.get(normalizeAppRole(role));
}

export function hasRoleAtLeast(user, minimumRole) {
  return getAppRoleRank(user?.appRole) >= getAppRoleRank(minimumRole);
}

export function assertRoleAtLeast(user, minimumRole, message) {
  if (!hasRoleAtLeast(user, minimumRole)) {
    const error = new Error(message ?? `${minimumRole} access is required.`);
    error.statusCode = 403;
    throw error;
  }
}

export function getUserAuthoritySummary(user) {
  const appRole = normalizeAppRole(user?.appRole);

  return {
    appRole,
    appRoleRank: getAppRoleRank(appRole),
    isSuperUser: appRole === "SuperUser",
  };
}
