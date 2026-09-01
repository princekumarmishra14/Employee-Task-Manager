"use client";

import React from "react";
import { AlertCircle } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import RetryButton from "./RetryButton";

interface TaskErrorStateProps {
  error: string;
  onRetry: () => void;
  isLoading?: boolean;
}

export default function TaskErrorState({ error, onRetry, isLoading = false }: TaskErrorStateProps) {
  const { isRtl } = useTranslation();

  return (
    <div className="flex flex-col items-center justify-center p-8 text-center rounded-2xl border border-red-200 bg-red-50/30 dark:border-red-900/40 dark:bg-red-950/10 min-h-[300px] font-poppins">
      <div className="rounded-full bg-red-100 p-3 dark:bg-red-950/60 mb-4 text-red-600 dark:text-red-400">
        <AlertCircle className="h-8 w-8" />
      </div>
      
      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
        {isRtl ? "فشل تحميل البيانات" : "Data Ingestion Failed"}
      </h3>
      
      <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md mb-6 leading-relaxed">
        {error || (isRtl ? "حدث خطأ غير متوقع أثناء معالجة طلبك." : "An unexpected network error occurred while querying task queues.")}
      </p>

      <RetryButton onClick={onRetry} isLoading={isLoading} />
    </div>
  );
}
