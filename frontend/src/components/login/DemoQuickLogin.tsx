"use client";

import React from "react";
import { ShieldCheck, UserCheck, Sparkles, Info } from "lucide-react";

interface DemoQuickLoginProps {
  onSelectDemo: (email: string, pass: string) => void;
  isPending: boolean;
  isRtl?: boolean;
}

export default function DemoQuickLogin({
  onSelectDemo,
  isPending,
  isRtl = false,
}: DemoQuickLoginProps) {
  return (
    <div className="w-full mt-3 pt-3 border-t border-slate-200/80 dark:border-slate-800/80 select-none">
      {/* Title */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5 text-[11px] font-extrabold text-[#3B42E3] dark:text-indigo-400 uppercase tracking-wider">
          <Sparkles className="h-3 w-3 text-amber-500 animate-pulse" />
          <span>{isRtl ? "🚀 جرب العرض المباشر" : "🚀 Try Live Demo"}</span>
        </div>
        <span className="text-[9.5px] font-semibold px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-[#3B42E3] dark:text-indigo-300 border border-indigo-200/50 dark:border-indigo-800/50">
          {isRtl ? "للزوار والتوظيف" : "For Recruiters & Visitors"}
        </span>
      </div>

      {/* Demo Action Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-2">
        <button
          type="button"
          disabled={isPending}
          onClick={() => onSelectDemo("demo.admin@etm.com", "Admin@123")}
          className="w-full flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white font-bold text-[11px] shadow-sm transition-all duration-200 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed border border-slate-800 dark:border-slate-700"
        >
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
          <span>{isRtl ? "تسجيل دخول كـ أدمن تجريبي" : "Login as Demo Admin"}</span>
        </button>

        <button
          type="button"
          disabled={isPending}
          onClick={() => onSelectDemo("demo.employee@etm.com", "Employee@123")}
          className="w-full flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/60 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold text-[11px] shadow-sm transition-all duration-200 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed border border-slate-200 dark:border-slate-700"
        >
          <UserCheck className="h-3.5 w-3.5 text-indigo-500 dark:text-indigo-400 shrink-0" />
          <span>{isRtl ? "تسجيل دخول كـ موظف تجريبي" : "Login as Demo Employee"}</span>
        </button>
      </div>

      {/* Demo Environment Disclaimer Notice */}
      <div className="p-2 rounded-lg bg-amber-500/8 dark:bg-amber-500/10 border border-amber-500/20 text-[10px] leading-tight text-amber-900 dark:text-amber-200/90 flex items-start gap-1.5">
        <Info className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
        <div>
          <span className="font-extrabold text-amber-950 dark:text-amber-100 mr-1">
            {isRtl ? "بيئة عرض تجريبية:" : "Demo Environment:"}
          </span>
          <span>
            {isRtl
              ? "هذا حساب تجريبي لمسؤولي التوظيف والزوار. ولا يوفر الوصول إلى حساب Super Admin الخاص بالإنتاج."
              : "Demonstration account for recruiters & visitors. Does not access production Super Admin."}
          </span>
        </div>
      </div>
    </div>
  );
}
