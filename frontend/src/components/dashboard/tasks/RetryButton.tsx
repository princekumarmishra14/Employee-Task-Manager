"use client";

import React from "react";
import { RefreshCw } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";

interface RetryButtonProps {
  onClick: () => void;
  isLoading?: boolean;
}

export default function RetryButton({ onClick, isLoading = false }: RetryButtonProps) {
  const { isRtl } = useTranslation();

  return (
    <button
      onClick={onClick}
      disabled={isLoading}
      className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-indigo-700 active:scale-95 disabled:opacity-50 transition-all dark:bg-indigo-500 dark:hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-poppins cursor-pointer"
      aria-label={isRtl ? "إعادة المحاولة" : "Retry operation"}
    >
      <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
      <span>{isRtl ? "إعادة المحاولة" : "Retry Connection"}</span>
    </button>
  );
}
