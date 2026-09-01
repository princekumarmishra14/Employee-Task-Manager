"use client";

import React from "react";
import { AlertCircle } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";

interface TaskValidationSummaryProps {
  errors: Record<string, string>;
}

export default function TaskValidationSummary({ errors }: TaskValidationSummaryProps) {
  const { isRtl } = useTranslation();
  const errorKeys = Object.keys(errors);

  if (errorKeys.length === 0) return null;

  return (
    <div className="rounded-xl bg-red-50 p-4 border border-red-200 dark:bg-red-950/20 dark:border-red-900/40 text-xs font-poppins text-red-800 dark:text-red-400 mb-4 animate-shake">
      <div className="flex items-center gap-2 mb-2 font-bold text-sm">
        <AlertCircle className="h-4.5 w-4.5 shrink-0 text-red-550 dark:text-red-400" />
        <span>
          {isRtl
            ? `يرجى تصحيح الأخطاء التالية (${errorKeys.length} أخطاء):`
            : `Please correct the following fields (${errorKeys.length} issues):`}
        </span>
      </div>
      <ul className="list-disc pl-4 space-y-1 font-semibold">
        {errorKeys.map((key) => (
          <li key={key}>
            <span className="capitalize font-bold">{key.replace("Id", "")}</span>: {errors[key]}
          </li>
        ))}
      </ul>
    </div>
  );
}
