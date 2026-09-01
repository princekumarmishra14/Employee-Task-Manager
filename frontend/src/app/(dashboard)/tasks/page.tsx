"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */

import React, { useState, useEffect } from "react";
import { useTranslation } from "@/hooks/useTranslation";
import { useTasks } from "@/hooks/useTasks";
import { useTaskCrud } from "@/hooks/useTaskCrud";
import { TaskService } from "@/services/task.service";
import TaskMetricsSegmentedControl from "@/components/dashboard/tasks/TaskMetricsSegmentedControl";
import TaskTable from "@/components/dashboard/tasks/TaskTable";
import TaskKanban from "@/components/dashboard/tasks/TaskKanban";
import TaskCalendar from "@/components/dashboard/tasks/TaskCalendar";
import TaskDetailDrawer from "@/components/dashboard/tasks/TaskDetailDrawer";
import TaskLoadingState from "@/components/dashboard/tasks/TaskLoadingState";
import TaskErrorState from "@/components/dashboard/tasks/TaskErrorState";
import TaskFilters from "@/components/dashboard/tasks/TaskFilters";
import FilterSummary from "@/components/dashboard/tasks/FilterSummary";
import TaskSearchResults from "@/components/dashboard/tasks/TaskSearchResults";
import TaskModal from "@/components/dashboard/tasks/TaskModal";
import ConfirmDialog from "@/components/dashboard/tasks/ConfirmDialog";
import {
  ListTodo,
  CheckCircle2,
  Clock,
  Plus,
  X,
  Inbox,
  List,
  Grid2X2,
  Calendar as CalendarIcon
} from "lucide-react";
import ProtectedRoute from "@/components/rbac/ProtectedRoute";
import { Task, TaskStatus } from "@/types/task.types";

export default function TasksPage() {
  const { t, isRtl } = useTranslation();
  const [viewMode, setViewMode] = useState<"list" | "kanban" | "calendar">("list");
  const [viewedTask, setViewedTask] = useState<Task | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  // Combined tasks API & filter hook
  const {
    filters,
    filteredTasks,
    updateFilter,
    applySavedFilter,
    resetFilters,
    filterActivities,
    analytics,
    allTasks,
    isLoading,
    error,
    retry,
    fetchTasks,
  } = useTasks();

  // CRUD Hook
  const {
    activeTask,
    isModalOpen,
    modalMode,
    isDeleteConfirmOpen,
    toasts,
    removeToast,
    addToast,
    openCreateModal,
    openEditModal,
    openDeleteConfirm,
    closeAll,
    handleCreate,
    handleUpdate,
    handleDelete,
  } = useTaskCrud({ onSuccess: fetchTasks });

  // Tab-based metric segment active state
  const [activeMetricTab, setActiveMetricTab] = useState<"total" | "filtered" | "pending" | "completed">("total");

  // Sync active tab with filters
  useEffect(() => {
    if (filters.statusFilter === "COMPLETED") {
      setActiveMetricTab("completed");
    } else if (filters.statusFilter === "UNASSIGNED") {
      setActiveMetricTab("pending");
    } else if (filters.statusFilter === "ASSIGNED") {
      setActiveMetricTab("filtered");
    } else {
      setActiveMetricTab("total");
    }
  }, [filters]);

  const handleMetricTabChange = (tab: "total" | "filtered" | "pending" | "completed") => {
    setActiveMetricTab(tab);
    if (tab === "total") {
      resetFilters();
    } else if (tab === "filtered") {
      // Show ASSIGNED tasks (those that have an assignee)
      updateFilter("statusFilter", "ASSIGNED");
    } else if (tab === "pending") {
      // Show UNASSIGNED tasks (not yet assigned to anyone)
      updateFilter("statusFilter", "UNASSIGNED");
    } else if (tab === "completed") {
      updateFilter("statusFilter", "COMPLETED");
    }
  };

  // Handle URL parameters for redirected addition actions, search clicks, and status pre-filters
  useEffect(() => {
    if (typeof window !== "undefined") {
      const searchParams = new URLSearchParams(window.location.search);
      const action = searchParams.get("action");
      if (action === "add") {
        window.history.replaceState(null, "", window.location.pathname);
        openCreateModal();
      }

      const id = searchParams.get("id");
      if (id && allTasks.length > 0) {
        const target = allTasks.find((t: Task) => t.id === id);
        if (target) {
          window.history.replaceState(null, "", window.location.pathname);
          setViewedTask(target);
        }
      }

      // Pre-apply status filter from KPI card navigation
      const statusParam = searchParams.get("status");
      if (statusParam) {
        window.history.replaceState(null, "", window.location.pathname);
        // Map URL-friendly values to TaskStatus values used by the filter state
        const statusMap: Record<string, string> = {
          COMPLETED: "COMPLETED",
          IN_PROGRESS: "IN_PROGRESS",
          PENDING: "ASSIGNED",
          OVERDUE: "OVERDUE",
        };
        const mapped = statusMap[statusParam] as TaskStatus | undefined;
        if (mapped) {
          updateFilter("statusFilter", mapped);
        }
      }
    }
  }, [openCreateModal, allTasks]);

  // Sync viewMode preference in local storage
  useEffect(() => {
    const saved = localStorage.getItem("task-view-mode");
    if (saved === "list" || saved === "kanban" || saved === "calendar") {
      setViewMode(saved);
    }
  }, []);

  const handleViewChange = (mode: "list" | "kanban" | "calendar") => {
    setViewMode(mode);
    localStorage.setItem("task-view-mode", mode);
  };

  // Drag and drop status updates sync
  const handleStatusChange = async (taskId: string, newStatus: Task["status"]) => {
    try {
      const task = allTasks.find((t: Task) => t.id === taskId);
      if (!task) return;

      const response = await TaskService.updateTask(taskId, {
        title: task.title,
        dueDate: task.dueDate,
        status: newStatus,
        priority: task.priority,
        assignedTo: task.assignedTo
      });

      if (response.success) {
        addToast(
          "success",
          isRtl ? "تم تحديث الحالة" : "Status Updated",
          isRtl ? `تم نقل المهمة بنجاح إلى ${newStatus}` : `Task status moved to ${newStatus}.`
        );
        fetchTasks();
      } else {
        addToast(
          "error",
          isRtl ? "فشل التحديث" : "Update Failed",
          response.error || (isRtl ? "عفواً، فشل تحديث حالة المهمة." : "Failed to update task status.")
        );
      }
    } catch (err: any) {
      addToast(
        "error",
        isRtl ? "فشل التحديث" : "Update Failed",
        err.message || (isRtl ? "عفواً، فشل تحديث حالة المهمة." : "Failed to update task status.")
      );
    }
  };

  // Duplicate task action helper
  const duplicateTask = async (id: string) => {
    const target = allTasks.find((t: Task) => t.id === id);
    if (!target) return;
    
    try {
      const response = await TaskService.createTask({
        title: `${target.title} (Copy)`,
        description: target.description || "",
        priority: target.priority,
        status: target.status,
        dueDate: target.dueDate,
        startDate: new Date().toISOString(),
        tags: target.tags || [],
        assigneeId: target.assignedTo?.id || "",
        department: target.department,
        team: target.team,
        estimatedHours: target.estimatedHours,
        assignedTo: target.assignedTo,
      });

      if (response.success) {
        addToast(
          "success",
          isRtl ? "تم تكرار المهمة" : "Task Duplicated",
          isRtl ? "تم تكرار المهمة بنجاح." : "Task duplicated successfully."
        );
        fetchTasks();
      } else {
        addToast(
          "error",
          isRtl ? "خطأ في التكرار" : "Duplication Failed",
          response.error || (isRtl ? "فشل تكرار المهمة." : "Failed to duplicate task.")
        );
      }
    } catch (err: any) {
      addToast(
        "error",
        isRtl ? "خطأ في التكرار" : "Duplication Failed",
        err.message || (isRtl ? "فشل تكرار المهمة." : "Failed to duplicate task.")
      );
    }
  };

  // Hide soft-deleted tasks from standard tables
  const visibleTasks = filteredTasks.filter((t: Task) => !t.isDeleted);

  // Client-side pagination
  const totalPages = Math.max(1, Math.ceil(visibleTasks.length / ITEMS_PER_PAGE));
  const paginatedTasks = visibleTasks.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Reset to page 1 whenever filters change the visible task list
  useEffect(() => {
    setCurrentPage(1);
  }, [visibleTasks.length]);

  return (
    <ProtectedRoute permission="tasks:view">
      <div className="space-y-6 font-poppins relative transition-colors duration-300">
        
        {/* Header Title */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-text-primary uppercase">
              {t.taskTitle}
            </h1>
            <p className="text-xs text-text-secondary font-medium">
              {isRtl ? "مساحة العمل التشغيلية لإدارة ومتابعة مهام المؤسسة." : "Coordinate, schedule, and track enterprise task queues."}
            </p>
          </div>
          
          <div className="flex flex-wrap items-center gap-2">
            {/* View Mode Switcher */}
            <div className="relative flex items-center bg-bg-secondary p-1 rounded-xl border border-border-clean shadow-sm w-36 overflow-hidden select-none">
              {/* Sliding Active Backdrop */}
              <div
                className="absolute top-1 bottom-1 rounded-lg bg-bg-primary shadow-sm border border-border-clean/50 transition-all duration-300 ease-out"
                style={{
                  width: "calc(33.333% - 4px)",
                  transform: `translateX(${
                    viewMode === "list"
                      ? "0%"
                      : viewMode === "kanban"
                      ? isRtl ? "-100%" : "100%"
                      : isRtl ? "-200%" : "200%"
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
                onClick={() => handleViewChange("kanban")}
                title="Kanban Board"
                className={`relative z-10 flex-1 flex justify-center py-1.5 rounded-lg transition-colors duration-250 focus:outline-none ${
                  viewMode === "kanban" ? "text-brand-primary font-bold" : "text-text-secondary hover:text-text-primary"
                }`}
              >
                <Grid2X2 className="h-4 w-4" />
              </button>
              <button
                onClick={() => handleViewChange("calendar")}
                title="Calendar View"
                className={`relative z-10 flex-1 flex justify-center py-1.5 rounded-lg transition-colors duration-250 focus:outline-none ${
                  viewMode === "calendar" ? "text-brand-primary font-bold" : "text-text-secondary hover:text-text-primary"
                }`}
              >
                <CalendarIcon className="h-4 w-4" />
              </button>
            </div>

            <button
              onClick={openCreateModal}
              className="inline-flex items-center gap-1.5 rounded-xl bg-brand-primary px-3.5 py-2 text-xs font-bold text-bg-primary shadow-sm hover:bg-brand-secondary transition-all cursor-pointer focus:outline-none active:scale-95"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>{t.taskAddButton}</span>
            </button>
          </div>
        </div>

        {/* Analytics Summary Cards Section */}
        {viewMode === "list" && (
          <TaskMetricsSegmentedControl
            totalCount={isLoading ? 0 : analytics.total}
            filteredCount={isLoading ? 0 : (analytics.assigned ?? 0)}
            pendingCount={isLoading ? 0 : (analytics.pending ?? 0)}
            completedCount={isLoading ? 0 : (analytics.completed ?? 0)}
            activeTab={activeMetricTab}
            onTabChange={handleMetricTabChange}
            isRtl={isRtl}
          />
        )}

        {/* Filter Controls Panel */}
        <div className="space-y-4">
          <TaskFilters
            filters={filters}
            updateFilter={updateFilter}
            resetFilters={resetFilters}
            applySavedFilter={applySavedFilter}
          />
          
          <TaskSearchResults
            searchTerm={filters.searchTerm}
            matchCount={visibleTasks.length}
          />

          <FilterSummary
            filters={filters}
            onClearFilter={updateFilter}
            onReset={resetFilters}
            filteredCount={visibleTasks.length}
            totalCount={analytics.total}
          />
        </div>

        {/* Main Workspace Render View */}
        {isLoading ? (
          <TaskLoadingState />
        ) : error ? (
          <TaskErrorState error={error} onRetry={retry} isLoading={isLoading} />
        ) : viewMode === "list" ? (
          /* Full-width Task Table — no activity feed sidebar */
          <TaskTable
            tasks={paginatedTasks}
            onView={(id: string) => setViewedTask(allTasks.find((t: Task) => t.id === id) || null)}
            onEdit={(id: string) => { const task = allTasks.find((t: Task) => t.id === id); if (task) openEditModal(task); }}
            onDuplicate={(id: string) => duplicateTask(id)}
            onDelete={(id: string) => { const task = allTasks.find((t: Task) => t.id === id); if (task) openDeleteConfirm(task); }}
            onResetFilters={resetFilters}
            onAddTaskClick={openCreateModal}
            currentPage={currentPage}
            totalPages={totalPages}
            filteredCount={visibleTasks.length}
            itemsPerPage={ITEMS_PER_PAGE}
            onPageChange={(page) => setCurrentPage(page)}
          />
        ) : viewMode === "kanban" ? (
          <TaskKanban
            tasks={visibleTasks}
            onView={setViewedTask}
            onEdit={openEditModal}
            onStatusChange={handleStatusChange}
          />
        ) : (
          <TaskCalendar
            tasks={visibleTasks}
            onView={setViewedTask}
          />
        )}

        {/* Sliding Context Detail Drawer */}
        <TaskDetailDrawer
          task={viewedTask}
          onClose={() => setViewedTask(null)}
        />

        {/* Task Form Modal Overlay */}
        <TaskModal
          isOpen={isModalOpen}
          onClose={closeAll}
          onSubmit={modalMode === "create" ? handleCreate : handleUpdate}
          mode={modalMode}
          initialData={activeTask}
        />

        {/* Confirm Delete Alert Overlay */}
        <ConfirmDialog
          isOpen={isDeleteConfirmOpen}
          onClose={closeAll}
          onConfirm={handleDelete}
        />

        {/* Dynamic Toast Notifications Panel */}
        <div className={`fixed bottom-4 z-55 flex flex-col gap-2 max-w-sm w-full ${isRtl ? "left-4" : "right-4"}`}>
          {toasts.map((toast: { id: string; type: string; title: string; message: string }) => (
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
