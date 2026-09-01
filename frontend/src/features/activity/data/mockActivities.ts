export interface Activity {
  id: string;
  user: {
    id: string;
    fullName: string;
    avatar: string;
  };
  action: string;
  entityType: "TASK" | "EMPLOYEE" | "PROJECT" | "DEPARTMENT" | "TEAM";
  entityName: string;
  timestamp: string;
}

export const mockActivities: Activity[] = [];
