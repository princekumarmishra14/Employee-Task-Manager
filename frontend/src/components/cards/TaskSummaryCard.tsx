"use client";

import React from "react";
import { TrendingUp, TrendingDown } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";

interface TaskSummaryCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  trend?: {
    value: string | number;
    isPositive: boolean;
  };
  description: string;
  cardType?: "total" | "pending" | "progress" | "completed";
  onClick?: () => void;
  isPositive?: boolean;
}

export default function TaskSummaryCard({
  title,
  value,
  icon,
  trend,
  description,
  cardType = "total",
  onClick,
  isPositive: isPositiveProp,
}: TaskSummaryCardProps) {
  const { isRtl } = useTranslation();

  const getBorderColor = (type: string) => {
    switch (type) {
      case "total": return "border-border-clean hover:border-brand-primary/40";
      case "pending": return "border-border-clean hover:border-status-warning/40";
      case "progress": return "border-border-clean hover:border-status-info/40";
      case "completed": return "border-border-clean hover:border-status-success/40";
      default: return "border-border-clean";
    }
  };

  const getIconContainerColor = (type: string) => {
    switch (type) {
      case "total": return "bg-brand-muted text-brand-primary";
      case "pending": return "bg-status-warning-bg text-status-warning";
      case "progress": return "bg-status-info-bg text-status-info";
      case "completed": return "bg-status-success-bg text-status-success";
      default: return "bg-bg-secondary text-text-secondary";
    }
  };

  const positivePath = "M0 35 Q 15 25 30 28 Q 45 15 60 10 Q 75 25 90 20 Q 105 5 120 5 Q 135 15 150 15 Q 165 2 180 2 Q 200 8 220 8";
  const positiveArea = "M0 35 Q 15 25 30 28 Q 45 15 60 10 Q 75 25 90 20 Q 105 5 120 5 Q 135 15 150 15 Q 165 2 180 2 Q 200 8 220 8 V44 H0 Z";
  const negativePath = "M0 5 Q 15 15 30 10 Q 45 15 60 25 Q 75 20 90 15 Q 105 25 120 35 Q 135 25 150 20 Q 165 30 180 38 Q 200 35 220 32";
  const negativeArea = "M0 5 Q 15 15 30 10 Q 45 15 60 25 Q 75 20 90 15 Q 105 25 120 35 Q 135 25 150 20 Q 165 30 180 38 Q 200 35 220 32 V44 H0 Z";

  const isPositive = isPositiveProp !== undefined ? isPositiveProp : (trend ? trend.isPositive : true);

  const getGlowShadow = (type: string) => {
    switch (type) {
      case "total": return "hover:shadow-glow-primary";
      case "pending": return "hover:shadow-glow-warning";
      case "progress": return "hover:shadow-glow-primary";
      case "completed": return "hover:shadow-glow-success";
      default: return "";
    }
  };

  const isClickable = !!onClick;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (isClickable && (e.key === "Enter" || e.key === " ")) {
      e.preventDefault();
      onClick?.();
    }
  };

  return (
    <div
      role={isClickable ? "button" : undefined}
      tabIndex={isClickable ? 0 : undefined}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      aria-label={isClickable ? `View ${title}` : undefined}
      className={`group relative overflow-hidden rounded-2xl border bg-bg-primary p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 ${getGlowShadow(cardType)} ${getBorderColor(cardType)} ${isClickable ? "cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary" : ""
        }`}
    >
      {/* Background radial glow */}
      <div className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-brand-primary/5 blur-2xl group-hover:bg-brand-primary/10 transition-all duration-300 pointer-events-none" />

      {/* Click indicator */}
      {isClickable && (
        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <span className="text-[9px] font-bold text-text-muted uppercase tracking-wider flex items-center gap-0.5">
            View →
          </span>
        </div>
      )}

      <div className="flex items-center justify-between relative z-10">
        <span className="text-xs font-bold text-text-secondary uppercase tracking-wider">
          {title}
        </span>
        <div className={`rounded-xl p-2.5 transition-transform duration-300 group-hover:rotate-6 ${getIconContainerColor(cardType)}`}>
          {icon}
        </div>
      </div>

      <div className="mt-4 relative z-10 flex items-end justify-between">
        <div>
          <h3 className="text-3xl font-black tracking-tight text-text-primary">
            {value}
          </h3>

          <div className="mt-2 flex items-center gap-1.5 text-xs">
            {trend && (
              <span
                className={`flex items-center gap-0.5 font-bold ${trend.isPositive ? "text-status-success" : "text-status-danger"
                  }`}
              >
                {trend.isPositive ? (
                  <TrendingUp className="h-3.5 w-3.5" />
                ) : (
                  <TrendingDown className="h-3.5 w-3.5" />
                )}
                <span>{trend.value}%</span>
              </span>
            )}
            <span className="text-text-muted font-semibold">
              {description}
            </span>
          </div>
        </div>

        {/* Sparkline graph — full viewBox, no clipping */}
        <div className="w-24 h-10 shrink-0 opacity-80 group-hover:opacity-100 transition-opacity overflow-visible">
          <svg className="w-full h-full" viewBox="0 0 220 44" fill="none" preserveAspectRatio="none">
            <defs>
              <linearGradient id={`grad-${cardType}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={isPositive ? "var(--status-success)" : "var(--status-danger)"} stopOpacity="0.25" />
                <stop offset="100%" stopColor={isPositive ? "var(--status-success)" : "var(--status-danger)"} stopOpacity="0.0" />
              </linearGradient>
            </defs>
            <path
              d={isPositive ? positiveArea : negativeArea}
              fill={`url(#grad-${cardType})`}
            />
            <path
              d={isPositive ? positivePath : negativePath}
              stroke={isPositive ? "var(--status-success)" : "var(--status-danger)"}
              strokeWidth="2"
              strokeLinecap="round"
              fill="none"
            />
          </svg>
        </div>
      </div>
    </div>
  );
}
