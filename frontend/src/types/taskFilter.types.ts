import { TaskPriority, TaskStatus } from "./task.types";

export interface TaskFilterState {
  searchTerm: string;
  statusFilter: TaskStatus | "ALL";
  priorityFilter: TaskPriority | "ALL";
  departmentFilter: string | "ALL";
  teamFilter: string | "ALL";
  assignedEmployeeFilter: string | "ALL";
  sortBy: "title" | "dueDate" | "priority" | "status" | "createdAt";
  sortDirection: "asc" | "desc";
  dateRangeFilter: { start: string; end: string } | null;
}

export interface SavedFilter {
  id: string;
  name: string;
  nameAr: string;
  filters: Partial<TaskFilterState>;
}
