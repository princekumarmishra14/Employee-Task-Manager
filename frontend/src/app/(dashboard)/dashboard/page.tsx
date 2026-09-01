"use client";

import React, { useState, useCallback } from "react";
import { useTranslation } from "@/hooks/useTranslation";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import {
  ListTodo,
  CheckCircle2,
  Clock,
  Activity,
  ArrowUpRight,
  X,
  Plus,
  RefreshCw,
  Trash2,
  Key,
  Calendar,
  AlertCircle,
  Users,
  Building2,
  FolderOpen,
  TrendingUp,
  Zap,
  BarChart3,
} from "lucide-react";
import Link from "next/link";
import ProtectedRoute from "@/components/rbac/ProtectedRoute";
import TaskSummaryCard from "@/components/cards/TaskSummaryCard";
import { useDashboard } from "@/hooks/useDashboard";

// ─── Relative time formatter ──────────────────────────────────────────────────
function relativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

// ─── Skeleton Components ──────────────────────────────────────────────────────
function KPISkeleton() {
  return (
    <div className="rounded-2xl border border-border-clean bg-bg-primary p-6 shadow-sm animate-pulse">
      <div className="flex items-center justify-between mb-4">
        <div className="h-3 w-24 rounded-full bg-bg-tertiary" />
        <div className="h-9 w-9 rounded-xl bg-bg-tertiary" />
      </div>
      <div className="h-8 w-16 rounded-full bg-bg-tertiary mb-3" />
      <div className="flex items-center gap-2">
        <div className="h-3 w-8 rounded-full bg-bg-tertiary" />
        <div className="h-3 w-28 rounded-full bg-bg-tertiary" />
      </div>
    </div>
  );
}

function TableSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-border-clean bg-bg-primary shadow-sm animate-pulse">
      <div className="h-10 bg-bg-secondary border-b border-border-clean" />
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="flex gap-4 px-5 py-4 border-b border-border-clean last:border-0">
          <div className="h-3 flex-1 rounded-full bg-bg-tertiary" />
          <div className="h-3 w-16 rounded-full bg-bg-tertiary" />
          <div className="h-3 w-20 rounded-full bg-bg-tertiary" />
          <div className="h-3 w-24 rounded-full bg-bg-tertiary" />
          <div className="h-3 w-16 rounded-full bg-bg-tertiary" />
        </div>
      ))}
    </div>
  );
}

function ActivitySkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="flex gap-3">
          <div className="h-5 w-5 rounded-full bg-bg-tertiary shrink-0 mt-1" />
          <div className="flex-1 space-y-1.5">
            <div className="h-3 w-3/4 rounded-full bg-bg-tertiary" />
            <div className="h-2.5 w-1/2 rounded-full bg-bg-tertiary" />
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Activity Icon Helpers ────────────────────────────────────────────────────
function getActivityIcon(type: string) {
  if (type.includes("CREATED") || type.includes("JOINED")) return <Plus className="h-3 w-3 text-status-info" />;
  if (type.includes("DELETED") || type.includes("DEACTIVATED")) return <Trash2 className="h-3 w-3 text-status-danger" />;
  if (type.includes("COMPLETED")) return <CheckCircle2 className="h-3 w-3 text-status-success" />;
  if (type.includes("ASSIGNED")) return <Users className="h-3 w-3 text-brand-primary" />;
  if (type.includes("STATUS")) return <RefreshCw className="h-3 w-3 text-status-warning" />;
  return <Activity className="h-3 w-3 text-text-secondary" />;
}

function getActivityIconBg(type: string): string {
  if (type.includes("CREATED") || type.includes("JOINED")) return "bg-status-info-bg border-status-info/20";
  if (type.includes("DELETED") || type.includes("DEACTIVATED")) return "bg-status-danger-bg border-status-danger/20";
  if (type.includes("COMPLETED")) return "bg-status-success-bg border-status-success/20";
  if (type.includes("ASSIGNED")) return "bg-brand-muted border-brand-primary/20";
  if (type.includes("STATUS")) return "bg-status-warning-bg border-status-warning/20";
  return "bg-bg-secondary border-border-clean";
}

// ─── Priority Badge ───────────────────────────────────────────────────────────
const PRIORITY_STYLES: Record<string, string> = {
  LOW: "bg-bg-secondary text-text-muted border-border-clean",
  MEDIUM: "bg-status-info-bg text-status-info border-status-info/20",
  HIGH: "bg-status-warning-bg text-status-warning border-status-warning/20",
  ESCALATED: "bg-status-danger-bg text-status-danger border-status-danger/20",
};

// ─── Status Badge ─────────────────────────────────────────────────────────────
function StatusChip({ status }: { status: string }) {
  const map: Record<string, string> = {
    UNASSIGNED: "bg-bg-secondary text-text-muted border-border-clean",
    ASSIGNED: "bg-status-info-bg text-status-info border-status-info/20",
    IN_PROGRESS: "bg-brand-muted text-brand-primary border-brand-primary/20",
    COMPLETED: "bg-status-success-bg text-status-success border-status-success/20",
    OVERDUE: "bg-status-danger-bg text-status-danger border-status-danger/20",
    ARCHIVED: "bg-bg-tertiary text-text-muted border-border-clean",
  };
  const label = status.replace("_", " ");
  const cls = map[status] ?? map.UNASSIGNED;
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[9px] font-black border uppercase tracking-wide ${cls}`}>
      {label}
    </span>
  );
}

// ─── Animated Counter ─────────────────────────────────────────────────────────
function AnimatedNumber({ value }: { value: number }) {
  return <span className="tabular-nums">{value.toLocaleString()}</span>;
}

// ─── Donut Chart ──────────────────────────────────────────────────────────────
function DonutChart({ segments, total }: { segments: { label: string; value: number; color: string }[]; total: number }) {
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  let cumulativeAngle = -90;

  return (
    <svg className="w-full h-full" viewBox="0 0 110 110">
      <circle cx={55} cy={55} r={radius} fill="transparent" stroke="var(--bg-tertiary)" strokeWidth="12" />
      {segments.map((seg, idx) => {
        const fraction = total > 0 ? seg.value / total : 0;
        if (fraction === 0) return null;
        const dashOffset = circumference * (1 - fraction);
        const rotation = cumulativeAngle;
        cumulativeAngle += fraction * 360;
        return (
          <circle
            key={idx}
            cx={55} cy={55} r={radius}
            fill="transparent"
            stroke={seg.color}
            strokeWidth="12"
            strokeDasharray={`${circumference} ${circumference}`}
            strokeDashoffset={dashOffset}
            strokeLinecap="butt"
            style={{
              transform: `rotate(${rotation}deg)`,
              transformOrigin: "55px 55px",
              transition: "stroke-dashoffset 0.8s ease-out",
            }}
          />
        );
      })}
    </svg>
  );
}

// ─── Main Dashboard Page ──────────────────────────────────────────────────────
export default function DashboardPage() {
  const { t, isRtl } = useTranslation();
  const router = useRouter();
  const { user: authUser, role: authRole } = useAuth();
  const { stats, isLoading, error, refresh, lastUpdated } = useDashboard();
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  const todayFormatted = new Date().toLocaleDateString(isRtl ? "ar-SA" : "en-US", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });

  const displayName = authUser?.name ?? authUser?.email ?? "User";
  const firstName = displayName.split(" ")[0] ?? displayName;
  const roleLabel = authRole ?? "EMPLOYEE";

  const ROLE_COLORS: Record<string, string> = {
    SUPER_ADMIN: "text-indigo-600 bg-indigo-50 border-indigo-200 dark:text-indigo-400 dark:bg-indigo-950/30 dark:border-indigo-800",
    ADMIN: "text-emerald-600 bg-emerald-50 border-emerald-200 dark:text-emerald-400 dark:bg-emerald-950/30 dark:border-emerald-800",
    MANAGER: "text-cyan-600 bg-cyan-50 border-cyan-200 dark:text-cyan-400 dark:bg-cyan-950/30 dark:border-cyan-800",
    EMPLOYEE: "text-amber-600 bg-amber-50 border-amber-200 dark:text-amber-400 dark:bg-amber-950/30 dark:border-amber-800",
    VIEWER: "text-purple-600 bg-purple-50 border-purple-200 dark:text-purple-400 dark:bg-purple-950/30 dark:border-purple-800",
  };
  const roleBadgeColor = ROLE_COLORS[roleLabel] ?? ROLE_COLORS.EMPLOYEE;

  const selectedTask = stats?.recentTasks?.find((t) => t.id === selectedTaskId);

  // Chart data
  const donutSegments = stats
    ? [
      { label: "Completed", value: stats.tasks.completed, color: "var(--status-success)" },
      { label: "In Progress", value: stats.tasks.inProgress, color: "var(--brand-primary)" },
      { label: "Assigned", value: stats.tasks.assigned, color: "var(--status-info)" },
      { label: "Unassigned", value: stats.tasks.unassigned, color: "var(--text-muted)" },
      { label: "Overdue", value: stats.tasks.overdue, color: "var(--status-danger)" },
      { label: "Archived", value: stats.tasks.archived, color: "var(--status-warning)" },
    ]
    : [];

  const handleRefresh = useCallback(() => refresh(), [refresh]);

  return (
    <ProtectedRoute permission="dashboard:view">
      <div className="space-y-6 font-poppins transition-colors duration-300">

        {/* ── Header ─────────────────────────────────────────────────────── */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-black tracking-tight text-text-primary uppercase font-poppins">
                {isRtl ? `مرحباً، ${firstName}` : `Welcome back, ${firstName}`}
              </h1>
              {roleLabel && (
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${roleBadgeColor}`}>
                  {roleLabel.replace("_", " ")}
                </span>
              )}
            </div>
            <p className="text-xs text-text-secondary font-medium">
              {isRtl ? "مرحباً بك في لوحة تحليلات العمل لمؤسستك." : "Your enterprise operations hub — live data from PostgreSQL."}
            </p>
            {authUser?.email && (
              <p className="text-[10px] text-text-muted font-semibold">{authUser.email}</p>
            )}
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1.5 text-[10px] text-text-muted bg-bg-primary border border-border-clean py-1.5 px-3 rounded-xl shadow-sm font-bold uppercase tracking-wider">
              <Calendar className="h-3 w-3 text-brand-primary" />
              {todayFormatted}
            </span>
            <button
              onClick={handleRefresh}
              className="inline-flex items-center gap-1.5 text-[10px] text-text-muted bg-bg-primary border border-border-clean py-1.5 px-3 rounded-xl shadow-sm font-bold uppercase tracking-wider hover:border-brand-primary/40 hover:text-brand-primary transition-all cursor-pointer focus:outline-none"
              title="Refresh dashboard"
            >
              <RefreshCw className={`h-3 w-3 ${isLoading ? "animate-spin text-brand-primary" : "text-text-muted"}`} />
              {lastUpdated ? `Updated ${relativeTime(lastUpdated.toISOString())}` : "Refresh"}
            </button>
            <span className="inline-flex items-center gap-1.5 text-[10px] text-text-muted bg-bg-primary border border-border-clean py-1.5 px-3 rounded-xl shadow-sm font-bold uppercase tracking-wider">
              <span className="h-1.5 w-1.5 rounded-full bg-status-success animate-pulse" />
              {isRtl ? "تحديث تلقائي" : "Auto-refresh 30s"}
            </span>
          </div>
        </div>

        {/* ── Error Banner ──────────────────────────────────────────────── */}
        {error && !isLoading && (
          <div className="rounded-xl border border-status-danger/20 bg-status-danger-bg px-4 py-3 text-xs text-status-danger font-semibold flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {error}
            <button onClick={handleRefresh} className="ml-auto underline font-bold cursor-pointer">Retry</button>
          </div>
        )}

        {/* ── KPI Cards — Row 1: Tasks ──────────────────────────────────── */}
        <div>
          <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-3">
            {isRtl ? "إجماليات المهام" : "Task Overview"}
          </p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {isLoading ? (
              <><KPISkeleton /><KPISkeleton /><KPISkeleton /><KPISkeleton /></>
            ) : (
              <>
                <TaskSummaryCard
                  title={isRtl ? "إجمالي المهام" : "Total Tasks"}
                  value={stats?.tasks.total ?? 0}
                  icon={<ListTodo className="h-5 w-5 text-brand-primary" />}
                  trend={{ value: stats?.tasks.completedThisWeek ?? 0, isPositive: (stats?.tasks.completedThisWeek ?? 0) > 0 }}
                  description={isRtl ? "المسجلة في النظام" : `${stats?.tasks.completedThisMonth ?? 0} completed this month`}
                  cardType="total"
                  onClick={() => router.push("/tasks")}
                />
                <TaskSummaryCard
                  title={isRtl ? "قيد الانتظار" : "Pending / Unassigned"}
                  value={stats?.tasks.unassigned ?? 0}
                  icon={<Clock className="h-5 w-5 text-status-warning" />}
                  description={isRtl ? "بانتظار التعيين" : `${stats?.tasks.assigned ?? 0} assigned, awaiting action`}
                  cardType="pending"
                  isPositive={(stats?.tasks.unassigned ?? 0) === 0}
                  onClick={() => router.push("/tasks?status=PENDING")}
                />
                <TaskSummaryCard
                  title={isRtl ? "قيد التنفيذ" : "In Progress"}
                  value={stats?.tasks.inProgress ?? 0}
                  icon={<Activity className="h-5 w-5 text-status-info" />}
                  description={isRtl ? "يتم العمل عليها" : "Active development sprints"}
                  cardType="progress"
                  isPositive={(stats?.tasks.inProgress ?? 0) > 0}
                  onClick={() => router.push("/tasks?status=IN_PROGRESS")}
                />
                <TaskSummaryCard
                  title={isRtl ? "المهام المكتملة" : "Completed Tasks"}
                  value={stats?.tasks.completed ?? 0}
                  icon={<CheckCircle2 className="h-5 w-5 text-status-success" />}
                  trend={{ value: stats?.analytics.overallCompletionRate ?? 0, isPositive: (stats?.analytics.overallCompletionRate ?? 0) >= 50 }}
                  description={isRtl ? "مكتملة بنجاح" : `${stats?.analytics.overallCompletionRate ?? 0}% completion rate`}
                  cardType="completed"
                  onClick={() => router.push("/tasks?status=COMPLETED")}
                />
              </>
            )}
          </div>
        </div>

        {/* ── KPI Cards — Row 2: Enterprise Metrics ────────────────────── */}
        <div>
          <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-3">
            {isRtl ? "مقاييس المؤسسة" : "Enterprise Metrics"}
          </p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {isLoading ? (
              <><KPISkeleton /><KPISkeleton /><KPISkeleton /><KPISkeleton /></>
            ) : (
              <>
                {/* Overdue */}
                <div
                  onClick={() => router.push("/tasks?status=OVERDUE")}
                  className="group relative overflow-hidden rounded-2xl border border-border-clean hover:border-status-danger/40 bg-bg-primary p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 cursor-pointer focus:outline-none"
                >
                  <div className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-status-danger/5 blur-2xl" />
                  <div className="flex items-center justify-between relative z-10">
                    <span className="text-xs font-bold text-text-secondary uppercase tracking-wider">{isRtl ? "متأخرة" : "Overdue Tasks"}</span>
                    <div className="rounded-xl p-2.5 bg-status-danger-bg text-status-danger">
                      <AlertCircle className="h-5 w-5" />
                    </div>
                  </div>
                  <div className="mt-4 relative z-10">
                    <h3 className="text-3xl font-black tracking-tight text-status-danger">
                      <AnimatedNumber value={stats?.tasks.overdue ?? 0} />
                    </h3>
                    <p className="mt-2 text-xs text-text-muted font-semibold">
                      {isRtl ? "تجاوزت الموعد النهائي" : "Past their due dates"}
                    </p>
                  </div>
                </div>

                {/* Employees */}
                <div
                  onClick={() => router.push("/employees")}
                  className="group relative overflow-hidden rounded-2xl border border-border-clean hover:border-brand-primary/40 bg-bg-primary p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 cursor-pointer focus:outline-none"
                >
                  <div className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-brand-primary/5 blur-2xl" />
                  <div className="flex items-center justify-between relative z-10">
                    <span className="text-xs font-bold text-text-secondary uppercase tracking-wider">{isRtl ? "الموظفون" : "Employees"}</span>
                    <div className="rounded-xl p-2.5 bg-brand-muted text-brand-primary">
                      <Users className="h-5 w-5" />
                    </div>
                  </div>
                  <div className="mt-4 relative z-10">
                    <h3 className="text-3xl font-black tracking-tight text-text-primary">
                      <AnimatedNumber value={stats?.employees.total ?? 0} />
                    </h3>
                    <p className="mt-2 text-xs text-text-muted font-semibold">
                      {stats?.employees.active ?? 0} {isRtl ? "نشط" : "active"} · {stats?.employees.inactive ?? 0} {isRtl ? "غير نشط" : "inactive"}
                    </p>
                  </div>
                </div>

                {/* Departments */}
                <div
                  onClick={() => router.push("/departments")}
                  className="group relative overflow-hidden rounded-2xl border border-border-clean hover:border-brand-primary/40 bg-bg-primary p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 cursor-pointer focus:outline-none"
                >
                  <div className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-brand-primary/5 blur-2xl" />
                  <div className="flex items-center justify-between relative z-10">
                    <span className="text-xs font-bold text-text-secondary uppercase tracking-wider">{isRtl ? "الأقسام" : "Departments"}</span>
                    <div className="rounded-xl p-2.5 bg-brand-muted text-brand-primary">
                      <Building2 className="h-5 w-5" />
                    </div>
                  </div>
                  <div className="mt-4 relative z-10">
                    <h3 className="text-3xl font-black tracking-tight text-text-primary">
                      <AnimatedNumber value={stats?.departments.total ?? 0} />
                    </h3>
                    <p className="mt-2 text-xs text-text-muted font-semibold">
                      {stats?.teams.total ?? 0} {isRtl ? "فريق" : "teams"} · {stats?.projects.total ?? 0} {isRtl ? "مشروع" : "projects"}
                    </p>
                  </div>
                </div>

                {/* Completion Rate */}
                <div className="group relative overflow-hidden rounded-2xl border border-border-clean hover:border-status-success/40 bg-bg-primary p-6 shadow-sm transition-all duration-300 hover:-translate-y-1">
                  <div className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-status-success/5 blur-2xl" />
                  <div className="flex items-center justify-between relative z-10">
                    <span className="text-xs font-bold text-text-secondary uppercase tracking-wider">{isRtl ? "معدل الإنجاز" : "Completion Rate"}</span>
                    <div className="rounded-xl p-2.5 bg-status-success-bg text-status-success">
                      <TrendingUp className="h-5 w-5" />
                    </div>
                  </div>
                  <div className="mt-4 relative z-10">
                    <h3 className="text-3xl font-black tracking-tight text-status-success">
                      {stats?.analytics.overallCompletionRate ?? 0}%
                    </h3>
                    <div className="mt-2 w-full bg-bg-tertiary rounded-full h-1.5 overflow-hidden">
                      <div
                        className="h-full bg-status-success rounded-full transition-all duration-1000"
                        style={{ width: `${stats?.analytics.overallCompletionRate ?? 0}%` }}
                      />
                    </div>
                    <p className="mt-1.5 text-xs text-text-muted font-semibold">
                      {stats?.tasks.completedToday ?? 0} {isRtl ? "مكتملة اليوم" : "completed today"}
                    </p>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* ── Charts Row ─────────────────────────────────────────────────── */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">

          {/* Task Status Donut */}
          <div className="rounded-2xl border border-border-clean bg-bg-primary p-5 shadow-sm flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-xs font-black text-text-secondary uppercase tracking-wider flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-brand-primary" />
                {isRtl ? "توزيع حالات المهام" : "Task Status Distribution"}
              </h4>
              <button onClick={() => router.push("/tasks")} className="text-[10px] font-bold text-brand-primary hover:underline flex items-center gap-0.5 uppercase">
                {isRtl ? "عرض" : "View"} <ArrowUpRight className="h-3 w-3" />
              </button>
            </div>
            {isLoading ? (
              <div className="flex items-center justify-center h-36 animate-pulse">
                <div className="h-28 w-28 rounded-full bg-bg-tertiary" />
              </div>
            ) : stats?.tasks.total === 0 ? (
              <p className="text-xs text-text-muted text-center py-8">{isRtl ? "لا توجد مهام بعد" : "No tasks yet"}</p>
            ) : (
              <div className="flex flex-row items-center justify-around gap-4 flex-1">
                <div className="relative w-28 h-28 shrink-0">
                  <DonutChart segments={donutSegments} total={stats?.tasks.total ?? 1} />
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-xl font-black text-text-primary leading-none">{stats?.tasks.total ?? 0}</span>
                    <span className="text-[9px] font-bold text-text-muted mt-0.5 uppercase tracking-wider">{isRtl ? "مهام" : "Tasks"}</span>
                  </div>
                </div>
                <div className="flex flex-col gap-2 shrink-0">
                  {donutSegments.filter((s) => s.value > 0).map((seg, idx) => {
                    const pct = stats ? Math.round((seg.value / stats.tasks.total) * 100) : 0;
                    return (
                      <div key={idx} className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: seg.color }} />
                        <div className="flex flex-col">
                          <span className="text-[10px] font-bold text-text-primary leading-tight">{seg.label}</span>
                          <span className="text-[9px] text-text-muted font-semibold">{seg.value} ({pct}%)</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Department Productivity */}
          <div className="rounded-2xl border border-border-clean bg-bg-primary p-5 shadow-sm flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-xs font-black text-text-secondary uppercase tracking-wider flex items-center gap-2">
                <Building2 className="h-4 w-4 text-brand-primary" />
                {isRtl ? "إنتاجية الأقسام" : "Department Productivity"}
              </h4>
              <button onClick={() => router.push("/departments")} className="text-[10px] font-bold text-brand-primary hover:underline flex items-center gap-0.5 uppercase">
                {isRtl ? "عرض" : "View"} <ArrowUpRight className="h-3 w-3" />
              </button>
            </div>
            {isLoading ? (
              <div className="space-y-4 animate-pulse">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="space-y-1.5">
                    <div className="flex justify-between">
                      <div className="h-3 w-28 rounded-full bg-bg-tertiary" />
                      <div className="h-3 w-8 rounded-full bg-bg-tertiary" />
                    </div>
                    <div className="h-2 w-full rounded-full bg-bg-tertiary" />
                  </div>
                ))}
              </div>
            ) : !stats?.departments.breakdown.length ? (
              <p className="text-xs text-text-muted text-center py-8">{isRtl ? "لا توجد بيانات" : "No department data"}</p>
            ) : (
              <div className="space-y-4 flex-1 flex flex-col justify-center">
                {stats.departments.breakdown.map((dept) => (
                  <div key={dept.id} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-text-primary truncate max-w-[160px]">{dept.name}</span>
                      <span className="font-black text-brand-primary ml-2 shrink-0">{dept.completionRate}%</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-bg-tertiary overflow-hidden border border-border-clean/40">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-brand-primary to-brand-secondary transition-all duration-700 ease-out"
                        style={{ width: `${dept.completionRate}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-[9px] text-text-muted font-bold">
                      <span>{dept.employeeCount} {isRtl ? "موظف" : "employees"}</span>
                      <span>{dept.completedTaskCount}/{dept.taskCount} {isRtl ? "مهمة" : "tasks"}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Priority Distribution */}
          <div className="rounded-2xl border border-border-clean bg-bg-primary p-5 shadow-sm flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-xs font-black text-text-secondary uppercase tracking-wider flex items-center gap-2">
                <Zap className="h-4 w-4 text-brand-primary" />
                {isRtl ? "توزيع الأولويات" : "Priority Distribution"}
              </h4>
              <button onClick={() => router.push("/tasks")} className="text-[10px] font-bold text-brand-primary hover:underline flex items-center gap-0.5 uppercase">
                {isRtl ? "عرض" : "View"} <ArrowUpRight className="h-3 w-3" />
              </button>
            </div>
            {isLoading ? (
              <div className="space-y-4 animate-pulse">
                {[1, 2, 3, 4].map((i) => <div key={i} className="h-10 rounded-xl bg-bg-tertiary" />)}
              </div>
            ) : (
              <div className="space-y-3 flex-1 flex flex-col justify-center">
                {[
                  { label: "Escalated", labelAr: "مُصعَّد", value: stats?.priorities.escalated ?? 0, color: "bg-status-danger", textColor: "text-status-danger", bg: "bg-status-danger-bg" },
                  { label: "High", labelAr: "عالية", value: stats?.priorities.high ?? 0, color: "bg-status-warning", textColor: "text-status-warning", bg: "bg-status-warning-bg" },
                  { label: "Medium", labelAr: "متوسطة", value: stats?.priorities.medium ?? 0, color: "bg-status-info", textColor: "text-status-info", bg: "bg-status-info-bg" },
                  { label: "Low", labelAr: "منخفضة", value: stats?.priorities.low ?? 0, color: "bg-text-muted", textColor: "text-text-muted", bg: "bg-bg-secondary" },
                ].map((p) => {
                  const total = stats ? (stats.priorities.escalated + stats.priorities.high + stats.priorities.medium + stats.priorities.low) : 1;
                  const pct = total > 0 ? Math.round((p.value / total) * 100) : 0;
                  return (
                    <div key={p.label} className={`flex items-center gap-3 p-2.5 rounded-xl ${p.bg} border border-border-clean/40`}>
                      <div className={`w-2 h-8 rounded-full ${p.color} shrink-0`} style={{ height: `${Math.max(8, pct * 0.5)}px` }} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className={`text-[10px] font-black uppercase tracking-wide ${p.textColor}`}>{isRtl ? p.labelAr : p.label}</span>
                          <span className={`text-[10px] font-black ${p.textColor}`}>{p.value}</span>
                        </div>
                        <div className="mt-1 h-1 w-full rounded-full bg-bg-tertiary overflow-hidden">
                          <div className={`h-full rounded-full ${p.color} transition-all duration-700`} style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                      <span className="text-[9px] font-bold text-text-muted shrink-0">{pct}%</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* ── Recent Tasks + Activity Feed ──────────────────────────────── */}
        <div className="grid gap-6 lg:grid-cols-3">

          {/* Recent Tasks Table */}
          <div className="lg:col-span-2 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-text-primary uppercase tracking-wider">
                {isRtl ? "المهام النشطة الأخيرة" : "Recent Active Tasks"}
              </h3>
              <Link href="/tasks" className="text-xs font-bold text-brand-primary hover:text-brand-secondary flex items-center gap-1 transition-colors">
                <span>{isRtl ? "عرض كل المهام" : "View all tasks"}</span>
                <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            {isLoading ? (
              <TableSkeleton />
            ) : (
              <div className="overflow-hidden rounded-2xl border border-border-clean bg-bg-primary shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[640px] dir-ltr">
                    <thead>
                      <tr className="border-b border-border-clean bg-bg-secondary text-[10px] font-black text-text-muted uppercase tracking-widest">
                        <th className="py-3.5 px-5">Task</th>
                        <th className="py-3.5 px-5">Priority</th>
                        <th className="py-3.5 px-5">Status</th>
                        <th className="py-3.5 px-5">Assignee</th>
                        <th className="py-3.5 px-5">Due Date</th>
                        <th className="py-3.5 px-5 text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border-clean text-sm font-poppins">
                      {!stats?.recentTasks.length ? (
                        <tr>
                          <td colSpan={6} className="py-12 text-center text-xs text-text-muted font-semibold">
                            {isRtl ? "لا توجد مهام بعد" : "No tasks yet — create your first task to get started"}
                          </td>
                        </tr>
                      ) : (
                        stats.recentTasks.map((task) => {
                          const isOverdue = new Date(task.dueDate) < new Date() && task.status !== "COMPLETED";
                          const priorityStyle = PRIORITY_STYLES[task.priority] ?? PRIORITY_STYLES.MEDIUM;
                          return (
                            <tr key={task.id} className="hover:bg-bg-secondary transition-colors group">
                              <td className="py-3.5 px-5 max-w-[220px]">
                                <span className="font-bold text-text-primary truncate block group-hover:text-brand-primary transition-colors text-xs">
                                  {task.title}
                                </span>
                                {task.departmentName && (
                                  <span className="text-[9px] text-text-muted font-semibold">{task.departmentName}</span>
                                )}
                              </td>
                              <td className="py-3.5 px-5">
                                <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[9px] font-black border uppercase tracking-wide ${priorityStyle}`}>
                                  {task.priority}
                                </span>
                              </td>
                              <td className="py-3.5 px-5">
                                <StatusChip status={task.status} />
                              </td>
                              <td className="py-3.5 px-5">
                                {task.assigneeName ? (
                                  <div className="flex items-center gap-2">
                                    {task.assigneeAvatar ? (
                                      <img src={task.assigneeAvatar} alt={task.assigneeName} className="h-6 w-6 rounded-full object-cover border border-border-clean" />
                                    ) : (
                                      <div className="h-6 w-6 rounded-full bg-brand-primary/20 border border-brand-primary/30 flex items-center justify-center text-[9px] font-black text-brand-primary shrink-0">
                                        {task.assigneeName.charAt(0)}
                                      </div>
                                    )}
                                    <span className="text-xs font-semibold text-text-primary truncate max-w-[100px]">{task.assigneeName}</span>
                                  </div>
                                ) : (
                                  <span className="text-xs text-text-muted italic">Unassigned</span>
                                )}
                              </td>
                              <td className="py-3.5 px-5">
                                <span className={`text-xs font-semibold ${isOverdue ? "text-status-danger font-bold" : "text-text-secondary"}`}>
                                  {isOverdue && <span className="mr-1">⚠</span>}
                                  {new Date(task.dueDate).toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" })}
                                </span>
                              </td>
                              <td className="py-3.5 px-5 text-center">
                                <button
                                  onClick={() => setSelectedTaskId(task.id)}
                                  className="rounded-lg p-1.5 text-text-muted hover:bg-brand-muted hover:text-brand-primary transition-all focus:outline-none cursor-pointer"
                                  title="Quick view"
                                >
                                  <FolderOpen className="h-4 w-4" />
                                </button>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* Activity Feed */}
          <div className="rounded-2xl border border-border-clean bg-bg-primary p-5 shadow-sm flex flex-col">
            <div className="flex items-center justify-between border-b border-border-clean pb-3 mb-4">
              <h3 className="text-xs font-black text-text-primary uppercase tracking-wider flex items-center gap-2">
                <Activity className="h-4 w-4 text-brand-primary" />
                <span>{t.dashActivityFeed}</span>
              </h3>
              <Link href="/audit-logs" className="text-[10px] font-bold text-brand-primary hover:underline flex items-center gap-0.5 uppercase">
                <span>{isRtl ? "التدقيق" : "View Logs"}</span>
                <ArrowUpRight className="h-3 w-3" />
              </Link>
            </div>

            <div className="flex-1 overflow-y-auto max-h-[400px] pr-1">
              {isLoading ? (
                <ActivitySkeleton />
              ) : !stats?.recentActivities.length ? (
                <p className="text-xs text-text-muted text-center py-6">{t.dashNoLogs}</p>
              ) : (
                <div className="space-y-3">
                  {stats.recentActivities.map((act) => (
                    <div key={act.id} className="relative flex gap-3 pl-6 pb-3 border-l border-border-clean last:pb-0 last:border-0 ml-2">
                      <div className={`absolute -left-2.5 top-1 flex h-5 w-5 items-center justify-center rounded-full border shadow-sm ${getActivityIconBg(act.type)}`}>
                        {getActivityIcon(act.type)}
                      </div>
                      <div className="text-xs flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-1">
                          <div className="min-w-0">
                            <span className="font-bold text-text-primary">{act.actorName}</span>
                            {" "}
                            <span className="text-text-secondary font-medium">{act.title.replace(act.actorName, "").trim()}</span>
                          </div>
                        </div>
                        {act.entityName && (
                          <p className="text-[10px] text-brand-primary font-bold mt-0.5 truncate">"{act.entityName}"</p>
                        )}
                        <span className="text-[9px] text-text-muted mt-1 block font-semibold uppercase">
                          {relativeTime(act.createdAt)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Task Quick-View Modal ─────────────────────────────────────── */}
        {selectedTask && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <div className="w-full max-w-lg rounded-2xl bg-bg-primary p-6 shadow-2xl border border-border-clean relative">
              <div className="flex items-center justify-between border-b border-border-clean pb-3 mb-4">
                <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest font-mono">{selectedTask.id}</span>
                <button
                  onClick={() => setSelectedTaskId(null)}
                  className="rounded-lg p-1 text-text-secondary hover:bg-bg-tertiary transition-all focus:outline-none"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <h2 className="text-lg font-bold text-text-primary mb-3">{selectedTask.title}</h2>
              <div className="grid grid-cols-2 gap-3 text-xs border-t border-border-clean pt-4 font-semibold text-text-secondary">
                <div className="flex items-center gap-1.5">
                  <AlertCircle className="h-4 w-4 text-brand-primary" />
                  <span><strong>Priority:</strong> {selectedTask.priority}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Calendar className="h-4 w-4 text-brand-primary" />
                  <span><strong>Status:</strong> {selectedTask.status}</span>
                </div>
                {selectedTask.assigneeName && (
                  <div className="flex items-center gap-1.5">
                    <Users className="h-4 w-4 text-brand-primary" />
                    <span><strong>Assignee:</strong> {selectedTask.assigneeName}</span>
                  </div>
                )}
                {selectedTask.departmentName && (
                  <div className="flex items-center gap-1.5">
                    <Building2 className="h-4 w-4 text-brand-primary" />
                    <span><strong>Dept:</strong> {selectedTask.departmentName}</span>
                  </div>
                )}
              </div>
              <div className="mt-4 flex justify-end">
                <Link
                  href={`/tasks/${selectedTask.id}`}
                  className="text-xs font-bold text-brand-primary hover:text-brand-secondary flex items-center gap-1"
                  onClick={() => setSelectedTaskId(null)}
                >
                  View Full Details <ArrowUpRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
