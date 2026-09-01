export type Permission =
  // Dashboard
  | "view:dashboard"
  // Employees
  | "view:employees"
  | "create:employees"
  | "edit:employees"
  | "delete:employees"
  // Departments
  | "view:departments"
  | "create:departments"
  | "edit:departments"
  // Teams
  | "view:teams"
  | "create:teams"
  | "edit:teams"
  // Projects
  | "view:projects"
  | "create:projects"
  | "edit:projects"
  // Tasks
  | "view:tasks"
  | "create:tasks"
  | "edit:tasks"
  | "delete:tasks"
  | "edit:task_status" // specialized for employees
  // Reports
  | "view:reports"
  // Audit Logs
  | "view:audit_logs"
  // Settings
  | "view:settings"
  | "edit:settings"
  // General Action
  | "export:data";
