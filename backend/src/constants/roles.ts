export type UserRole = "SUPER_ADMIN" | "ADMIN" | "MANAGER" | "EMPLOYEE" | "VIEWER";

export const ROLES: Record<UserRole, { id: UserRole; name: string; arName: string }> = {
  SUPER_ADMIN: { id: "SUPER_ADMIN", name: "Super Admin", arName: "مدير خارق" },
  ADMIN: { id: "ADMIN", name: "Admin", arName: "مدير النظام" },
  MANAGER: { id: "MANAGER", name: "Manager", arName: "مدير قسم" },
  EMPLOYEE: { id: "EMPLOYEE", name: "Employee", arName: "موظف" },
  VIEWER: { id: "VIEWER", name: "Viewer", arName: "مراقب" },
};
