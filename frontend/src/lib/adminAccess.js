const ADMIN_ROLES = new Set(["admin", "moderator", "owner"]);

export function isAdminUser(user) {
  const appMetadata = user?.app_metadata || {};
  const role = String(appMetadata.role || "").toLowerCase();

  return ADMIN_ROLES.has(role) || appMetadata.is_admin === true;
}
