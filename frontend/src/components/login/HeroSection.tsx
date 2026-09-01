"use client";

import React from "react";
import { useTranslation } from "@/hooks/useTranslation";

export default function HeroSection() {
  const { isRtl } = useTranslation();

  return (
    <div className="space-y-3.5 select-none text-left">
      {/* Welcome Command Center Badge */}
      <div className="inline-flex items-center gap-1.5 bg-indigo-500/8 dark:bg-indigo-500/15 border border-indigo-500/15 text-brand-primary dark:text-brand-secondary px-3 py-1.5 rounded-full text-[8.5px] font-black uppercase tracking-widest select-none w-fit">
        <span>✦</span>
        <span>{isRtl ? "مرحباً بك في مركز التحكم" : "WELCOME TO THE COMMAND CENTER"}</span>
      </div>

      {/* Main Narrative Heading */}
      <h1 className="text-3xl sm:text-4xl lg:text-[40px] font-black tracking-tight leading-[1.08] uppercase text-text-primary dark:text-white font-poppins pt-2 max-w-lg">
        {isRtl ? (
          <>
            مركز التحكم لعمليات <span className="bg-gradient-to-r from-[#2563EB] to-[#7C3AED] bg-clip-text text-transparent dark:from-[#3B82F6] dark:to-[#8B5CF6]">القوى العاملة</span>.
          </>
        ) : (
          <>
            THE COMMAND <br />
            <span className="bg-gradient-to-r from-[#2563EB] to-[#7C3AED] bg-clip-text text-transparent dark:from-[#3B82F6] dark:to-[#8B5CF6]">CENTER</span> FOR <br />
            WORKFORCE <br />
            OPERATIONS.
          </>
        )}
      </h1>
      
      <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 max-w-md leading-relaxed">
        {isRtl 
          ? "منصة سحابية متكاملة لربط إدارة المهام والموارد البشرية في مكان عمل موحد وذكي." 
          : "Simplify task workflows, profile lifecycles, and security compliance in a unified enterprise workspace."}
      </p>
    </div>
  );
}
