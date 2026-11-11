"use client";

import React, { useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
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
  const router = useRouter();
  const { can, isLoading, status } = useAuth();

  const authorized = useMemo(() => can(permission), [permission, can]);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login");
    }
  }, [status, router]);

  // While session is loading or unauthenticated redirect is in flight, do not flash 403 Access Denied
  if (isLoading || status === "loading" || status === "unauthenticated") {
    return null;
  }

  if (!authorized) {
    return <AccessDeniedState />;
  }

  return <>{children}</>;
}
