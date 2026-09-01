export interface FilterActivity {
  id: string;
  action: "SEARCH" | "FILTER" | "RESET";
  message: string;
  messageAr: string;
  performedBy: string;
  createdAt: string; // ISO string
}

export const mockFilterActivities: FilterActivity[] = [];
