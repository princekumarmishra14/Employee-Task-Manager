"use client";

import React from "react";
import { TaskStatus } from "@/types/task.types";
import { TASK_STATUSES } from "@/constants/task.constants";
import { useTranslation } from "@/hooks/useTranslation";

interface TaskStatusBadgeProps {
  status: TaskStatus;
}

export default function TaskStatusBadge({ status }: TaskStatusBadgeProps) {
  const { currentLanguage } = useTranslation();
  const config = TASK_STATUSES[status];

  if (!config) return null;

  return (
    <span
      role="status"
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${config.bg} ${config.color} transition-all font-poppins`}
    >
      {currentLanguage === "ar" ? config.arLabel : config.label}
    </span>
  );
}
