"use client";

import React from "react";

export type TaskStatusType = "PENDING" | "IN_PROGRESS" | "COMPLETED" | "OVERDUE" | "CANCELLED" | "UNASSIGNED" | "ASSIGNED" | "ARCHIVED";

interface StatusBadgeProps {
  status: TaskStatusType | string;
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const normalizedStatus = status.toUpperCase().replace(/\s+/g, "_") as TaskStatusType;

  const getStatusStyles = (statusVal: TaskStatusType) => {
    switch (statusVal) {
      case "PENDING":
      case "UNASSIGNED":
        return {
          bg: "bg-bg-tertiary text-text-secondary border-border-clean",
          label: "Pending",
          arLabel: "قيد الانتظار"
        };
      case "ASSIGNED":
        return {
          bg: "bg-status-info-bg text-status-info border-status-info/20",
          label: "Assigned",
          arLabel: "معينة"
        };
      case "IN_PROGRESS":
        return {
          bg: "bg-brand-muted text-brand-primary border-brand-primary/20",
          label: "In Progress",
          arLabel: "قيد التنفيذ"
        };
      case "COMPLETED":
        return {
          bg: "bg-status-success-bg text-status-success border-status-success/20",
          label: "Completed",
          arLabel: "مكتملة"
        };
      case "OVERDUE":
        return {
          bg: "bg-status-danger-bg text-status-danger border-status-danger/20 animate-pulse",
          label: "Overdue",
          arLabel: "متأخرة"
        };
      case "CANCELLED":
        return {
          bg: "bg-bg-secondary text-text-muted border-border-clean",
          label: "Cancelled",
          arLabel: "ملغاة"
        };
      case "ARCHIVED":
        return {
          bg: "bg-bg-tertiary text-text-muted border-border-clean",
          label: "Archived",
          arLabel: "مؤرشفة"
        };
      default:
        return {
          bg: "bg-bg-secondary text-text-secondary border-border-clean",
          label: status,
          arLabel: status
        };
    }
  };

  const { bg, label, arLabel } = getStatusStyles(normalizedStatus);

  return (
    <span
      role="status"
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${bg} transition-all`}
    >
      <span className="hidden lang-en inline">{label}</span>
      <span className="hidden lang-ar inline">{arLabel}</span>
      {/* Fallback client detection for translate hooks */}
      <span className="inline lang-detect">{label}</span>
      
      {/* Inject styling rules to support language-switching detection without complex triggers */}
      <style jsx global>{`
        html[lang="ar"] .lang-en { display: none !important; }
        html[lang="ar"] .lang-ar { display: inline !important; }
        html[lang="ar"] .lang-detect { display: none !important; }

        html[lang="en"] .lang-en { display: inline !important; }
        html[lang="en"] .lang-ar { display: none !important; }
        html[lang="en"] .lang-detect { display: none !important; }
      `}</style>
    </span>
  );
}
