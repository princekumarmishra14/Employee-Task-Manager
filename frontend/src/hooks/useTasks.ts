import { useState } from "react";
import { useTaskApi } from "./useTaskApi";
import { useTaskFilters } from "./useTaskFilters";
import { DEFAULT_FILTER_STATE } from "@/constants/taskFilter.constants";

export function useTasks() {
  const [filters, setFilters] = useState(DEFAULT_FILTER_STATE);
  const { data: allTasks, statistics, isLoading, error, retry, fetchTasks } = useTaskApi(filters);
  const filterProps = useTaskFilters(allTasks, filters, setFilters, statistics);

  return {
    ...filterProps,
    allTasks,
    isLoading,
    error,
    retry,
    fetchTasks,
  };
}
