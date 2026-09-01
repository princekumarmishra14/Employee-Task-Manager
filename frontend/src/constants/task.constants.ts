import { TaskPriority, TaskStatus } from "../types/task.types";

export const TASK_PRIORITIES: Record<
  TaskPriority,
  { id: TaskPriority; label: string; arLabel: string; color: string; bg: string }
> = {
  LOW: {
    id: "LOW",
    label: "Low",
    arLabel: "منخفضة",
    color: "text-text-secondary",
    bg: "bg-bg-tertiary border-border-clean",
  },
  MEDIUM: {
    id: "MEDIUM",
    label: "Medium",
    arLabel: "متوسطة",
    color: "text-status-info",
    bg: "bg-status-info-bg border-status-info/20",
  },
  HIGH: {
    id: "HIGH",
    label: "High",
    arLabel: "عالية",
    color: "text-status-warning",
    bg: "bg-status-warning-bg border-status-warning/20",
  },
  ESCALATED: {
    id: "ESCALATED",
    label: "Escalated",
    arLabel: "مرفوعة",
    color: "text-status-danger",
    bg: "bg-status-danger-bg border-status-danger/20 animate-pulse",
  },
};

export const TASK_STATUSES: Record<
  TaskStatus,
  { id: TaskStatus; label: string; arLabel: string; color: string; bg: string }
> = {
  UNASSIGNED: {
    id: "UNASSIGNED",
    label: "Unassigned",
    arLabel: "غير معين",
    color: "text-text-muted",
    bg: "bg-bg-secondary border-border-clean",
  },
  ASSIGNED: {
    id: "ASSIGNED",
    label: "Assigned",
    arLabel: "معينة",
    color: "text-status-info",
    bg: "bg-status-info-bg border-status-info/20",
  },
  IN_PROGRESS: {
    id: "IN_PROGRESS",
    label: "In Progress",
    arLabel: "قيد التنفيذ",
    color: "text-brand-primary",
    bg: "bg-brand-muted border-brand-primary/20",
  },
  COMPLETED: {
    id: "COMPLETED",
    label: "Completed",
    arLabel: "مكتملة",
    color: "text-status-success",
    bg: "bg-status-success-bg border-status-success/20",
  },
  OVERDUE: {
    id: "OVERDUE",
    label: "Overdue",
    arLabel: "متأخرة",
    color: "text-status-danger",
    bg: "bg-status-danger-bg border-status-danger/20 animate-pulse",
  },
  ARCHIVED: {
    id: "ARCHIVED",
    label: "Archived",
    arLabel: "مؤرشفة",
    color: "text-text-secondary",
    bg: "bg-bg-tertiary border-border-clean",
  },
};
