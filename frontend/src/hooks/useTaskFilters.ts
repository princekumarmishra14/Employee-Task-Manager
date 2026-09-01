/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState, useMemo, useCallback } from "react";
import { useDBStore } from "@/store/dbStore";
import { useAuth } from "@/hooks/useAuth";
import { Task } from "@/types/task.types";
import { TaskFilterState } from "@/types/taskFilter.types";
import { DEFAULT_FILTER_STATE, SAVED_FILTERS } from "@/constants/taskFilter.constants";
import { filterAndSortTasks } from "@/utils/taskFilterUtils";
import { mockFilterActivities, FilterActivity } from "@/features/tasks/data/mockFilterActivities";
import { taskFilterValidationSchema } from "@/validators/taskFilter.schema";

export function useTaskFilters(
  externalTasks?: Task[],
  externalFilters?: TaskFilterState,
  externalSetFilters?: React.Dispatch<React.SetStateAction<TaskFilterState>>,
  statistics?: any | null
) {
  const { tasks: dbTasks, currentLanguage, activeRole } = useDBStore();
  const { user: currentUser } = useAuth();
  const rawTasks = externalTasks ?? (dbTasks as unknown as Task[]);
  
  // Scope tasks for standard Employee role to only show their own tasks
  const allTasks = useMemo(() => {
    if (activeRole === "EMPLOYEE" && currentUser) {
      return rawTasks.filter((t) => t.assignedTo?.id === currentUser.id);
    }
    return rawTasks;
  }, [rawTasks, activeRole, currentUser?.id]);

  const _isRtl = currentLanguage === "ar"; // reserved for future RTL-specific filter UI

  // Filter State
  const [localFilters, localSetFilters] = useState<TaskFilterState>(DEFAULT_FILTER_STATE);
  const filters = externalFilters ?? localFilters;
  const setFilters = externalSetFilters ?? localSetFilters;

  // Filter Activities State
  const [filterActivities, setFilterActivities] = useState<FilterActivity[]>(mockFilterActivities);

  // Helper to log filter activities
  const logActivity = useCallback(
    (action: "SEARCH" | "FILTER" | "RESET", messageEn: string, messageAr: string) => {
      const username = currentUser?.name || currentUser?.email || "System";
      const newActivity: FilterActivity = {
        id: `fact-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        action,
        message: messageEn,
        messageAr,
        performedBy: username,
        createdAt: new Date().toISOString(),
      };
      setFilterActivities((prev) => [newActivity, ...prev]);
    },
    [currentUser?.name, currentUser?.email]
  );

  // Set individual filters with Zod validation
  const updateFilter = useCallback(
    <K extends keyof TaskFilterState>(key: K, value: TaskFilterState[K]) => {
      setFilters((prev: TaskFilterState) => {
        const updated = { ...prev, [key]: value };

        // Validate using Zod schema
        const validationResult = taskFilterValidationSchema.safeParse(updated);
        if (!validationResult.success) {
          return prev; // Fallback to previous state on validation failure
        }

        // Log activities based on what changed
        if (key === "searchTerm" && typeof value === "string" && value.trim()) {
          logActivity(
            "SEARCH",
            `${currentUser?.name || "User"} searched for "${value.trim()}"`,
            `بحث ${currentUser?.name || "المستخدم"} عن "${value.trim()}"`
          );
        } else if (key === "statusFilter" && value !== prev.statusFilter) {
          logActivity(
            "FILTER",
            `${currentUser?.name || "User"} changed status filter to ${value}`,
            `قام ${currentUser?.name || "المستخدم"} بتغيير فلتر الحالة إلى ${value}`
          );
        } else if (key === "priorityFilter" && value !== prev.priorityFilter) {
          logActivity(
            "FILTER",
            `${currentUser?.name || "User"} changed priority filter to ${value}`,
            `قام ${currentUser?.name || "المستخدم"} بتغيير فلتر الأولوية إلى ${value}`
          );
        } else if (key === "departmentFilter" && value !== prev.departmentFilter) {
          logActivity(
            "FILTER",
            `${currentUser?.name || "User"} filtered by department ${value}`,
            `قام ${currentUser?.name || "المستخدم"} بالتصفية حسب القسم ${value}`
          );
        }

        return updated;
      });
    },
    [currentUser?.name, logActivity]
  );

  // Apply Saved Filter Preset
  const applySavedFilter = useCallback(
    (presetId: string) => {
      const preset = SAVED_FILTERS.find((f: any) => f.id === presetId);
      if (!preset) return;

      setFilters({
        ...DEFAULT_FILTER_STATE,
        ...preset.filters,
      });

      logActivity(
        "FILTER",
        `${currentUser?.name || "User"} applied saved filter "${preset.name}"`,
        `قام ${currentUser?.name || "المستخدم"} بتطبيق الفلتر المحفوظ "${preset.nameAr}"`
      );
    },
    [currentUser?.name, logActivity]
  );

  // Reset Filters
  const resetFilters = useCallback(() => {
    setFilters(DEFAULT_FILTER_STATE);
    logActivity(
      "RESET",
      `${currentUser?.name || "User"} reset all filters`,
      `قام ${currentUser?.name || "المستخدم"} بإعادة تعيين جميع الفلاتر`
    );
  }, [currentUser?.name, logActivity]);

  // Compute filtered & sorted tasks
  const filteredTasks = useMemo(() => {
    return filterAndSortTasks(allTasks, filters);
  }, [allTasks, filters]);

  // Calculate live analytics based on backend statistics or fallback to filtered results
  const analytics = useMemo(() => {
    if (statistics) {
      return {
        total: statistics.total,
        filtered: filteredTasks.length,
        assigned: statistics.assigned,
        pending: statistics.unassigned,
        inProgress: statistics.inProgress,
        completed: statistics.completed,
      };
    }

    const totalFiltered = filteredTasks.length;
    const assignedFiltered = allTasks.filter((t: Task) => !t.isDeleted && t.assignedTo !== null).length;
    const pendingFiltered = allTasks.filter((t: Task) => !t.isDeleted && t.status === "UNASSIGNED").length;
    const inProgressFiltered = allTasks.filter((t: Task) => !t.isDeleted && t.status === "IN_PROGRESS").length;
    const completedFiltered = allTasks.filter((t: Task) => !t.isDeleted && t.status === "COMPLETED").length;

    return {
      total: allTasks.length,
      filtered: totalFiltered,
      assigned: assignedFiltered,
      pending: pendingFiltered,
      inProgress: inProgressFiltered,
      completed: completedFiltered,
    };
  }, [allTasks, filteredTasks, statistics]);

  return {
    filters,
    filteredTasks,
    updateFilter,
    applySavedFilter,
    resetFilters,
    filterActivities,
    analytics,
  };
}

