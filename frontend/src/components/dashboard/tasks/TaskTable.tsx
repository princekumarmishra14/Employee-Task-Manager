"use client";

import React from "react";
import { Task } from "@/types/task.types";
import TaskStatusBadge from "./TaskStatusBadge";
import TaskPriorityBadge from "./TaskPriorityBadge";
import TaskActionMenu from "./TaskActionMenu";
import TaskEmptyState from "./TaskEmptyState";
import { formatDate } from "@/utils/date";
import { useTranslation } from "@/hooks/useTranslation";

import { ChevronLeft, ChevronRight } from "lucide-react";

interface TaskTableProps {
  tasks: Task[];
  onView?: (id: string) => void;
  onEdit?: (id: string) => void;
  onDuplicate?: (id: string) => void;
  onDelete?: (id: string) => void;
  onAddTaskClick?: () => void;
  onResetFilters?: () => void;
  // Pagination
  currentPage: number;
  totalPages: number;
  filteredCount: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
}

export default function TaskTable({
  tasks,
  onView,
  onEdit,
  onDuplicate,
  onDelete,
  onAddTaskClick,
  onResetFilters,
  currentPage,
  totalPages,
  filteredCount,
  itemsPerPage,
  onPageChange,
}: TaskTableProps) {
  const { t, isRtl } = useTranslation();

  if (tasks.length === 0) {
    return (
      <TaskEmptyState
        onActionClick={onAddTaskClick}
        actionLabel={isRtl ? "إنشاء أول مهمة" : "Create First Task"}
        onResetFilters={onResetFilters}
      />
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-border-clean bg-bg-primary shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[950px] dir-ltr">
          <thead>
            <tr className="border-b border-border-clean bg-bg-secondary text-[10px] font-black text-text-muted uppercase tracking-widest">
              <th className="py-3.5 px-5">{isRtl ? "المهمة" : "Task"}</th>
              <th className="py-3.5 px-5">{isRtl ? "الوصف" : "Description"}</th>
              <th className="py-3.5 px-5">{isRtl ? "القسم" : "Department"}</th>
              <th className="py-3.5 px-5">{isRtl ? "المسؤول" : "Assigned To"}</th>
              <th className="py-3.5 px-5">{t.priority}</th>
              <th className="py-3.5 px-5">{t.status}</th>
              <th className="py-3.5 px-5">{isRtl ? "تاريخ الاستحقاق" : "Due Date"}</th>
              <th className="py-3.5 px-5">{isRtl ? "تاريخ الإنشاء" : "Created"}</th>
              <th className="py-3.5 px-5 text-center">{isRtl ? "الإجراءات" : "Actions"}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-clean text-sm font-poppins">
            {tasks.map((task) => (
              <tr
                key={task.id}
                className="hover:bg-bg-secondary transition-colors group"
              >
                {/* Title */}
                <td className="py-3.5 px-5 font-bold text-text-primary max-w-[180px] truncate">
                  {task.title}
                </td>

                {/* Description */}
                <td className="py-3.5 px-5 text-xs font-medium text-text-secondary max-w-[200px] truncate">
                  {task.description}
                </td>

                {/* Department */}
                <td className="py-3.5 px-5 text-xs font-bold text-brand-primary max-w-[120px] truncate uppercase">
                  {task.department || "-"}
                </td>

                {/* Assigned To */}
                <td className="py-3.5 px-5">
                  {task.assignedTo ? (
                    <div className="flex items-center gap-2">
                      <img
                        src={task.assignedTo.avatarUrl}
                        alt={task.assignedTo.name}
                        className="h-6 w-6 rounded-full object-cover border border-border-clean"
                      />
                      <span className="text-xs font-semibold text-text-primary">
                        {task.assignedTo.name}
                      </span>
                    </div>
                  ) : (
                    <span className="text-xs text-text-muted italic">
                      {isRtl ? "غير معين" : "Unassigned"}
                    </span>
                  )}
                </td>

                {/* Priority */}
                <td className="py-3.5 px-5">
                  <TaskPriorityBadge priority={task.priority} />
                </td>

                {/* Status */}
                <td className="py-3.5 px-5">
                  <TaskStatusBadge status={task.status} />
                </td>

                {/* Due Date */}
                <td className="py-3.5 px-5 text-xs text-text-secondary font-semibold">
                  {formatDate(task.dueDate)}
                </td>

                {/* Created Date */}
                <td className="py-3.5 px-5 text-xs text-text-muted">
                  {formatDate(task.createdAt)}
                </td>

                {/* Actions */}
                <td className="py-3.5 px-5 text-center">
                  <TaskActionMenu
                    taskId={task.id}
                    onView={onView}
                    onEdit={onEdit}
                    onDuplicate={onDuplicate}
                    onDelete={onDelete}
                  />
                </td>
              </tr>
            ))}
            {tasks.length === 0 && (
              <tr>
                <td colSpan={9} className="text-center py-12 text-text-muted font-semibold text-sm">
                  {t.noData}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-border-clean px-6 py-4 bg-bg-secondary">
          <span className="text-xs text-text-muted font-semibold">
            {isRtl
              ? `عرض ${(currentPage - 1) * itemsPerPage + 1} إلى ${Math.min(currentPage * itemsPerPage, filteredCount)} من أصل ${filteredCount} مهمة`
              : `Showing ${(currentPage - 1) * itemsPerPage + 1} – ${Math.min(currentPage * itemsPerPage, filteredCount)} of ${filteredCount} tasks`}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border-clean bg-bg-primary text-text-secondary hover:bg-bg-tertiary disabled:opacity-40 cursor-pointer focus:outline-none"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="text-xs font-black text-text-primary tabular-nums">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border-clean bg-bg-primary text-text-secondary hover:bg-bg-tertiary disabled:opacity-40 cursor-pointer focus:outline-none"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
