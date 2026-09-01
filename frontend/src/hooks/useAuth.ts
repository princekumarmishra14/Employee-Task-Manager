/**
 * src/hooks/useAuth.ts
 * Enterprise authentication hook — wraps NextAuth v5 useSession.
 * Permissions are now loaded from the JWT (sourced from the PostgreSQL
 * roles/permissions tables at login time) — never hardcoded.
 */

"use client";

import { useSession, signOut } from "next-auth/react";
import { Permission } from "@/constants/permissions";
import { UserRole } from "@/constants/roles";

export interface AuthUser {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
  role: UserRole;
  permissions: string[];   // "module:action" strings from the DB
  employeeId: string | null;
  employeeCode: string | null;
  title: string | null;
  departmentId: string | null;
  teamId: string | null;
}

export interface UseAuthReturn {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isUnauthenticated: boolean;
  status: "loading" | "authenticated" | "unauthenticated";
  role: UserRole | null;
  permissions: string[];
  displayName: string;
  firstName: string;
  /** Check using "module:action" format — matches the DB Permission table */
  can: (permission: Permission) => boolean;
  /** Legacy compat — checks the same permissions array */
  hasPermission: (permission: Permission) => boolean;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

export function useAuth(): UseAuthReturn {
  const { data: session, status, update } = useSession();
  const rawUser = session?.user as any;

  const user: AuthUser | null = rawUser
    ? {
        id:           rawUser.id           ?? "",
        name:         rawUser.name         ?? null,
        email:        rawUser.email        ?? null,
        image:        rawUser.image        ?? null,
        role:         rawUser.role         ?? "EMPLOYEE",
        permissions:  rawUser.permissions  ?? [],
        employeeId:   rawUser.employeeId   ?? null,
        employeeCode: rawUser.employeeCode ?? null,
        title:        rawUser.title        ?? null,
        departmentId: rawUser.departmentId ?? null,
        teamId:       rawUser.teamId       ?? null,
      }
    : null;

  const role: UserRole | null = user?.role ?? null;
  const permissions: string[] = user?.permissions ?? [];

  const displayName = user?.name ?? user?.email ?? "Unknown User";
  const firstName = displayName.split(" ")[0] ?? displayName;

  /**
   * Permission check — reads directly from the JWT permissions array.
   * SUPER_ADMIN always passes every check.
   */
  const can = (permission: Permission): boolean => {
    if (!user) return false;
    if (user.role === "SUPER_ADMIN") return true;
    return permissions.includes(permission);
  };

  const logout = async () => {
    await signOut({ callbackUrl: "/login" });
  };

  const refreshSession = async () => {
    await update();
  };

  return {
    user,
    isLoading:         status === "loading",
    isAuthenticated:   status === "authenticated",
    isUnauthenticated: status === "unauthenticated",
    status,
    role,
    permissions,
    displayName,
    firstName,
    can,
    hasPermission: can,   // backward-compat alias
    logout,
    refreshSession,
  };
}

export default useAuth;
