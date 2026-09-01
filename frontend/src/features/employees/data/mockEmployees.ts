export type EmployeeRole = "SUPER_ADMIN" | "ADMIN" | "MANAGER" | "EMPLOYEE" | "VIEWER";
export type EmploymentType = "FULL_TIME" | "PART_TIME" | "CONTRACT" | "INTERN";

export interface Employee {
  id: string;
  employeeCode: string;
  fullName: string;
  email: string;
  phone: string | null;
  avatar: string;
  role: EmployeeRole;
  jobTitle: string;
  department: string;
  team: string;
  manager: string | null;
  hireDate: string;
  employmentType: EmploymentType;
  location: string;
  status: "ACTIVE" | "INACTIVE";
  lastLogin: string | null;
  createdAt: string;
  updatedAt: string;

  // Compatibility fields for existing store/database types
  name: string;
  avatarUrl: string;
  title: string;
  departmentId: string | null;
  teamId: string | null;
  isActive: boolean;
}

export const mockEmployees: Employee[] = [];
