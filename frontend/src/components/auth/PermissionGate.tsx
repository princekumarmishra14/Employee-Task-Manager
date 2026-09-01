/**
 * src/components/auth/PermissionGate.tsx
 * Conditionally renders children based on the current user's role and permissions.
 *
 * Usage:
 *   <PermissionGate permission="delete:employees">
 *     <DeleteButton />
 *   </PermissionGate>
 *
 *   <PermissionGate roles={["SUPER_ADMIN", "ADMIN"]} fallback={<ReadOnlyBadge />}>
 *     <EditPanel />
 *   </PermissionGate>
 */

"use client";

import React from "react";
import { useSession } from "next-auth/react";
import { hasPermission } from "@/config/rbac";
import { Permission } from "@/constants/permissions";
import { UserRole } from "@/constants/roles";

interface PermissionGateProps {
  /** A single permission string. If provided, checks against RBAC matrix. */
  permission?: Permission;
  /** Allowed roles. If provided, checks role membership directly. */
  roles?: UserRole[];
  /** Rendered when access is denied. Defaults to null (renders nothing). */
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

export default function PermissionGate({
  permission,
  roles,
  fallback = null,
  children,
}: PermissionGateProps) {
  const { data: session } = useSession();
  const userRole = (session?.user as unknown as { role?: UserRole })?.role;

  if (!userRole) return <>{fallback}</>;

  // Role-based check
  if (roles && !roles.includes(userRole)) {
    return <>{fallback}</>;
  }

  // Permission-based check
  if (permission && !hasPermission(userRole, permission)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
