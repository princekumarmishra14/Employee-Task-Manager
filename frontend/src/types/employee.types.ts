export type EmployeeRole = "SUPER_ADMIN" | "ADMIN" | "MANAGER" | "EMPLOYEE" | "VIEWER";

export interface Employee {
  id: string;
  employeeCode: string;
  fullName: string;
  email: string;
  phone: string | null;
  role: EmployeeRole;
  departmentId: string | null;
  teamId: string | null;
  isActive: boolean;
  createdAt: string;
  avatarUrl: string;
  title: string;
}

export interface EmployeeActivity {
  id: string;
  employeeId: string;
  details: string;
  detailsAr?: string;
  performedBy: string;
  createdAt: string;
}
