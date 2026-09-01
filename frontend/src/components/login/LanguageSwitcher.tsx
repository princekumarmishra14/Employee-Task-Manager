"use client";

import React from "react";
import { useDBStore } from "@/store/dbStore";
import { Globe, ChevronDown } from "lucide-react";

export default function LanguageSwitcher() {
  const { currentLanguage, setLanguage } = useDBStore();

  const toggleLanguage = () => {
    const nextLang = currentLanguage === "en" ? "ar" : "en";
    setLanguage(nextLang);
  };

  return (
    <button
      type="button"
      onClick={toggleLanguage}
      className={`inline-flex items-center gap-1.5 border border-border-clean bg-bg-secondary hover:bg-bg-tertiary px-2.5 py-1 text-xs font-bold text-text-secondary rounded-xl shadow-sm transition-all focus:outline-none focus:ring-1 focus:ring-brand-primary active:scale-95 cursor-pointer dark:bg-bg-tertiary select-none`}
    >
      <Globe className="h-3.5 w-3.5 text-text-muted" />
      <span>{currentLanguage === "en" ? "English" : "العربية"}</span>
      <ChevronDown className="h-3 w-3 text-text-muted opacity-80" />
    </button>
  );
}
