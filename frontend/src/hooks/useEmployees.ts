import { useState, useMemo, useCallback } from "react";
import { useEmployeeApi } from "./useEmployeeApi";
import { Employee } from "../types/employee.types";

export function useEmployees() {
  const { data: allEmployees, isLoading, error, retry, fetchEmployees } = useEmployeeApi();

  // Search & filters state
  const [searchQuery, setSearchQuery] = useState("");
  const [deptFilter, setDeptFilter] = useState("ALL");
  const [teamFilter, setTeamFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [designationFilter, setDesignationFilter] = useState("ALL");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Filtering Logic
  const filteredEmployees = useMemo(() => {
    return allEmployees.filter((emp) => {
      const matchesSearch =
        emp.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.title.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesDept = deptFilter === "ALL" || emp.departmentId === deptFilter;
      const matchesTeam = teamFilter === "ALL" || emp.teamId === teamFilter;
      const matchesDesignation = designationFilter === "ALL" || emp.title === designationFilter;

      let matchesStatus = true;
      if (statusFilter === "ACTIVE") matchesStatus = emp.isActive;
      else if (statusFilter === "INACTIVE") matchesStatus = !emp.isActive;

      return matchesSearch && matchesDept && matchesTeam && matchesStatus && matchesDesignation;
    });
  }, [allEmployees, searchQuery, deptFilter, teamFilter, statusFilter, designationFilter]);

  // Pagination calculation
  const totalItems = filteredEmployees.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedEmployees = useMemo(() => {
    return filteredEmployees.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredEmployees, startIndex]);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  const resetFilters = useCallback(() => {
    setSearchQuery("");
    setDeptFilter("ALL");
    setTeamFilter("ALL");
    setStatusFilter("ALL");
    setDesignationFilter("ALL");
    setCurrentPage(1);
  }, []);

  return {
    allEmployees,
    employees: paginatedEmployees,
    filteredCount: filteredEmployees.length,
    totalCount: allEmployees.length,
    isLoading,
    error,
    retry,
    fetchEmployees,
    searchQuery,
    setSearchQuery,
    deptFilter,
    setDeptFilter,
    teamFilter,
    setTeamFilter,
    statusFilter,
    setStatusFilter,
    designationFilter,
    setDesignationFilter,
    currentPage,
    totalPages,
    handlePageChange,
    resetFilters,
  };
}
