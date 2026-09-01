export interface Team {
  id: string;
  name: string;
  department: string;
  lead: string;
  memberCount: number;
  status: "ACTIVE" | "INACTIVE";

  // Compatibility fields for existing store/database types
  departmentId: string;
  isActive: boolean;
  createdAt: string;
  createdBy: string;
}

export const mockTeams: Team[] = [];
