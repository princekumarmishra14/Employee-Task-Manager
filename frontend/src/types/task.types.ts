export type TaskStatus = "UNASSIGNED" | "ASSIGNED" | "IN_PROGRESS" | "COMPLETED" | "OVERDUE" | "ARCHIVED";

export type TaskPriority = "LOW" | "MEDIUM" | "HIGH" | "ESCALATED";

export interface TaskAssignee {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  assignedTo: TaskAssignee | null;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string; // ISO date string
  startDate?: string; // ISO date string
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
  department: string | null;
  team: string | null;
  estimatedHours: number | null;
  tags: string[];
  isOverdue: boolean;
  isDeleted: boolean;
  assigneeId?: string | null;
  departmentId?: string | null;
  teamId?: string | null;
  projectId?: string | null;
}

export interface TaskActivity {
  id: string;
  taskId: string;
  message: string;
  performedBy: string;
  createdAt: string; // ISO date string
}
