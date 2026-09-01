"use client";

import React from "react";
import { useDBStore } from "@/store/dbStore";
import { Permission } from "@/constants/permissions";
import { hasPermission } from "@/config/rbac";
import AccessDeniedState from "./AccessDeniedState";

interface PermissionGateProps {
  children: React.ReactNode;
  permission: Permission;
  fallback?: React.ReactNode;
  showDeniedState?: boolean;
}

export default function PermissionGate({
  children,
  permission,
  fallback = null,
  showDeniedState = false,
}: PermissionGateProps) {
  const activeRole = useDBStore((state) => state.activeRole);
  const isAllowed = hasPermission(activeRole, permission);

  if (isAllowed) {
    return <>{children}</>;
  }

  if (showDeniedState) {
    return <AccessDeniedState />;
  }

  return <>{fallback}</>;
}
