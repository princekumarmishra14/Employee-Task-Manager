/**
 * frontend/src/constants/permissions.ts
 *
 * Permission format: "module:action" — must match the DB seed exactly.
 * The source of truth is now PostgreSQL (roles → permissions → role_permissions).
 * The frontend uses this type for TypeScript safety, but the actual check
 * comes from the `permissions[]` array stored in the JWT / session.
 */

export type Permission =
  | "dashboard:view"
  // Employees
  | "employees:view"
  | "employees:create"
  | "employees:update"
  | "employees:delete"
  // Departments
  | "departments:view"
  | "departments:create"
  | "departments:update"
  // Teams
  | "teams:view"
  | "teams:create"
  | "teams:update"
  // Projects
  | "projects:view"
  | "projects:create"
  | "projects:update"
  // Tasks
  | "tasks:view"
  | "tasks:create"
  | "tasks:update"
  | "tasks:delete"
  | "tasks:assign"
  // Reports
  | "reports:view"
  // Audit Logs
  | "audit_logs:view"
  // Settings
  | "settings:view"
  | "settings:update"
  // Roles
  | "roles:view"
  | "roles:manage";
