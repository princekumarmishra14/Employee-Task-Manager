"use client";

import React, { useEffect, useState } from "react";
import ProtectedRoute from "@/components/rbac/ProtectedRoute";
import { useAuth } from "@/hooks/useAuth";
import api from "@/lib/axios";
import {
  Shield,
  Users,
  ChevronDown,
  ChevronRight,
  CheckCircle2,
  Circle,
  Loader2,
  Lock,
} from "lucide-react";

interface Permission {
  id: string;
  module: string;
  action: string;
}

interface Role {
  id: string;
  name: string;
  description: string | null;
  isSystem: boolean;
  userCount: number;
  permissions: Permission[];
}

const ROLE_COLOR: Record<string, string> = {
  SUPER_ADMIN: "from-violet-600 to-indigo-500",
  ADMIN:       "from-blue-600 to-cyan-500",
  MANAGER:     "from-emerald-600 to-teal-500",
  TEAM_LEAD:   "from-orange-500 to-amber-400",
  EMPLOYEE:    "from-slate-500 to-slate-400",
  VIEWER:      "from-gray-500 to-gray-400",
};

const ROLE_BADGE: Record<string, string> = {
  SUPER_ADMIN: "bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-300",
  ADMIN:       "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  MANAGER:     "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300",
  TEAM_LEAD:   "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300",
  EMPLOYEE:    "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
  VIEWER:      "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
};

function groupPermissions(permissions: Permission[]) {
  return permissions.reduce<Record<string, string[]>>((acc, p) => {
    if (!acc[p.module]) acc[p.module] = [];
    acc[p.module].push(p.action);
    return acc;
  }, {});
}

function RoleCard({ role, isViewOnly }: { role: Role; isViewOnly: boolean }) {
  const [expanded, setExpanded] = useState(false);
  const grouped = groupPermissions(role.permissions);
  const gradient = ROLE_COLOR[role.name] || "from-gray-500 to-gray-400";
  const badge    = ROLE_BADGE[role.name] || "bg-gray-100 text-gray-600";

  return (
    <div className="rounded-2xl border border-gray-200 bg-white dark:bg-gray-900 dark:border-gray-800 shadow-sm overflow-hidden">
      {/* Header stripe */}
      <div className={`h-1.5 bg-gradient-to-r ${gradient}`} />

      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className={`rounded-xl p-2.5 bg-gradient-to-br ${gradient} shadow-md`}>
              <Shield className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 dark:text-white text-sm leading-tight">
                {role.name.replace("_", " ")}
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-1">
                {role.description || "System role"}
              </p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1.5">
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${badge}`}>
              {role.isSystem ? "System" : "Custom"}
            </span>
            <span className="flex items-center gap-1 text-[10px] text-gray-500 dark:text-gray-400 font-medium">
              <Users className="h-3 w-3" />
              {role.userCount} {role.userCount === 1 ? "user" : "users"}
            </span>
          </div>
        </div>

        {/* Permission count */}
        <div className="mt-4 flex items-center justify-between">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            <span className="font-bold text-gray-900 dark:text-white">{role.permissions.length}</span> permissions
            across <span className="font-bold text-gray-900 dark:text-white">{Object.keys(grouped).length}</span> modules
          </p>
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1 text-xs font-semibold text-brand-primary hover:text-brand-secondary transition-colors"
          >
            {expanded ? (
              <>Hide <ChevronDown className="h-3.5 w-3.5" /></>
            ) : (
              <>View <ChevronRight className="h-3.5 w-3.5" /></>
            )}
          </button>
        </div>

        {/* Expanded permission list */}
        {expanded && (
          <div className="mt-4 space-y-3 border-t border-gray-100 dark:border-gray-800 pt-4">
            {Object.entries(grouped).sort().map(([module, actions]) => (
              <div key={module}>
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1.5">
                  {module.replace("_", " ")}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {actions.sort().map((action) => (
                    <span
                      key={action}
                      className="flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400 border border-green-200 dark:border-green-800"
                    >
                      <CheckCircle2 className="h-2.5 w-2.5" />
                      {action}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function RolesPage() {
  const { role } = useAuth();
  const isViewOnly = role !== "SUPER_ADMIN";

  const [roles, setRoles] = useState<Role[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchRoles() {
      try {
        const res = await api.get("/roles");
        if (res.data.success) {
          setRoles(res.data.data);
        } else {
          setError(res.data.message || "Failed to load roles");
        }
      } catch (err: any) {
        setError(err.response?.data?.message || "An error occurred");
      } finally {
        setIsLoading(false);
      }
    }
    fetchRoles();
  }, []);

  return (
    <ProtectedRoute permission="roles:view">
      <div className="space-y-6">

        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
              Roles &amp; Permissions
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {isViewOnly
                ? "View the system role configuration and their assigned permissions."
                : "Manage roles, configure permissions, and control access across the platform."}
            </p>
          </div>
          {isViewOnly && (
            <span className="flex items-center gap-1.5 text-xs font-semibold text-amber-700 bg-amber-50 dark:bg-amber-900/20 dark:text-amber-400 border border-amber-200 dark:border-amber-800 px-3 py-1.5 rounded-full">
              <Lock className="h-3.5 w-3.5" />
              View Only
            </span>
          )}
        </div>

        {/* Stats bar */}
        {!isLoading && !error && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: "Total Roles",       value: roles.length },
              { label: "System Roles",      value: roles.filter(r => r.isSystem).length },
              { label: "Total Permissions", value: [...new Set(roles.flatMap(r => r.permissions.map(p => `${p.module}:${p.action}`)))].length },
              { label: "Modules Covered",   value: [...new Set(roles.flatMap(r => r.permissions.map(p => p.module)))].length },
            ].map((stat) => (
              <div
                key={stat.label}
                className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 text-center shadow-sm"
              >
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mt-0.5">{stat.label}</p>
              </div>
            ))}
          </div>
        )}

        {/* Loading */}
        {isLoading && (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-brand-primary" />
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 p-6 text-center text-red-600 dark:text-red-400">
            <p className="font-bold">{error}</p>
          </div>
        )}

        {/* Roles Grid */}
        {!isLoading && !error && (
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {roles.map((r) => (
              <RoleCard key={r.id} role={r} isViewOnly={isViewOnly} />
            ))}
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
