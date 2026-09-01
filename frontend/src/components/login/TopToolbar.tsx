"use client";

import React from "react";
import { HelpCircle } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import LanguageSwitcher from "./LanguageSwitcher";
import ThemeSwitcher from "./ThemeSwitcher";

export default function TopToolbar() {
  const { isRtl } = useTranslation();

  return (
    <div className="flex items-center gap-3 bg-white/72 dark:bg-slate-950/75 backdrop-blur-[32px] px-3.5 py-1.5 border border-white/45 dark:border-white/10 rounded-full shadow-[0_4px_25px_rgba(0,0,0,0.03)] dark:shadow-[0_4px_25px_rgba(0,0,0,0.15)] z-20 select-none">
      {/* Language Selector */}
      <LanguageSwitcher />

      <span className="h-4 w-px bg-slate-400/18" />

      {/* Theme Switcher controls */}
      <ThemeSwitcher />

      <span className="h-4 w-px bg-slate-400/18" />

      {/* Help/Support button */}
      <button
        type="button"
        title={isRtl ? "المساعدة" : "Help"}
        className="text-text-muted hover:text-text-primary transition-colors p-1 rounded-full hover:bg-slate-400/10 cursor-pointer"
      >
        <HelpCircle className="h-3.5 w-3.5" />
      </button>

      <span className="h-4 w-px bg-slate-400/18" />

      {/* System Status indicator */}
      <div className="flex items-center gap-1.5 bg-emerald-500/8 dark:bg-emerald-500/15 border border-emerald-500/15 px-2 py-0.5 rounded-full text-[8px] font-black text-emerald-600 dark:text-emerald-400 tracking-wider">
        <span className="h-1 w-1 rounded-full bg-emerald-500 animate-pulse shrink-0" />
        <span>{isRtl ? "نشط" : "System Status"}</span>
      </div>
    </div>
  );
}
