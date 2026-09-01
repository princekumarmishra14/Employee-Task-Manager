"use client";

import React from "react";
import { ListTodo, Plus } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";

interface TaskEmptyStateProps {
  title?: string;
  description?: string;
  onActionClick?: () => void;
  actionLabel?: string;
  onResetFilters?: () => void;
}

export default function TaskEmptyState({
  title,
  description,
  onActionClick,
  actionLabel,
  onResetFilters,
}: TaskEmptyStateProps) {
  const { t, isRtl } = useTranslation();

  const defaultTitle = isRtl ? "لم يتم العثور على مهام" : "No Tasks Found";
  const defaultDesc = isRtl 
    ? "لم نجد أي مهام تطابق عملية البحث أو الفلاتر الحالية الخاصة بك." 
    : "We couldn't find any tasks matching your current search and filters.";

  return (
    <div className="flex min-h-[300px] flex-col items-center justify-center rounded-2xl border border-dashed border-gray-250 bg-white p-8 text-center dark:border-gray-800 dark:bg-gray-900 shadow-sm">
      <div className="rounded-2xl bg-indigo-50 p-4 text-indigo-650 dark:bg-indigo-950/40 dark:text-indigo-400">
        <ListTodo className="h-10 w-10 shrink-0" />
      </div>
      <h3 className="mt-4 text-lg font-bold text-gray-900 dark:text-white font-poppins">
        {title || defaultTitle}
      </h3>
      <p className="mt-2 max-w-sm text-xs font-semibold text-gray-550 dark:text-gray-400 leading-relaxed font-poppins">
        {description || defaultDesc}
      </p>
      
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        {onResetFilters && (
          <button
            onClick={onResetFilters}
            className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-xs font-bold text-gray-700 shadow-sm hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-750 transition-all font-poppins"
          >
            <span>{isRtl ? "إعادة تعيين الفلاتر" : "Reset Filters"}</span>
          </button>
        )}
        
        {onActionClick && (
          <button
            onClick={onActionClick}
            className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white shadow-md hover:bg-indigo-750 transition-all active:scale-95 dark:bg-indigo-500 dark:hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-poppins"
          >
            <Plus className="h-4 w-4" />
            <span>{actionLabel || (isRtl ? "إضافة مهمة جديدة" : "Add Task")}</span>
          </button>
        )}
      </div>
    </div>
  );
}
