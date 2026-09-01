// Enterprise Seed Data for Employee Task Manager

export interface Department {
  id: string;
  name: string;
  isActive: boolean;
  createdAt: string;
  createdBy: string;
}

export interface Team {
  id: string;
  name: string;
  departmentId: string;
  isActive: boolean;
  createdAt: string;
  createdBy: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  departmentId?: string | null;
  teamId?: string | null;
  isActive: boolean;
  createdAt: string;
  createdBy: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: "SUPER_ADMIN" | "ADMIN" | "MANAGER" | "TEAM_LEAD" | "EMPLOYEE" | "VIEWER";
  departmentId: string | null;
  teamId: string | null;
  isActive: boolean;
  createdAt: string;
  avatarUrl: string;
  title: string;
  employeeCode: string;
  phone: string | null;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  priority: "LOW" | "MEDIUM" | "HIGH" | "ESCALATED";
  status: "UNASSIGNED" | "ASSIGNED" | "IN_PROGRESS" | "COMPLETED" | "OVERDUE" | "ARCHIVED";
  dueDate: string;
  startDate: string;
  tags: string[];
  isActive: boolean;
  createdAt: string;
  createdBy: string;
  updatedAt: string;
  updatedBy: string;
  assigneeId: string | null;
  departmentId: string | null;
  teamId: string | null;
  projectId: string | null;
  isDeleted: boolean;
  estimatedHours: number | null;
}

export interface Comment {
  id: string;
  taskId: string;
  authorName: string;
  content: string;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  action: "CREATE" | "UPDATE" | "DELETE" | "LOGIN" | "PERMISSION_CHANGE" | "STATUS_CHANGE";
  entity: "TASK" | "EMPLOYEE" | "DEPARTMENT" | "TEAM" | "PROJECT" | "SETTINGS";
  entityId: string;
  details: string;
  performedBy: string;
  createdAt: string;
  previousValue?: string | null;
  newValue?: string | null;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

// All seed data cleared — no mock records
export const seedDepartments: Department[] = [];
export const seedTeams: Team[] = [];
export const seedProjects: Project[] = [];
export const seedEmployees: User[] = [];
export const seedTasks: Task[] = [];
export const seedComments: Comment[] = [];
export const seedAuditLogs: AuditLog[] = [];
