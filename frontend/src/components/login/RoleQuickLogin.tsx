"use client";

import React from "react";
import { ShieldCheck, UserCheck } from "lucide-react";

export type DemoRole = "ADMIN" | "EMPLOYEE";

interface RoleQuickLoginProps {
  onSelect: (role: DemoRole) => void;
  isPending: boolean;
  isRtl?: boolean;
}

export default function RoleQuickLogin({ onSelect, isPending, isRtl = false }: RoleQuickLoginProps) {
  return (
    <div className="border-t border-slate-200/80 dark:border-slate-800/80 pt-3.5 select-none">
      <div className="flex items-center gap-2 mb-2.5">
        <div className="h-px bg-slate-200 dark:bg-slate-800 flex-1" />
        <span className="text-[10px] font-black text-text-muted dark:text-slate-400 uppercase tracking-widest">
          {isRtl ? "تسجيل دخول تجريبي سريع" : "Demo Login / Quick Credentials"}
        </span>
        <div className="h-px bg-slate-200 dark:bg-slate-800 flex-1" />
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        {/* Demo Admin */}
        <button
          id="demo-login-admin"
          type="button"
          title="Login with demo.admin@etm.com / Admin@123"
          onClick={() => onSelect("ADMIN")}
          disabled={isPending}
          className="flex flex-col items-start p-2.5 rounded-xl border border-indigo-200/70 dark:border-indigo-900/50 bg-indigo-50/70 dark:bg-indigo-950/20 hover:bg-indigo-100/70 dark:hover:bg-indigo-950/40 text-left transition-all duration-150 active:scale-[0.98] disabled:opacity-50 cursor-pointer shadow-xs group"
        >
          <div className="flex items-center justify-between w-full mb-1">
            <div className="flex items-center gap-1.5 text-indigo-700 dark:text-indigo-400 font-extrabold text-xs">
              <ShieldCheck className="h-4 w-4 shrink-0 text-indigo-600 dark:text-indigo-400" />
              <span>{isRtl ? "مسؤول تجريبي" : "Demo Admin"}</span>
            </div>
            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-indigo-200/50 dark:bg-indigo-900/40 text-indigo-800 dark:text-indigo-300">
              ADMIN
            </span>
          </div>
          <span className="text-[10px] font-semibold text-indigo-600/80 dark:text-indigo-300/70 truncate w-full">
            demo.admin@etm.com
          </span>
        </button>

        {/* Demo Employee */}
        <button
          id="demo-login-employee"
          type="button"
          title="Login with demo.employee@etm.com / Employee@123"
          onClick={() => onSelect("EMPLOYEE")}
          disabled={isPending}
          className="flex flex-col items-start p-2.5 rounded-xl border border-emerald-200/70 dark:border-emerald-900/50 bg-emerald-50/70 dark:bg-emerald-950/20 hover:bg-emerald-100/70 dark:hover:bg-emerald-950/40 text-left transition-all duration-150 active:scale-[0.98] disabled:opacity-50 cursor-pointer shadow-xs group"
        >
          <div className="flex items-center justify-between w-full mb-1">
            <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 font-extrabold text-xs">
              <UserCheck className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
              <span>{isRtl ? "موظف تجريبي" : "Demo Employee"}</span>
            </div>
            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-emerald-200/50 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300">
              EMPLOYEE
            </span>
          </div>
          <span className="text-[10px] font-semibold text-emerald-600/80 dark:text-emerald-300/70 truncate w-full">
            demo.employee@etm.com
          </span>
        </button>
      </div>
    </div>
  );
}
