export interface Task {
  id: string;
  title: string;
  description: string;
  assignedTo: string | null;
  department: string | null;
  team: string | null;
  project: string | null;
  priority: "Low" | "Medium" | "High";
  status: "Pending" | "In Progress" | "Completed" | "Cancelled";
  estimatedHours: number | null;
  dueDate: string;
  createdAt: string;
  updatedAt: string;

  // Compatibility fields for existing store/database types
  assigneeId: string | null;
  departmentId: string | null;
  teamId: string | null;
  projectId: string | null;
  isActive: boolean;
  isDeleted: boolean;
  startDate: string;
  createdBy: string;
  updatedBy: string;
  tags: string[];
}

export const mockTasks: Task[] = [];
