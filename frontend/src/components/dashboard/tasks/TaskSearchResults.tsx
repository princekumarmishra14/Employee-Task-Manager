"use client";

import React from "react";
import { Search } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";

interface TaskSearchResultsProps {
  searchTerm: string;
  matchCount: number;
}

export default function TaskSearchResults({ searchTerm, matchCount }: TaskSearchResultsProps) {
  const { isRtl } = useTranslation();

  if (!searchTerm.trim()) return null;

  return (
    <div className="flex items-center gap-2 rounded-xl bg-indigo-50/50 border border-indigo-100 p-3 text-xs text-indigo-850 dark:bg-indigo-950/20 dark:border-indigo-900/40 dark:text-indigo-400 font-poppins font-medium">
      <Search className="h-4 w-4 shrink-0 text-indigo-550 dark:text-indigo-400" />
      <span>
        {isRtl ? (
          <>
            البحث عن: <strong className="font-bold">"{searchTerm}"</strong> — تم العثور على{" "}
            <strong className="font-bold">{matchCount}</strong> تطابق
          </>
        ) : (
          <>
            Searching for: <strong className="font-bold">"{searchTerm}"</strong> —{" "}
            <strong className="font-bold">{matchCount}</strong> matches found
          </>
        )}
      </span>
    </div>
  );
}
