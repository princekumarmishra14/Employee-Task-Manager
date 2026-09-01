"use client";

import React, { useMemo } from "react";
import { FilterX } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import { useDBStore } from "@/store/dbStore";
import { TaskFilterState } from "@/types/taskFilter.types";
import { FILTER_STATUS_OPTIONS, FILTER_PRIORITY_OPTIONS } from "@/constants/taskFilter.constants";
import SearchInput from "./SearchInput";
import SelectFilter from "./SelectFilter";
import SavedFilterDropdown from "./SavedFilterDropdown";

interface TaskFiltersProps {
  filters: TaskFilterState;
  updateFilter: <K extends keyof TaskFilterState>(key: K, value: TaskFilterState[K]) => void;
  resetFilters: () => void;
  applySavedFilter: (presetId: string) => void;
  searchError?: string | null;
}

export default function TaskFilters({
  filters,
  updateFilter,
  resetFilters,
  applySavedFilter,
  searchError,
}: TaskFiltersProps) {
  const { t, isRtl } = useTranslation();
  const { employees } = useDBStore();

  const departmentOptions = [
    { value: "Engineering & Technology", label: "Engineering", labelAr: "الهندسة والتقنية" },
    { value: "Human Resources & Talent", label: "HR", labelAr: "الموارد البشرية" },
    { value: "Finance, Risk & Operations", label: "Finance", labelAr: "المالية والعمليات" },
    { value: "Marketing & Brand Experience", label: "Marketing", labelAr: "التسويق والهوية" },
    { value: "Global Sales & Accounts", label: "Sales", labelAr: "المبيعات والحسابات" },
  ];

  // Dynamic Assignees list derived from active employees
  const assigneeOptions = useMemo(() => {
    return [
      { value: "ALL", label: "All Assignees", labelAr: "كل الموظفين" },
      ...employees
        .filter((e) => e.isActive)
        .map((e) => ({
          value: e.id,
          label: e.name,
          labelAr: e.name,
        })),
    ];
  }, [employees]);

  // Due Date presets
  const dueDateOptions = [
    { value: "ALL", label: "All Due Dates", labelAr: "جميع التواريخ" },
    { value: "TODAY", label: "Due Today", labelAr: "المستحقة اليوم" },
    { value: "THIS_WEEK", label: "Due This Week", labelAr: "المستحقة هذا الأسبوع" },
    { value: "OVERDUE", label: "Overdue", labelAr: "المتأخرة" },
  ];

  const getSelectedDueDateOption = () => {
    if (!filters.dateRangeFilter) return "ALL";
    const start = new Date(filters.dateRangeFilter.start);
    if (start.getFullYear() === 1970) return "OVERDUE";
    
    const end = new Date(filters.dateRangeFilter.end);
    const today = new Date();
    const diffTime = end.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays <= 1) return "TODAY";
    return "THIS_WEEK";
  };

  const handleDueDateChange = (option: string) => {
    if (option === "ALL") {
      updateFilter("dateRangeFilter", null);
    } else if (option === "TODAY") {
      const start = new Date();
      start.setHours(0, 0, 0, 0);
      const end = new Date();
      end.setHours(23, 59, 59, 999);
      updateFilter("dateRangeFilter", { start: start.toISOString(), end: end.toISOString() });
    } else if (option === "THIS_WEEK") {
      const start = new Date();
      start.setHours(0, 0, 0, 0);
      const end = new Date();
      end.setDate(end.getDate() + 7);
      end.setHours(23, 59, 59, 999);
      updateFilter("dateRangeFilter", { start: start.toISOString(), end: end.toISOString() });
    } else if (option === "OVERDUE") {
      const start = new Date(0);
      const end = new Date();
      end.setDate(end.getDate() - 1);
      end.setHours(23, 59, 59, 999);
      updateFilter("dateRangeFilter", { start: start.toISOString(), end: end.toISOString() });
    }
  };

  const hasFiltersSet =
    filters.searchTerm !== "" ||
    filters.statusFilter !== "ALL" ||
    filters.priorityFilter !== "ALL" ||
    filters.departmentFilter !== "ALL" ||
    filters.assignedEmployeeFilter !== "ALL" ||
    filters.dateRangeFilter !== null;

  return (
    <div className="space-y-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900 font-poppins">
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 items-end">
        {/* Search Field */}
        <div className="w-full xl:col-span-2">
          <label className="block text-[10px] font-black text-text-muted uppercase tracking-wider mb-1.5">
            Search
          </label>
          <SearchInput
            value={filters.searchTerm}
            onChange={(val) => updateFilter("searchTerm", val)}
            error={searchError}
            placeholder={isRtl ? "البحث بالاسم أو الموظف..." : "Search title or assignee name..."}
          />
        </div>

        {/* Status Filter */}
        <div className="w-full">
          <label className="block text-[10px] font-black text-text-muted uppercase tracking-wider mb-1.5">
            Status
          </label>
          <SelectFilter
            value={filters.statusFilter}
            onChange={(val) => updateFilter("statusFilter", val as any)}
            options={FILTER_STATUS_OPTIONS}
            placeholder="All Statuses"
            placeholderAr="كل الحالات"
          />
        </div>

        {/* Priority Filter */}
        <div className="w-full">
          <label className="block text-[10px] font-black text-text-muted uppercase tracking-wider mb-1.5">
            Priority
          </label>
          <SelectFilter
            value={filters.priorityFilter}
            onChange={(val) => updateFilter("priorityFilter", val as any)}
            options={FILTER_PRIORITY_OPTIONS}
            placeholder="All Priorities"
            placeholderAr="كل الأولويات"
          />
        </div>

        {/* Assignee Filter */}
        <div className="w-full">
          <label className="block text-[10px] font-black text-text-muted uppercase tracking-wider mb-1.5">
            Assignee
          </label>
          <SelectFilter
            value={filters.assignedEmployeeFilter}
            onChange={(val) => updateFilter("assignedEmployeeFilter", val)}
            options={assigneeOptions}
            placeholder="All Assignees"
            placeholderAr="كل الموظفين"
          />
        </div>

        {/* Due Date Filter */}
        <div className="w-full">
          <label className="block text-[10px] font-black text-text-muted uppercase tracking-wider mb-1.5">
            Due Date
          </label>
          <SelectFilter
            value={getSelectedDueDateOption()}
            onChange={handleDueDateChange}
            options={dueDateOptions}
            placeholder="All Due Dates"
            placeholderAr="جميع التواريخ"
          />
        </div>

        {/* Saved Filters Preset Dropdown */}
        <div className="w-full">
          <label className="block text-[10px] font-black text-text-muted uppercase tracking-wider mb-1.5">
            Presets
          </label>
          <SavedFilterDropdown
            onSelectPreset={applySavedFilter}
            activePresetId={null}
          />
        </div>

        {/* Reset Filters Trigger */}
        {hasFiltersSet && (
          <div className="w-full flex items-center">
            <button
              type="button"
              onClick={resetFilters}
              className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-xs font-bold text-red-650 hover:bg-red-100 dark:border-red-900/40 dark:bg-red-950/20 dark:text-red-400 dark:hover:bg-red-950/40 transition-all cursor-pointer"
            >
              <FilterX className="h-4 w-4 shrink-0" />
              <span className="whitespace-nowrap">{isRtl ? "تعيين" : "Reset"}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
