"use client";

import React from "react";
import { X, FilterX } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import { TaskFilterState } from "@/types/taskFilter.types";
import { FILTER_STATUS_OPTIONS, FILTER_PRIORITY_OPTIONS } from "@/constants/taskFilter.constants";

interface FilterSummaryProps {
  filters: TaskFilterState;
  onClearFilter: <K extends keyof TaskFilterState>(key: K, defaultValue: TaskFilterState[K]) => void;
  onReset: () => void;
  filteredCount: number;
  totalCount: number;
}

export default function FilterSummary({
  filters,
  onClearFilter,
  onReset,
  filteredCount,
  totalCount,
}: FilterSummaryProps) {
  const { t, isRtl } = useTranslation();

  // Determine if any filters are active (non-default)
  const isStatusActive = filters.statusFilter !== "ALL";
  const isPriorityActive = filters.priorityFilter !== "ALL";
  const isDeptActive = filters.departmentFilter !== "ALL";
  const isSearchActive = filters.searchTerm !== "";
  
  const hasActiveFilters = isStatusActive || isPriorityActive || isDeptActive || isSearchActive;

  if (!hasActiveFilters) {
    return (
      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 font-poppins font-medium mt-1">
        <span>
          {isRtl
            ? `عرض ${filteredCount} من أصل ${totalCount} مهام`
            : `Showing ${filteredCount} of ${totalCount} tasks`}
        </span>
      </div>
    );
  }

  // Get human readable labels
  const activeStatusLabel = FILTER_STATUS_OPTIONS.find((o: any) => o.value === filters.statusFilter);
  const activePriorityLabel = FILTER_PRIORITY_OPTIONS.find((o: any) => o.value === filters.priorityFilter);

  return (
    <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between text-xs border-t border-gray-100 pt-4 mt-2 dark:border-gray-800/60 font-poppins">
      <div className="flex flex-wrap items-center gap-2">
        <span className="font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
          {isRtl ? "الفلاتر النشطة:" : "Active Filters:"}
        </span>

        {/* Search Query Tag */}
        {isSearchActive && (
          <span className="inline-flex items-center gap-1 bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-400 px-2.5 py-1 rounded-lg border border-indigo-100 dark:border-indigo-900/40 font-semibold">
            <span>{isRtl ? "بحث:" : "Search:"} "{filters.searchTerm}"</span>
            <button
              onClick={() => onClearFilter("searchTerm", "")}
              className="hover:bg-indigo-100 dark:hover:bg-indigo-900/60 rounded-full p-0.5"
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        )}

        {/* Status Tag */}
        {isStatusActive && activeStatusLabel && (
          <span className="inline-flex items-center gap-1 bg-slate-50 text-slate-700 dark:bg-slate-850 dark:text-slate-350 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-800 font-semibold">
            <span>
              {isRtl ? "الحالة:" : "Status:"} {isRtl ? activeStatusLabel.labelAr : activeStatusLabel.label}
            </span>
            <button
              onClick={() => onClearFilter("statusFilter", "ALL")}
              className="hover:bg-slate-250 dark:hover:bg-slate-700 rounded-full p-0.5"
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        )}

        {/* Priority Tag */}
        {isPriorityActive && activePriorityLabel && (
          <span className="inline-flex items-center gap-1 bg-slate-50 text-slate-700 dark:bg-slate-850 dark:text-slate-350 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-800 font-semibold">
            <span>
              {isRtl ? "الأولوية:" : "Priority:"} {isRtl ? activePriorityLabel.labelAr : activePriorityLabel.label}
            </span>
            <button
              onClick={() => onClearFilter("priorityFilter", "ALL")}
              className="hover:bg-slate-250 dark:hover:bg-slate-700 rounded-full p-0.5"
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        )}

        {/* Department Tag */}
        {isDeptActive && (
          <span className="inline-flex items-center gap-1 bg-slate-50 text-slate-700 dark:bg-slate-850 dark:text-slate-350 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-800 font-semibold">
            <span>{isRtl ? "القسم:" : "Dept:"} {filters.departmentFilter}</span>
            <button
              onClick={() => onClearFilter("departmentFilter", "ALL")}
              className="hover:bg-slate-250 dark:hover:bg-slate-700 rounded-full p-0.5"
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        )}

        {/* Reset Button */}
        <button
          onClick={onReset}
          className="inline-flex items-center gap-1 text-red-500 hover:text-red-750 font-bold hover:underline transition-colors ml-1"
        >
          <FilterX className="h-3.5 w-3.5" />
          <span>{isRtl ? "إعادة تعيين الكل" : "Clear All"}</span>
        </button>
      </div>

      <div className="font-bold text-gray-500 dark:text-gray-400">
        {isRtl
          ? `تم العثور على ${filteredCount} من أصل ${totalCount} مهام`
          : `Showing ${filteredCount} of ${totalCount} tasks`}
      </div>
    </div>
  );
}
