/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useCallback, useEffect } from "react";
import { Task } from "@/types/task.types";
import { useDBStore } from "@/store/dbStore";
import { TaskFilterState } from "@/types/taskFilter.types";

export interface UseTaskApiReturn {
  data: Task[];
  setData: React.Dispatch<React.SetStateAction<Task[]>>;
  statistics: any | null;
  isLoading: boolean;
  error: string | null;
  retry: () => void;
  fetchTasks: () => Promise<void>;
}

export function useTaskApi(filters?: TaskFilterState): UseTaskApiReturn {
  const { tasks: data, syncOperationalData } = useDBStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryTrigger, setRetryTrigger] = useState(0);

  const fetchTasks = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      await syncOperationalData();
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  }, [syncOperationalData]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks, retryTrigger]);

  const retry = useCallback(() => {
    setRetryTrigger((prev) => prev + 1);
  }, []);

  return {
    data,
    setData: () => {}, // Noop
    statistics: null,  // Handled by client-side fallback calculation in useTaskFilters
    isLoading,
    error,
    retry,
    fetchTasks,
  };
}
