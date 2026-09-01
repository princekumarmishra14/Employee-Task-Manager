"use client";

import React, { useMemo } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Permission } from "@/constants/permissions";
import AccessDeniedState from "./AccessDeniedState";

interface ProtectedRouteProps {
  children: React.ReactNode;
  permission: Permission;
}

/**
 * ProtectedRoute — guards a page section using the live JWT permissions array.
 * Permission check uses "module:action" format matching the DB tables.
 * SUPER_ADMIN bypasses all checks.
 */
export default function ProtectedRoute({ children, permission }: ProtectedRouteProps) {
  const { can, isLoading } = useAuth();

  const authorized = useMemo(() => can(permission), [permission, can]);

  // While session is loading, render nothing to avoid flash of 403
  if (isLoading) return null;

  if (!authorized) {
    return <AccessDeniedState />;
  }

  return <>{children}</>;
}
