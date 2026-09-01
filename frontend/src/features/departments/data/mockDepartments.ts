export interface Department {
  id: string;
  name: string;
  description: string;
  headOfDepartment: string;
  employeeCount: number;
  budget: number;
  status: "ACTIVE" | "INACTIVE";

  // Compatibility fields for existing store/database types
  isActive: boolean;
  createdAt: string;
  createdBy: string;
}

export const mockDepartments: Department[] = [];
