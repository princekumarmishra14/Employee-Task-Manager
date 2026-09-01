"use client";

import React from "react";
import { Eye, Edit, Trash2, ShieldAlert, ArrowUpDown } from "lucide-react";
import StatusBadge from "../common/StatusBadge";
import { useTranslation } from "@/hooks/useTranslation";

export interface TableTaskItem {
  id: string;
  title: string;
  priority: "LOW" | "MEDIUM" | "HIGH" | "ESCALATED" | string;
  status: string;
  assigneeName?: string;
  assigneeAvatar?: string;
  dueDate: string;
}

interface TaskTableProps {
  tasks: TableTaskItem[];
  onViewDetails?: (taskId: string) => void;
  onEdit?: (taskId: string) => void;
  onDelete?: (taskId: string) => void;
  isLoading?: boolean;
}

const PRIORITY_STYLES: Record<string, string> = {
  LOW: "bg-bg-secondary text-text-muted border-border-clean",
  MEDIUM: "bg-status-info-bg text-status-info border-status-info/20",
  HIGH: "bg-status-warning-bg text-status-warning border-status-warning/20",
  ESCALATED: "bg-status-danger-bg text-status-danger border-status-danger/20 animate-pulse",
};

// Skeleton row component
function SkeletonRow() {
  return (
    <tr className="animate-pulse">
      <td className="py-4 px-5">
        <div className="h-3 w-48 rounded-full bg-bg-tertiary" />
      </td>
      <td className="py-4 px-5">
        <div className="h-5 w-16 rounded-full bg-bg-tertiary" />
      </td>
      <td className="py-4 px-5">
        <div className="h-5 w-20 rounded-full bg-bg-tertiary" />
      </td>
      <td className="py-4 px-5">
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 rounded-full bg-bg-tertiary" />
          <div className="h-3 w-24 rounded-full bg-bg-tertiary" />
        </div>
      </td>
      <td className="py-4 px-5">
        <div className="h-3 w-20 rounded-full bg-bg-tertiary" />
      </td>
      <td className="py-4 px-5">
        <div className="flex gap-1 justify-center">
          <div className="h-7 w-7 rounded-lg bg-bg-tertiary" />
          <div className="h-7 w-7 rounded-lg bg-bg-tertiary" />
        </div>
      </td>
    </tr>
  );
}

export default function TaskTable({
  tasks,
  onViewDetails,
  onEdit,
  onDelete,
  isLoading = false,
}: TaskTableProps) {
  const { t, isRtl } = useTranslation();

  const isOverdue = (dueDate: string, status: string) => {
    if (status === "COMPLETED") return false;
    return new Date(dueDate) < new Date();
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-border-clean bg-bg-primary shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[700px] dir-ltr">
          <thead>
            <tr className="border-b border-border-clean bg-bg-secondary text-[10px] font-black text-text-muted uppercase tracking-widest">
              <th className="py-3.5 px-5">
                <span className="flex items-center gap-1">
                  {isRtl ? "اسم المهمة" : "Task Name"}
                  <ArrowUpDown className="h-3 w-3 opacity-50" />
                </span>
              </th>
              <th className="py-3.5 px-5">{isRtl ? "الأولوية" : "Priority"}</th>
              <th className="py-3.5 px-5">{isRtl ? "الحالة" : "Status"}</th>
              <th className="py-3.5 px-5">{isRtl ? "المسؤول" : "Assignee"}</th>
              <th className="py-3.5 px-5">{isRtl ? "تاريخ التسليم" : "Due Date"}</th>
              <th className="py-3.5 px-5 text-center">{isRtl ? "الإجراءات" : "Actions"}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-clean text-sm font-poppins">
            {isLoading ? (
              <>
                <SkeletonRow />
                <SkeletonRow />
                <SkeletonRow />
                <SkeletonRow />
              </>
            ) : tasks.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-14 text-center">
                  <div className="flex flex-col items-center justify-center gap-3">
                    <ShieldAlert className="h-10 w-10 text-text-muted opacity-50" />
                    <p className="text-sm font-bold text-text-muted">{t.noData}</p>
                  </div>
                </td>
              </tr>
            ) : (
              tasks.map((task) => {
                const overdue = isOverdue(task.dueDate, task.status);
                const priorityStyle =
                  PRIORITY_STYLES[task.priority?.toUpperCase?.()] ||
                  "bg-bg-secondary text-text-muted border-border-clean";

                return (
                  <tr
                    key={task.id}
                    className="hover:bg-bg-secondary transition-colors group"
                  >
                    {/* Task Name */}
                    <td className="py-3.5 px-5 max-w-[240px]">
                      <span className="font-bold text-text-primary truncate block group-hover:text-brand-primary transition-colors">
                        {task.title}
                      </span>
                    </td>

                    {/* Priority */}
                    <td className="py-3.5 px-5">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-black border uppercase tracking-wide ${priorityStyle}`}
                      >
                        {task.priority}
                      </span>
                    </td>

                    {/* Status Badge */}
                    <td className="py-3.5 px-5">
                      <StatusBadge status={task.status} />
                    </td>

                    {/* Assignee */}
                    <td className="py-3.5 px-5">
                      {task.assigneeName ? (
                        <div className="flex items-center gap-2">
                          {task.assigneeAvatar && (
                            <img
                              src={task.assigneeAvatar}
                              alt={task.assigneeName}
                              className="h-6 w-6 rounded-full object-cover border border-border-clean shadow-sm"
                            />
                          )}
                          <span className="text-xs font-semibold text-text-primary">
                            {task.assigneeName}
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs text-text-muted italic font-medium">
                          {isRtl ? "غير معين" : "Unassigned"}
                        </span>
                      )}
                    </td>

                    {/* Due Date */}
                    <td className="py-3.5 px-5">
                      <span
                        className={`text-xs font-semibold ${
                          overdue ? "text-status-danger font-bold" : "text-text-secondary"
                        }`}
                      >
                        {overdue && (
                          <span className="mr-1 text-[9px] font-black uppercase tracking-wide">
                            ⚠
                          </span>
                        )}
                        {new Date(task.dueDate).toLocaleDateString([], {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-5 text-center">
                      <div className="flex items-center justify-center gap-1">
                        {onViewDetails && (
                          <button
                            onClick={() => onViewDetails(task.id)}
                            title={isRtl ? "عرض" : "View Details"}
                            className="rounded-lg p-1.5 text-text-muted hover:bg-brand-muted hover:text-brand-primary transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                        )}
                        {onEdit && (
                          <button
                            onClick={() => onEdit(task.id)}
                            title={isRtl ? "تعديل" : "Edit"}
                            className="rounded-lg p-1.5 text-text-muted hover:bg-status-info-bg hover:text-status-info transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-status-info"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                        )}
                        {onDelete && (
                          <button
                            onClick={() => onDelete(task.id)}
                            title={isRtl ? "حذف" : "Delete"}
                            className="rounded-lg p-1.5 text-text-muted hover:bg-status-danger-bg hover:text-status-danger transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-status-danger"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
