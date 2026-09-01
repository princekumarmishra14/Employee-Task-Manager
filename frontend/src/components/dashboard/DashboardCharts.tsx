"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "@/hooks/useTranslation";
import { ArrowUpRight } from "lucide-react";
import { Task, Department } from "@/data/seedData";

interface DashboardChartsProps {
  tasks: Task[];
  departments: Department[];
}

export default function DashboardCharts({ tasks, departments }: DashboardChartsProps) {
  const { t, isRtl } = useTranslation();
  const router = useRouter();

  const activeTasks = tasks.filter((t) => !t.isDeleted);
  const totalTasks = activeTasks.length || 1;

  const completed = activeTasks.filter((t) => t.status === "COMPLETED").length;
  const inProgress = activeTasks.filter((t) => t.status === "IN_PROGRESS").length;
  const pending = activeTasks.filter(
    (t) => t.status === "ASSIGNED" || t.status === "UNASSIGNED"
  ).length;
  const overdue = activeTasks.filter((t) => t.status === "OVERDUE").length;

  const statusData = [
    {
      label: isRtl ? "مكتملة" : "Completed",
      count: completed,
      color: "var(--status-success)",
      status: "COMPLETED",
    },
    {
      label: isRtl ? "قيد التنفيذ" : "In Progress",
      count: inProgress,
      color: "var(--brand-primary)",
      status: "IN_PROGRESS",
    },
    {
      label: isRtl ? "قيد الانتظار" : "Pending",
      count: pending,
      color: "var(--status-info)",
      status: "PENDING",
    },
    {
      label: isRtl ? "متأخرة" : "Overdue",
      count: overdue,
      color: "var(--status-danger)",
      status: "OVERDUE",
    },
  ];

  // ─── Correct SVG Donut Arc Calculation ───────────────────────────────────
  // Each segment: strokeDasharray = circumference, strokeDashoffset = (1 - fraction) * circumference
  // Rotation is applied via CSS transform so each arc starts where the last ended.
  const radius = 42;
  const circumference = 2 * Math.PI * radius; // ≈ 263.89
  const cx = 55;
  const cy = 55;

  let cumulativeAngle = -90; // Start at top (12 o'clock)

  // ─── Department Productivity ──────────────────────────────────────────────
  const deptData = departments
    .slice(0, 5)
    .map((dept) => {
      const deptTasks = activeTasks.filter((t) => t.departmentId === dept.id);
      const deptCompleted = deptTasks.filter((t) => t.status === "COMPLETED").length;
      const rate = deptTasks.length > 0
        ? Math.round((deptCompleted / deptTasks.length) * 100)
        : 0;
      return { name: dept.name, tasksCount: deptTasks.length, rate };
    })
    .sort((a, b) => b.rate - a.rate);

  // ─── Weekly Performance (dynamic calculation) ──────────────────────────────
  const getWeeklyData = () => {
    const weekdaysEn = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const weekdaysAr = ["أحد", "اثنين", "ثلاثاء", "أربعاء", "خميس", "جمعة", "سبت"];

    const result = [];
    const today = new Date();

    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      d.setHours(23, 59, 59, 999);

      const dayIndex = d.getDay();
      const label = isRtl ? weekdaysAr[dayIndex] : weekdaysEn[dayIndex];

      // Tasks active up to this day
      const tasksUpToDay = activeTasks.filter(t => new Date(t.createdAt).getTime() <= d.getTime());

      // Completed tasks up to this day
      const completedUpToDay = tasksUpToDay.filter(t => {
        if (t.status !== "COMPLETED") return false;
        return new Date(t.updatedAt).getTime() <= d.getTime();
      });

      const rate = tasksUpToDay.length > 0
        ? Math.round((completedUpToDay.length / tasksUpToDay.length) * 100)
        : 65; // fall-back benchmark

      result.push({ label, rate });
    }

    return result;
  };

  const days = getWeeklyData();

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 font-poppins select-none">

      {/* ── Chart 1: Task Status Donut ───────────────────────────────────── */}
      <div className="rounded-2xl border border-border-clean bg-bg-primary p-5 shadow-sm flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-xs font-black text-text-secondary uppercase tracking-wider">
            {isRtl ? "توزيع حالات المهام" : "Task Status Distribution"}
          </h4>
          <button
            onClick={() => router.push("/tasks")}
            className="text-[10px] font-bold text-brand-primary hover:underline flex items-center gap-0.5 uppercase"
          >
            {isRtl ? "عرض" : "View"}
            <ArrowUpRight className="h-3 w-3" />
          </button>
        </div>

        <div className="flex flex-row items-center justify-around gap-4 flex-1">
          {/* Donut SVG */}
          <div className="relative w-28 h-28 shrink-0">
            <svg
              className="w-full h-full"
              viewBox="0 0 110 110"
              role="img"
              aria-label="Task status donut chart"
            >
              {/* Background track */}
              <circle
                cx={cx}
                cy={cy}
                r={radius}
                fill="transparent"
                stroke="var(--bg-tertiary)"
                strokeWidth="12"
              />

              {/* Segments — correct cumulative rotation */}
              {statusData.map((item, idx) => {
                const fraction = item.count / totalTasks;
                if (fraction === 0) return null;

                const dashArray = circumference;
                const dashOffset = circumference * (1 - fraction);
                const rotationDeg = cumulativeAngle;
                cumulativeAngle += fraction * 360;

                return (
                  <circle
                    key={idx}
                    cx={cx}
                    cy={cy}
                    r={radius}
                    fill="transparent"
                    stroke={item.color}
                    strokeWidth="12"
                    strokeDasharray={`${dashArray} ${dashArray}`}
                    strokeDashoffset={dashOffset}
                    strokeLinecap="butt"
                    style={{
                      transform: `rotate(${rotationDeg}deg)`,
                      transformOrigin: `${cx}px ${cy}px`,
                      transition: "stroke-dashoffset 0.6s ease-out",
                    }}
                  />
                );
              })}
            </svg>

            {/* Center count */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-xl font-black text-text-primary leading-none">
                {activeTasks.length}
              </span>
              <span className="text-[9px] font-bold text-text-muted mt-0.5 uppercase tracking-wider">
                {isRtl ? "مهام" : "Tasks"}
              </span>
            </div>
          </div>

          {/* Legend — clickable */}
          <div className="flex flex-col gap-2.5 shrink-0">
            {statusData.map((item, idx) => {
              const pct =
                totalTasks > 0 ? Math.round((item.count / totalTasks) * 100) : 0;
              return (
                <button
                  key={idx}
                  onClick={() => router.push(`/tasks?status=${item.status}`)}
                  className="flex items-center gap-2 group hover:opacity-80 transition-opacity text-left focus:outline-none"
                  aria-label={`View ${item.label} tasks`}
                >
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0 ring-2 ring-transparent group-hover:ring-offset-1 transition-all"
                    style={{
                      backgroundColor: item.color,
                      // NOTE: ringColor can't be dynamic with Tailwind vars, inline style used
                    }}
                  />
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-text-primary leading-tight">
                      {item.label}
                    </span>
                    <span className="text-[9px] text-text-muted font-semibold">
                      {item.count} ({pct}%)
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Chart 2: Department Productivity ────────────────────────────── */}
      <div className="rounded-2xl border border-border-clean bg-bg-primary p-5 shadow-sm flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-xs font-black text-text-secondary uppercase tracking-wider">
            {isRtl ? "إنتاجية الأقسام" : "Department Productivity"}
          </h4>
          <button
            onClick={() => router.push("/departments")}
            className="text-[10px] font-bold text-brand-primary hover:underline flex items-center gap-0.5 uppercase"
          >
            {isRtl ? "عرض" : "View"}
            <ArrowUpRight className="h-3 w-3" />
          </button>
        </div>

        <div className="space-y-4 flex-1 flex flex-col justify-center">
          {deptData.length === 0 ? (
            <p className="text-xs text-text-muted text-center py-4">
              {isRtl ? "لا توجد بيانات أقسام" : "No department data available"}
            </p>
          ) : (
            deptData.map((dept, idx) => (
              <div key={idx} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-text-primary truncate max-w-[160px]">
                    {dept.name}
                  </span>
                  <span className="font-black text-brand-primary ml-2 shrink-0">
                    {dept.rate}%
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-bg-tertiary overflow-hidden border border-border-clean/40">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-brand-primary to-brand-secondary transition-all duration-700 ease-out"
                    style={{ width: `${dept.rate}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-[9px] text-text-muted font-bold">
                  <span>{isRtl ? "معدل الإنجاز" : "Completion Rate"}</span>
                  <span>
                    {dept.tasksCount} {isRtl ? "مهمة" : "Tasks"}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* ── Chart 3: Weekly Performance Bar Chart ────────────────────────── */}
      <div className="rounded-2xl border border-border-clean bg-bg-primary p-5 shadow-sm flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-xs font-black text-text-secondary uppercase tracking-wider">
            {isRtl ? "معدل الأداء الأسبوعي" : "Weekly Performance"}
          </h4>
          <button
            onClick={() => router.push("/reports")}
            className="text-[10px] font-bold text-brand-primary hover:underline flex items-center gap-0.5 uppercase"
          >
            {isRtl ? "التقارير" : "Reports"}
            <ArrowUpRight className="h-3 w-3" />
          </button>
        </div>

        <div className="flex items-end justify-between gap-1 h-36 flex-1">
          {days.map((day, idx) => (
            <div
              key={idx}
              className="flex flex-col items-center flex-1 group cursor-default"
            >
              <div className="relative w-full flex justify-center items-end h-24">
                {/* Tooltip on hover */}
                <span className="absolute -top-7 scale-90 opacity-0 group-hover:scale-100 group-hover:opacity-100 transition-all duration-150 bg-text-primary text-bg-primary text-[9px] font-bold px-1.5 py-0.5 rounded shadow-sm z-10 whitespace-nowrap pointer-events-none">
                  {day.rate}%
                </span>

                {/* Track */}
                <div className="w-5 h-24 bg-bg-tertiary rounded-full overflow-hidden border border-border-clean/40 flex items-end shadow-inner">
                  <div
                    className="w-full bg-gradient-to-t from-brand-primary via-brand-secondary to-indigo-400 transition-all duration-700 ease-out rounded-t-full"
                    style={{ height: `${day.rate}%` }}
                  />
                </div>
              </div>
              <span className="text-[9px] text-text-muted font-bold mt-2 uppercase tracking-tight">
                {day.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
