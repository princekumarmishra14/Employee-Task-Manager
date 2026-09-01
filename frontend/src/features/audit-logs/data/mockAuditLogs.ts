export interface AuditRecord {
  id: string;
  action: "CREATE" | "UPDATE" | "DELETE" | "ASSIGN" | "STATUS_CHANGE" | "ROLE_CHANGE";
  entityType: "TASK" | "EMPLOYEE" | "DEPARTMENT" | "TEAM" | "PROJECT" | "SETTINGS";
  entityId: string;
  performedBy: string;
  timestamp: string;
  details: string;

  // Compatibility fields for existing store/database types
  entity: "TASK" | "EMPLOYEE" | "DEPARTMENT" | "TEAM" | "PROJECT" | "SETTINGS";
  createdAt: string;
  previousValue?: string | null;
  newValue?: string | null;
}

export const mockAuditLogs: AuditRecord[] = [];
