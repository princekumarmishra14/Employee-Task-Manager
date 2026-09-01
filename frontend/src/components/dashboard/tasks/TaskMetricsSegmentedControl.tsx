"use client";

import React from "react";
import { ListTodo, Inbox, Clock, CheckCircle2 } from "lucide-react";

interface TaskMetricsSegmentedControlProps {
  totalCount: number;
  filteredCount: number;
  pendingCount: number;
  completedCount: number;
  activeTab: "total" | "filtered" | "pending" | "completed";
  onTabChange: (tab: "total" | "filtered" | "pending" | "completed") => void;
  isRtl: boolean;
}

export default function TaskMetricsSegmentedControl({
  totalCount,
  filteredCount,
  pendingCount,
  completedCount,
  activeTab,
  onTabChange,
  isRtl,
}: TaskMetricsSegmentedControlProps) {
  // Sparkline path templates
  const positivePath = "M0 14 Q 8 8 16 10 T 32 4 T 48 8 T 64 2 T 80 6 T 96 1 T 120 3";
  const positiveArea = "M0 14 Q 8 8 16 10 T 32 4 T 48 8 T 64 2 T 80 6 T 96 1 T 120 3 V18 H0 Z";

  const segments = [
    {
      id: "total" as const,
      title: isRtl ? "إجمالي المهام" : "TOTAL TASKS",
      count: totalCount,
      subtext: isRtl ? "المهام المسجلة" : "All registered tasks",
      icon: <ListTodo className="h-3.5 w-3.5" />,
      sparklineId: "spark-total",
    },
    {
      id: "filtered" as const,
      title: isRtl ? "مهام معينة" : "ASSIGNED TASKS",
      count: filteredCount,
      subtext: isRtl ? "تم تعيينها لموظفين" : "Assigned to employees",
      icon: <Inbox className="h-3.5 w-3.5" />,
      sparklineId: "spark-filtered",
    },
    {
      id: "pending" as const,
      title: isRtl ? "غير معينة" : "NOT ASSIGNED",
      count: pendingCount,
      subtext: isRtl ? "بانتظار التعيين" : "Awaiting assignment",
      icon: <Clock className="h-3.5 w-3.5" />,
      sparklineId: "spark-pending",
    },
    {
      id: "completed" as const,
      title: isRtl ? "المهام المكتملة" : "COMPLETED TASKS",
      count: completedCount,
      subtext: isRtl ? "المخرجات المنجزة" : "Deliverables met",
      icon: <CheckCircle2 className="h-3.5 w-3.5" />,
      sparklineId: "spark-completed",
    },
  ];

  return (
    <div className="w-full bg-bg-secondary border border-border-clean rounded-xl p-1 shadow-sm font-poppins select-none">
      <div className="flex flex-col md:flex-row gap-1 w-full">
        {segments.map((seg) => {
          const isActive = activeTab === seg.id;

          // Grey/White segmented tab styling (Vercel/Linear style)
          const textClass = isActive ? "text-brand-primary" : "text-text-primary";
          const iconClass = isActive
            ? "bg-brand-muted text-brand-primary"
            : "bg-bg-secondary text-text-secondary dark:bg-bg-tertiary";
          const sparklineColor = isActive ? "var(--brand-primary)" : "var(--text-muted)";

          return (
            <button
              key={seg.id}
              onClick={() => onTabChange(seg.id)}
              className={`flex-1 p-2.5 flex flex-col justify-between text-left transition-all duration-200 rounded-lg relative focus:outline-none hover:-translate-y-0.5 ${isActive
                ? "bg-bg-primary shadow-sm border border-border-clean/80"
                : "bg-transparent hover:bg-bg-primary/30 border border-transparent"
                } ${isRtl ? "text-right" : "text-left"}`}
            >
              {/* Top Row: Title & Icon */}
              <div className="flex items-center justify-between w-full">
                <span
                  className={`text-[8px] font-black uppercase tracking-wider ${isActive ? "text-brand-primary" : "text-text-secondary"
                    }`}
                >
                  {seg.title}
                </span>
                <div
                  className={`rounded-lg p-1 transition-transform duration-300 ${isActive ? "scale-105 rotate-3" : "opacity-80"
                    } ${iconClass}`}
                >
                  {seg.icon}
                </div>
              </div>

              {/* Bottom Row: Count & Sparkline */}
              <div className="mt-1.5 flex items-end justify-between w-full gap-4">
                <div>
                  <h3
                    className={`text-lg font-black tracking-tight transition-colors duration-250 ${textClass}`}
                  >
                    {seg.count}
                  </h3>
                  <p className="text-[8px] font-bold text-text-muted mt-0.5">
                    {seg.subtext}
                  </p>
                </div>

                {/* Micro sparkline */}
                <div
                  className={`w-14 h-5 shrink-0 transition-opacity duration-300 ${isActive ? "opacity-100" : "opacity-40 hover:opacity-75"
                    }`}
                >
                  <svg className="w-full h-full" viewBox="0 0 120 18" fill="none" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id={`${seg.sparklineId}-grad`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={sparklineColor} stopOpacity={isActive ? "0.15" : "0.2"} />
                        <stop offset="100%" stopColor={sparklineColor} stopOpacity="0.0" />
                      </linearGradient>
                    </defs>
                    <path d={positiveArea} fill={`url(#${seg.sparklineId}-grad)`} />
                    <path
                      d={positivePath}
                      stroke={sparklineColor}
                      strokeWidth="1.2"
                      strokeLinecap="round"
                      fill="none"
                    />
                  </svg>
                </div>
              </div>

              {/* Subtle brand color bottom border indicator */}
              {isActive && (
                <div className="absolute bottom-0 left-2 right-2 h-0.5 bg-brand-primary rounded-t-full" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
