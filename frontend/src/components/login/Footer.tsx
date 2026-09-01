"use client";

import React from "react";
import { CheckCircle2 } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";

export default function Footer() {
  const { isRtl } = useTranslation();

  return (
    <div className="w-full flex flex-col sm:flex-row justify-between items-center gap-3.5 pt-4 border-t border-slate-400/12 relative z-10 select-none text-[8.5px] text-text-muted font-black uppercase tracking-widest leading-none">
      {/* Left Column: Copyright info */}
      <span className="text-center sm:text-left">
        {isRtl ? "© ٢٠٢٦ منصة ETM. جميع الحقوق محفوظة." : "© 2026 ETM Platform. All rights reserved."}
      </span>

      {/* Center Column: Security status validation */}
      <div className="flex items-center gap-1.5 py-1 sm:py-0 justify-center">
        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
        <span>{isRtl ? "أمان عالي المستوى" : "Enterprise Grade Security"}</span>
      </div>

      {/* Right Column: Legal policy items */}
      <div className="flex gap-4 items-center justify-center">
        <span className="text-[7.5px] text-text-muted font-bold">
          {isRtl ? "الإصدار ٢.٠.٠" : "Version 2.0.0"}
        </span>
        <span className="h-2.5 w-px bg-slate-400/18" />
        <a href="#" className="hover:text-text-secondary transition-colors">
          {isRtl ? "سياسة الخصوصية" : "Privacy Policy"}
        </a>
        <a href="#" className="hover:text-text-secondary transition-colors">
          {isRtl ? "شروط الخدمة" : "Terms of Service"}
        </a>
        <a href="#" className="hover:text-text-secondary transition-colors">
          {isRtl ? "الدعم الفني" : "Support"}
        </a>
        <a href="#" className="hover:text-text-secondary transition-colors">
          {isRtl ? "اتصل بنا" : "Contact"}
        </a>
      </div>
    </div>
  );
}
