import { useState, useCallback, useEffect } from "react";
import { Employee } from "@/types/employee.types";
import { EmployeeService } from "@/services/employee.service";
import { useDBStore } from "@/store/dbStore";

export function useEmployeeApi() {
  const [data, setData] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryTrigger, setRetryTrigger] = useState(0);

  const fetchEmployees = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await EmployeeService.getEmployees();
      if (response.success && response.data) {
        setData(response.data);
        // Sync with global store so UI components (Header, Sidebar) instantly reflect name/avatar changes
        useDBStore.setState({ employees: response.data as any });
      } else {
        setError(response.error || "Failed to load employee records");
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees, retryTrigger]);

  const retry = useCallback(() => {
    setRetryTrigger((prev) => prev + 1);
  }, []);

  return {
    data,
    setData,
    isLoading,
    error,
    retry,
    fetchEmployees,
  };
}
