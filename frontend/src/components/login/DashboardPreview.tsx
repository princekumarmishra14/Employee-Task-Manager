"use client";

import React from "react";
import { useTranslation } from "@/hooks/useTranslation";
import { ChevronDown, Activity } from "lucide-react";

export default function DashboardPreview() {
  const { isRtl } = useTranslation();

  return (
    <div className="w-full max-w-[540px] bg-white/40 dark:bg-slate-900/30 text-text-primary dark:text-slate-200 border border-slate-400/18 dark:border-slate-800/30 rounded-3xl p-4 shadow-[0_15px_40px_rgba(0,0,0,0.02)] dark:shadow-[0_15px_40px_rgba(0,0,0,0.2)] select-none font-poppins relative overflow-hidden backdrop-blur-md">
      {/* Decorative background glow */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-brand-primary/5 rounded-full blur-2xl" />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 divide-y md:divide-y-0 md:divide-x divide-slate-400/12 dark:divide-slate-800/50">
        
        {/* ── Left Side: Project Overview Donut ── */}
        <div className="space-y-3.5 pr-0 md:pr-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-text-muted">
              {isRtl ? "نظرة عامة على المشروع" : "Project Overview"}
            </span>
            <button 
              type="button" 
              className="inline-flex items-center gap-1 text-[9px] font-bold text-text-secondary border border-slate-400/18 bg-white/50 dark:bg-slate-950/20 px-2 py-0.5 rounded-lg hover:text-text-primary"
            >
              <span>{isRtl ? "هذا الأسبوع" : "This Week"}</span>
              <ChevronDown className="h-2.5 w-2.5" />
            </button>
          </div>

          <div className="flex items-center gap-4 py-2">
            {/* Donut Chart */}
            <div className="relative h-20 w-20 shrink-0">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="15.915" fill="transparent" stroke="currentColor" className="text-slate-200 dark:text-slate-800" strokeWidth="3" />
                <circle 
                  cx="18" cy="18" r="15.915" 
                  fill="transparent" 
                  stroke="url(#donutGrad)" 
                  strokeWidth="3" 
                  strokeDasharray="78 22" 
                  strokeDashoffset="25"
                  strokeLinecap="round"
                />
                <defs>
                  <linearGradient id="donutGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#4F46E5" />
                    <stop offset="100%" stopColor="#06B6D4" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center leading-none">
                <span className="text-sm font-black text-text-primary dark:text-white">78%</span>
                <span className="text-[7.5px] font-bold text-text-muted uppercase tracking-widest mt-0.5">
                  {isRtl ? "أنجز" : "Done"}
                </span>
              </div>
            </div>

            {/* Metrics Checklist */}
            <div className="flex-1 space-y-1.5 text-[9px] font-bold">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-brand-primary" />
                  <span className="text-text-muted">{isRtl ? "إجمالي المهام" : "Total Tasks"}</span>
                </div>
                <span className="text-text-primary dark:text-white">12,450</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                  <span className="text-text-muted">{isRtl ? "قيد الإنجاز" : "In Progress"}</span>
                </div>
                <span className="text-text-primary dark:text-white">3,245</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  <span className="text-text-muted">{isRtl ? "المكتملة" : "Completed"}</span>
                </div>
                <span className="text-text-primary dark:text-white">9,205</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Right Side: Team Activity Feed ── */}
        <div className="space-y-3.5 pl-0 md:pl-4 pt-4 md:pt-0">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-text-muted">
              {isRtl ? "نشاط الفريق" : "Team Activity"}
            </span>
            <span className="text-[7.5px] font-black uppercase tracking-wider bg-brand-primary/5 text-brand-primary px-2 py-0.5 rounded-full border border-brand-primary/10">
              {isRtl ? "تغذية حية" : "Live Feed"}
            </span>
          </div>

          <div className="space-y-2 text-[9px] font-bold">
            {/* Row 1 */}
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-[8px] font-bold text-white shrink-0">
                SJ
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-text-primary dark:text-white truncate">Sarah Johnson</p>
                <p className="text-text-muted text-[8px] truncate">{isRtl ? "حدث حالة المهمة" : "Updated task status"}</p>
              </div>
              <span className="text-text-muted/60 text-[8px] shrink-0">2m ago</span>
            </div>

            {/* Row 2 */}
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-500 flex items-center justify-center text-[8px] font-bold text-white shrink-0">
                JA
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-text-primary dark:text-white truncate">James Anderson</p>
                <p className="text-text-muted text-[8px] truncate">{isRtl ? "أكمل المراجعة الفنية" : "Completed technical review"}</p>
              </div>
              <span className="text-text-muted/60 text-[8px] shrink-0">5m ago</span>
            </div>

            {/* Row 3 */}
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded-full bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-[8px] font-bold text-white shrink-0">
                MG
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-text-primary dark:text-white truncate">Maria Garcia</p>
                <p className="text-text-muted text-[8px] truncate">{isRtl ? "أضاف تعليق جديد" : "Added a comment"}</p>
              </div>
              <span className="text-text-muted/60 text-[8px] shrink-0">8m ago</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
