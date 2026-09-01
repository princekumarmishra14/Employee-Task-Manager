"use client";

import React from "react";
import { theme } from "@/theme/theme";

export type DemoRole = "SUPER_ADMIN" | "ADMIN" | "MANAGER" | "EMPLOYEE" | "VIEWER";

interface RoleQuickLoginProps {
  onSelect: (role: DemoRole) => void;
  isPending: boolean;
  isRtl?: boolean;
}

export default function RoleQuickLogin({ onSelect, isPending, isRtl = false }: RoleQuickLoginProps) {
  const roles: { id: DemoRole; title: string; colorClass: string; fullWidth?: boolean }[] = [
    {
      id: "SUPER_ADMIN",
      title: "Super Admin",
      colorClass: "bg-indigo-50 hover:bg-indigo-100/70 border border-indigo-200/50 text-indigo-700 dark:bg-indigo-950/20 dark:border-indigo-900/50 dark:text-indigo-400 dark:hover:bg-indigo-950/40",
    },
    {
      id: "ADMIN",
      title: "Admin",
      colorClass: "bg-emerald-50 hover:bg-emerald-100/70 border border-emerald-200/50 text-emerald-700 dark:bg-emerald-950/20 dark:border-emerald-900/50 dark:text-emerald-400 dark:hover:bg-emerald-950/40",
    },
    {
      id: "MANAGER",
      title: "Manager",
      colorClass: "bg-amber-50 hover:bg-amber-100/70 border border-amber-200/50 text-amber-700 dark:bg-amber-950/20 dark:border-amber-900/50 dark:text-amber-400 dark:hover:bg-amber-950/40",
    },
    {
      id: "EMPLOYEE",
      title: "Employee",
      colorClass: "bg-rose-50 hover:bg-rose-100/70 border border-rose-200/50 text-rose-700 dark:bg-rose-950/20 dark:border-rose-900/50 dark:text-rose-450 dark:hover:bg-rose-950/40",
    },
    {
      id: "VIEWER",
      title: "Viewer (Read Only)",
      colorClass: "bg-purple-50 hover:bg-purple-100/70 border border-purple-200/50 text-purple-700 dark:bg-purple-950/20 dark:border-purple-900/50 dark:text-purple-400 dark:hover:bg-purple-950/40",
      fullWidth: true,
    },
  ];

  return (
    <div className="mt-4 border-t border-[rgba(148,163,184,0.12)] pt-3.5 select-none">
      <p className="text-center text-[9px] font-black text-text-muted uppercase tracking-widest mb-2.5">
        {isRtl ? "تسجيل دخول سريع للصلاحيات المحاكاة" : "ENTERPRISE ROLE QUICK LOGIN (DEMO)"}
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 text-[9px] font-bold tracking-wider">
        {roles.filter((r) => !r.fullWidth).map((role) => (
          <button
            key={role.id}
            type="button"
            onClick={() => onSelect(role.id)}
            disabled={isPending}
            className={`py-1.5 px-2 text-center rounded-xl transition-all active:scale-95 disabled:opacity-50 cursor-pointer ${role.colorClass}`}
          >
            {role.title}
          </button>
        ))}
      </div>

      {roles.filter((r) => r.fullWidth).map((role) => (
        <button
          key={role.id}
          type="button"
          onClick={() => onSelect(role.id)}
          disabled={isPending}
          className={`mt-1.5 w-full py-2.5 px-3 text-center text-[9px] font-bold uppercase tracking-wider transition-all active:scale-95 disabled:opacity-50 cursor-pointer ${role.colorClass} rounded-xl`}
        >
          {role.title}
        </button>
      ))}
    </div>
  );
}
