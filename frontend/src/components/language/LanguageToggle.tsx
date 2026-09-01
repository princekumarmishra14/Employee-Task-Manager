"use client";

import React from "react";
import { useDBStore } from "@/store/dbStore";
import { Globe } from "lucide-react";

export default function LanguageToggle() {
  const { currentLanguage, setLanguage } = useDBStore();

  const toggleLanguage = () => {
    const nextLang = currentLanguage === "en" ? "ar" : "en";
    setLanguage(nextLang);
  };

  return (
    <button
      onClick={toggleLanguage}
      className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 shadow-sm transition-all hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-750"
    >
      <Globe className="h-4 w-4 text-gray-500 dark:text-gray-400" />
      <span>{currentLanguage === "en" ? "العربية" : "English"}</span>
    </button>
  );
}
