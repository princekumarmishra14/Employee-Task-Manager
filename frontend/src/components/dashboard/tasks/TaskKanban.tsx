"use client";

import React from "react";
import { useTranslation } from "@/hooks/useTranslation";
import { Calendar, User2, AlertCircle } from "lucide-react";
import { Task } from "@/types/task.types";

interface TaskKanbanProps {
  tasks: Task[];
  onView?: (task: Task) => void;
  onEdit?: (task: Task) => void;
  onStatusChange: (taskId: string, newStatus: Task["status"]) => void;
}

export default function TaskKanban({
  tasks,
  onView,
  onStatusChange,
}: TaskKanbanProps) {
  const { t, isRtl } = useTranslation();

  // Columns specification
  const columns: { id: Task["status"]; label: string; arLabel: string; color: string }[] = [
    { id: "UNASSIGNED", label: "Unassigned", arLabel: "غير معين", color: "border-t-text-muted" },
    { id: "ASSIGNED", label: "Assigned", arLabel: "معينة", color: "border-t-status-info" },
    { id: "IN_PROGRESS", label: "In Progress", arLabel: "قيد التنفيذ", color: "border-t-brand-primary" },
    { id: "COMPLETED", label: "Completed", arLabel: "مكتملة", color: "border-t-status-success" },
  ];

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData("text/plain", taskId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetStatus: Task["status"]) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData("text/plain");
    if (taskId) {
      onStatusChange(taskId, targetStatus);
    }
  };

  const getPriorityColor = (prio: string) => {
    switch (prio) {
      case "LOW": return "bg-bg-tertiary text-text-secondary border-border-clean";
      case "MEDIUM": return "bg-status-info-bg text-status-info border-status-info/20";
      case "HIGH": return "bg-status-warning-bg text-status-warning border-status-warning/20";
      case "ESCALATED": return "bg-status-danger-bg text-status-danger border-status-danger/20 animate-pulse";
      default: return "bg-bg-secondary text-text-secondary border-border-clean";
    }
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 font-poppins items-start">
      {columns.map((col) => {
        // Group tasks by status (consider UNASSIGNED/PENDING together if needed, or map strictly)
        const colTasks = tasks.filter(
          (t) => 
            !t.isDeleted && 
            t.status === col.id
        );

        return (
          <div
            key={col.id}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, col.id)}
            className={`flex flex-col rounded-2xl border border-border-clean bg-bg-secondary p-4 min-h-[500px] transition-colors duration-200 border-t-4 ${col.color}`}
          >
            {/* Column Header */}
            <div className="flex items-center justify-between mb-4 border-b border-border-clean/50 pb-2">
              <span className="text-xs font-bold text-text-primary uppercase tracking-wider">
                {isRtl ? col.arLabel : col.label}
              </span>
              <span className="rounded-full bg-bg-primary border border-border-clean px-2 py-0.5 text-[10px] font-bold text-text-secondary shadow-sm">
                {colTasks.length}
              </span>
            </div>

            {/* Task Cards Stack */}
            <div className="flex-1 flex flex-col gap-3 overflow-y-auto max-h-[600px] pr-1">
              {colTasks.map((task) => {
                const isOverdue = task.status === "OVERDUE" || (new Date(task.dueDate).getTime() < Date.now() && task.status !== "COMPLETED");

                return (
                  <div
                    key={task.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, task.id)}
                    onClick={() => onView?.(task)}
                    className="group relative flex flex-col justify-between rounded-xl border border-border-clean bg-bg-primary p-4 shadow-sm transition-all duration-300 hover:border-brand-primary/20 hover:shadow-glow-primary cursor-grab active:cursor-grabbing"
                  >
                    {/* Top Row Priority & Deadlines */}
                    <div className="flex items-center justify-between mb-2">
                      <span className={`rounded px-1.5 py-0.5 text-[9px] font-extrabold uppercase border ${getPriorityColor(task.priority)}`}>
                        {task.priority}
                      </span>
                      {isOverdue && (
                        <span className="flex items-center gap-0.5 text-[9px] font-extrabold text-status-danger bg-status-danger-bg border border-status-danger/10 px-1.5 py-0.5 rounded animate-pulse">
                          <AlertCircle className="h-3 w-3" />
                          <span>OVERDUE</span>
                        </span>
                      )}
                    </div>

                    {/* Task Title */}
                    <h5 className="text-xs font-bold text-text-primary group-hover:text-brand-primary transition-colors leading-relaxed line-clamp-1">
                      {task.title}
                    </h5>

                    {/* Task Description */}
                    {task.description && (
                      <p className="text-[10px] text-text-secondary line-clamp-2 mt-1.5 leading-relaxed font-semibold">
                        {task.description}
                      </p>
                    )}

                    {/* Footer Info assignee & calendar */}
                    <div className="border-t border-border-clean/50 pt-3 mt-3 flex items-center justify-between text-[9px] font-semibold text-text-secondary">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3 text-text-muted" />
                        <span>
                          {new Date(task.dueDate).toLocaleDateString([], { month: "short", day: "numeric" })}
                        </span>
                      </div>
                      
                      {/* Assignee Avatar */}
                      <div className="flex items-center gap-1">
                        {task.assignedTo ? (
                          <img
                            src={task.assignedTo.avatarUrl || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e"}
                            alt={task.assignedTo.name}
                            className="h-5 w-5 rounded-full object-cover border border-border-clean shadow-sm"
                          />
                        ) : (
                          <div className="flex h-5 w-5 items-center justify-center rounded-full border border-dashed border-border-clean bg-bg-secondary text-text-muted">
                            <User2 className="h-3 w-3" />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}

              {colTasks.length === 0 && (
                <div className="flex-1 flex flex-col items-center justify-center py-10 border border-dashed border-border-clean/60 rounded-xl bg-bg-primary/50 text-[10px] text-text-muted">
                  {isRtl ? "اسحب المهام هنا" : "Drop tasks here"}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
