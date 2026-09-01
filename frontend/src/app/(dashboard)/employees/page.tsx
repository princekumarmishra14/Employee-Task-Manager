"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useTranslation } from "@/hooks/useTranslation";
import { useDBStore } from "@/store/dbStore";
import { hasPermission } from "@/config/rbac";
import { Plus, Download, X, List, Grid2X2, ChevronLeft, ChevronRight } from "lucide-react";
import ProtectedRoute from "@/components/rbac/ProtectedRoute";

// Feature module elements
import { useEmployees } from "@/hooks/useEmployees";
import { useEmployeeCrud } from "@/hooks/useEmployeeCrud";
import EmployeeFilters from "@/components/dashboard/employees/EmployeeFilters";
import EmployeeTable from "@/components/dashboard/employees/EmployeeTable";
import EmployeeGrid from "@/components/dashboard/employees/EmployeeGrid";
import EmployeeModal from "@/components/dashboard/employees/EmployeeModal";
import EmployeeTimelineDrawer from "@/components/dashboard/employees/EmployeeTimelineDrawer";
import EmployeeLoadingState from "@/components/dashboard/employees/EmployeeLoadingState";
import EmployeeErrorState from "@/components/dashboard/employees/EmployeeErrorState";

export default function EmployeesPage() {
  const { t, isRtl } = useTranslation();
  const { activeRole, departments, teams, tasks } = useDBStore();
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");

  // Combined fetch & filters hook
  const {
    allEmployees,
    employees: paginatedEmployees,
    filteredCount,
    totalCount,
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
  } = useEmployees();

  // Extract unique designations list
  const uniqueDesignations = useMemo(() => {
    if (!allEmployees) return [];
    const titles = allEmployees
      .map((emp: any) => emp.title)
      .filter((title: any): title is string => !!title);
    return Array.from(new Set(titles)).sort();
  }, [allEmployees]);

  // CRUD actions hook
  const {
    isAddModalOpen,
    editingEmployee,
    selectedEmployeeForTimeline,
    setSelectedEmployeeForTimeline,
    toasts,
    removeToast,
    openCreateModal,
    openEditModal,
    closeAll,
    handleCreate,
    handleUpdate,
    handleDeactivate,
    handleExportCSV,
  } = useEmployeeCrud({ onSuccess: fetchEmployees });

  // Handle URL redirect query parameters for quick addition triggers
  useEffect(() => {
    if (typeof window !== "undefined") {
      const searchParams = new URLSearchParams(window.location.search);
      const action = searchParams.get("action");
      if (action === "add" && hasPermission(activeRole, "employees:create")) {
        // Clear param to avoid duplicate modal popups
        window.history.replaceState(null, "", window.location.pathname);
        openCreateModal();
      }
    }
  }, [openCreateModal, activeRole]);

  // Sync viewMode preference in local storage
  useEffect(() => {
    const saved = localStorage.getItem("employee-view-mode");
    if (saved === "list" || saved === "grid") {
      setViewMode(saved);
    }
  }, []);

  const handleViewChange = (mode: "list" | "grid") => {
    setViewMode(mode);
    localStorage.setItem("employee-view-mode", mode);
  };

  const handleDeactivateConfirm = (id: string, name: string) => {
    if (confirm(isRtl ? `هل أنت متأكد من إلغاء تفعيل حساب الموظف ${name}؟` : `Are you sure you want to deactivate ${name}?`)) {
      handleDeactivate(id, name);
    }
  };

  const startIndex = (currentPage - 1) * 10;

  return (
    <ProtectedRoute permission="employees:view">
      <div className="space-y-6 font-poppins relative transition-colors duration-300">
        
        {/* Title Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-text-primary uppercase">
              {t.empTitle}
            </h1>
            <p className="text-xs text-text-secondary font-medium">
              {isRtl ? "عرض وإدارة سجلات القوى العاملة للشركة." : "Search and manage operational organizational personnel directories."}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Grid/List Switcher */}
            <div className="relative flex items-center bg-bg-secondary p-1 rounded-xl border border-border-clean shadow-sm w-24 overflow-hidden select-none">
              {/* Sliding Active Backdrop */}
              <div
                className="absolute top-1 bottom-1 rounded-lg bg-bg-primary shadow-sm border border-border-clean/50 transition-all duration-300 ease-out"
                style={{
                  width: "calc(50% - 4px)",
                  transform: `translateX(${
                    viewMode === "list"
                      ? "0%"
                      : isRtl ? "-100%" : "100%"
                  })`,
                  left: isRtl ? "auto" : "2px",
                  right: isRtl ? "2px" : "auto",
                }}
              />
              <button
                onClick={() => handleViewChange("list")}
                title="List View"
                className={`relative z-10 flex-1 flex justify-center py-1.5 rounded-lg transition-colors duration-250 focus:outline-none ${
                  viewMode === "list" ? "text-brand-primary font-bold" : "text-text-secondary hover:text-text-primary"
                }`}
              >
                <List className="h-4 w-4" />
              </button>
              <button
                onClick={() => handleViewChange("grid")}
                title="Grid View"
                className={`relative z-10 flex-1 flex justify-center py-1.5 rounded-lg transition-colors duration-250 focus:outline-none ${
                  viewMode === "grid" ? "text-brand-primary font-bold" : "text-text-secondary hover:text-text-primary"
                }`}
              >
                <Grid2X2 className="h-4 w-4" />
              </button>
            </div>

            {/* Export CSV Button */}
            {hasPermission(activeRole, "employees:view") && (
              <button
                onClick={() => handleExportCSV(allEmployees)}
                className="inline-flex items-center gap-1.5 rounded-xl border border-border-clean bg-bg-primary px-3.5 py-2 text-xs font-bold text-text-secondary shadow-sm hover:bg-bg-tertiary transition-all cursor-pointer focus:outline-none"
              >
                <Download className="h-3.5 w-3.5" />
                <span>{t.export}</span>
              </button>
            )}

            {/* Add Employee Button */}
            {hasPermission(activeRole, "employees:create") && (
              <button
                onClick={openCreateModal}
                className="inline-flex items-center gap-1.5 rounded-xl bg-brand-primary px-3.5 py-2 text-xs font-bold text-bg-primary shadow-sm hover:bg-brand-secondary transition-all cursor-pointer focus:outline-none active:scale-95"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>{t.empAddButton}</span>
              </button>
            )}
          </div>
        </div>

        {/* Filters Panel */}
        <EmployeeFilters
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          deptFilter={deptFilter}
          onDeptChange={setDeptFilter}
          teamFilter={teamFilter}
          onTeamChange={setTeamFilter}
          statusFilter={statusFilter}
          onStatusChange={setStatusFilter}
          designationFilter={designationFilter}
          onDesignationChange={setDesignationFilter}
          departments={departments}
          teams={teams}
          designations={uniqueDesignations}
        />

        {/* Main Workforce Grid/Table Container */}
        {isLoading ? (
          <EmployeeLoadingState />
        ) : error ? (
          <EmployeeErrorState error={error} onRetry={retry} isLoading={isLoading} />
        ) : viewMode === "list" ? (
          <EmployeeTable
            employees={paginatedEmployees}
            departments={departments}
            onView={setSelectedEmployeeForTimeline}
            onEdit={openEditModal}
            onDelete={handleDeactivateConfirm}
            currentPage={currentPage}
            totalPages={totalPages}
            totalCount={totalCount}
            filteredCount={filteredCount}
            itemsPerPage={10}
            onPageChange={handlePageChange}
          />
        ) : (
          <div className="space-y-6">
            <EmployeeGrid
              employees={paginatedEmployees}
              departments={departments}
              onView={setSelectedEmployeeForTimeline}
              onEdit={openEditModal}
              onDelete={handleDeactivateConfirm}
            />

            {/* Grid-Only Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between border border-border-clean rounded-2xl bg-bg-primary px-6 py-4 shadow-sm">
                <span className="text-xs text-text-secondary font-semibold">
                  {isRtl
                    ? `عرض ${startIndex + 1} إلى ${Math.min(startIndex + 10, filteredCount)} من أصل ${filteredCount} موظف`
                    : `Showing ${startIndex + 1} to ${Math.min(startIndex + 10, filteredCount)} of ${filteredCount} employees`}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border-clean bg-bg-secondary text-text-secondary hover:bg-bg-tertiary disabled:opacity-40 cursor-pointer focus:outline-none"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <span className="text-xs font-bold text-text-primary">
                    {currentPage} / {totalPages}
                  </span>
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border-clean bg-bg-secondary text-text-secondary hover:bg-bg-tertiary disabled:opacity-40 cursor-pointer focus:outline-none"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Drawer: Detailed Timeline View */}
        <EmployeeTimelineDrawer
          employee={selectedEmployeeForTimeline}
          onClose={() => setSelectedEmployeeForTimeline(null)}
          departments={departments}
          tasks={tasks}
        />

        {/* Modal overlays: Add/Edit forms */}
        {(isAddModalOpen || editingEmployee) && (
          <EmployeeModal
            isOpen={isAddModalOpen || !!editingEmployee}
            onClose={closeAll}
            onSubmit={editingEmployee ? handleUpdate : handleCreate}
            initialData={editingEmployee}
            departments={departments}
          />
        )}

        {/* Toast Alerts Panel */}
        <div className={`fixed bottom-4 z-55 flex flex-col gap-2 max-w-sm w-full ${isRtl ? "left-4" : "right-4"}`}>
          {toasts.map((toast: any) => (
            <div
              key={toast.id}
              className={`rounded-xl border p-4 shadow-xl backdrop-blur-md flex items-start gap-3 transition-all text-sm font-poppins select-none ${
                toast.type === "success"
                  ? "bg-bg-primary border-status-success/30 text-status-success"
                  : toast.type === "error"
                  ? "bg-bg-primary border-status-danger/30 text-status-danger"
                  : "bg-bg-primary border-brand-primary/30 text-brand-primary"
              }`}
            >
              <div className="flex-1">
                <h4 className="font-bold text-xs uppercase tracking-wider">{toast.title}</h4>
                <p className="text-xs text-text-secondary font-semibold mt-0.5 leading-relaxed">{toast.message}</p>
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="text-text-muted hover:text-text-primary rounded-full p-0.5 cursor-pointer focus:outline-none"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </ProtectedRoute>
  );
}
