export interface Project {
  id: string;
  name: string;
  description: string;
  department: string;
  status: "PLANNING" | "ACTIVE" | "COMPLETED" | "ON_HOLD" | "CANCELLED";
  startDate: string;
  endDate: string;
  budget: number;
  projectManager: string;

  // Compatibility fields for existing store/database types
  departmentId: string;
  isActive: boolean;
  createdAt: string;
  createdBy: string;
}

export const mockProjects: Project[] = [];
