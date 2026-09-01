"use client";

import React from "react";
import { TaskPriority } from "@/types/task.types";
import { TASK_PRIORITIES } from "@/constants/task.constants";
import { useTranslation } from "@/hooks/useTranslation";

interface TaskPriorityBadgeProps {
  priority: TaskPriority;
}

export default function TaskPriorityBadge({ priority }: TaskPriorityBadgeProps) {
  const { currentLanguage } = useTranslation();
  const config = TASK_PRIORITIES[priority];

  if (!config) return null;

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold border ${config.bg} ${config.color} transition-all font-poppins`}
    >
      {currentLanguage === "ar" ? config.arLabel : config.label}
    </span>
  );
}
