/**
 * =============================================================================
 * EMPLOYEE PROFILE DETAIL PAGE COMPONENT
 * Project: Employee Task Manager (Enterprise Edition)
 * Role: Next.js App Router Page ((dashboard)/employees/[id])
 * 
 * Description:
 * Renders the comprehensive profile dashboard for a selected employee.
 * Features progress telemetry stats (completion rate ring), active/completed tasks listing,
 * career timeline milestones, system activity audit log listings, and edit/deactivate controls.
 * =============================================================================
 */

"use client";

import React, { useMemo, useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Mail,
  Briefcase,
  Users,
  Calendar,
  Shield,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Activity,
  Edit,
  UserX,
  UserCheck,
  ExternalLink,
  Tag,
  BarChart3,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { EmployeeService } from "@/services/employee.service";
import { DepartmentService } from "@/services/department.service";
import { TaskService } from "@/services/task.service";
import { apiGet, apiPost } from "@/lib/axios";
import { useDBStore } from "@/store/dbStore";
import { format } from "date-fns";
import { useTranslation } from "@/hooks/useTranslation";
import { hasPermission } from "@/config/rbac";
import StatusBadge from "@/components/common/StatusBadge";
import ProtectedRoute from "@/components/rbac/ProtectedRoute";
import EmployeeModal from "@/components/dashboard/employees/EmployeeModal";
import { Employee } from "@/types/employee.types";
import { EmployeeValidationInput } from "@/validators/employee.schema";
import { useToast } from "@/components/common/Toast";
import AccessDeniedState from "@/components/rbac/AccessDeniedState";
import { AuthService } from "@/services/auth.service";

// ─── Helpers ──────────────────────────────────────────────────────────────────

// User-friendly text mappings for role identities
const ROLE_LABELS: Record<string, string> = {
  SUPER_ADMIN: "Super Admin",
  ADMIN: "Admin",
  MANAGER: "Manager",
  EMPLOYEE: "Employee",
  VIEWER: "Viewer",
};

// Priority badge colors dictionary
const PRIORITY_COLORS: Record<string, string> = {
  LOW: "bg-bg-secondary text-text-muted border-border-clean",
  MEDIUM: "bg-status-info-bg text-status-info border-status-info/20",
  HIGH: "bg-status-warning-bg text-status-warning border-status-warning/20",
  ESCALATED: "bg-status-danger-bg text-status-danger border-status-danger/20",
};

/**
 * Reusable stat visualization block for KPIs.
 */
function StatCard({
  label,
  value,
  color,
  icon: Icon,
}: {
  label: string;
  value: number;
  color: string;
  icon: React.ElementType;
}) {
  return (
    <div className="rounded-2xl border border-border-clean bg-bg-primary p-4 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] font-black text-text-muted uppercase tracking-widest">{label}</span>
        <Icon className={`h-4 w-4 ${color}`} />
      </div>
      <span className={`text-2xl font-black ${color}`}>{value}</span>
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function EmployeeProfilePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { isRtl } = useTranslation();
  const { toast } = useToast();
  const { user: currentUser, role: activeRole, refreshSession } = useAuth();

  // State Management hooks
  const [employee, setEmployee] = useState<any | null>(null);
  const [departments, setDepartments] = useState<any[]>([]);
  const [teams, setTeams] = useState<any[]>([]);
  const [employeeTasks, setEmployeeTasks] = useState<any[]>([]);
  const [historyLogs, setHistoryLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [taskTab, setTaskTab] = useState<"active" | "completed" | "all">("active");
  const [isResending, setIsResending] = useState(false);

  /**
   * Orchestrates parallel backend requests to load complete profile logs.
   */
  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [empRes, deptRes, teamRes, taskRes] = await Promise.all([
        EmployeeService.getEmployeeById(id),
        DepartmentService.getDepartments(),
        DepartmentService.getTeams(),
        TaskService.getTasks({ assigneeId: id })
      ]);

      if (empRes.success && empRes.data) {
        setEmployee(empRes.data);
      } else {
        setError(empRes.error || "Employee not found");
      }

      if (deptRes.success && deptRes.data) {
        setDepartments(deptRes.data);
      }
      if (teamRes.success && teamRes.data) {
        setTeams(teamRes.data);
      }
      if (taskRes.success && taskRes.data) {
        setEmployeeTasks(taskRes.data);
      }

      const logs = await apiGet<any[]>(`/audit-logs?entityId=${id}`);
      setHistoryLogs(logs || []);
    } catch (err: any) {
      setError(err.message || "Failed to load employee profile");
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // ── Derived data ────────────────────────────────────────────────────────────

  // Resolves employee department name lookup details
  const department = useMemo(
    () => departments.find((d) => d.id === employee?.departmentId),
    [departments, employee]
  );

  // Resolves employee team name lookup details
  const team = useMemo(
    () => teams.find((t) => t.id === employee?.teamId),
    [teams, employee]
  );

  // Aggregates task stats (completion rate, overdue counts, total tasks allocated)
  const stats = useMemo(() => {
    const total = employeeTasks.length;
    const completed = employeeTasks.filter((t) => t.status === "COMPLETED").length;
    const inProgress = employeeTasks.filter((t) => t.status === "IN_PROGRESS").length;
    const overdue = employeeTasks.filter((t) => t.status === "OVERDUE").length;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { total, completed, inProgress, overdue, completionRate };
  }, [employeeTasks]);

  // Filters tasks according to the active tab selection
  const filteredTasks = useMemo(() => {
    switch (taskTab) {
      case "active":
        return employeeTasks.filter((t) => t.status !== "COMPLETED" && t.status !== "ARCHIVED");
      case "completed":
        return employeeTasks.filter((t) => t.status === "COMPLETED");
      default:
        return employeeTasks;
    }
  }, [employeeTasks, taskTab]);

  // Limits timeline logs to newest 12 entries
  const timeline = useMemo(
    () => historyLogs.slice(0, 12),
    [historyLogs]
  );

  // ── Guards ──────────────────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4 font-poppins">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary"></div>
        <p className="text-xs text-text-muted font-semibold">Loading employee profile...</p>
      </div>
    );
  }

  if (error || !employee) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4 font-poppins">
        <div className="rounded-2xl bg-status-danger-bg border border-status-danger/20 p-8 text-center max-w-sm">
          <AlertTriangle className="h-10 w-10 text-status-danger mx-auto mb-3" />
          <h2 className="text-lg font-black text-text-primary">Employee Not Found</h2>
          <p className="text-sm text-text-muted mt-1 mb-4">
            {error || `No employee with ID ${id} exists.`}
          </p>
          <Link
            href="/employees"
            className="inline-flex items-center gap-2 rounded-xl bg-brand-primary px-4 py-2 text-xs font-black text-white hover:bg-brand-secondary transition-all"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Employees
          </Link>
        </div>
      </div>
    );
  }

  // Restricts non-admin employees from inspecting other profile pages
  const isProfileAuthorized = activeRole !== "EMPLOYEE" || id === currentUser?.id;

  if (!isProfileAuthorized) {
    return <AccessDeniedState />;
  }

  // ── Handlers ────────────────────────────────────────────────────────────────

  /**
   * Sends updated profile properties to the backend.
   */
  const handleUpdateEmployee = async (data: EmployeeValidationInput) => {
    try {
      const res = await EmployeeService.updateEmployee(employee.id, data);
      if (res.success && res.data) {
        setEmployee(res.data);
        useDBStore.getState().updateEmployee(res.data.id, res.data as any);
        
        // Refresh session if editing own profile
        if (currentUser?.id === res.data.id) {
          await refreshSession();
        }

        setIsEditOpen(false);
        toast("Employee profile updated successfully.", "success");
        loadData();
      } else {
        toast(res.error || "Failed to update employee profile", "error");
      }
    } catch (err: any) {
      toast(err.message || "Failed to update employee profile", "error");
    }
  };

  /**
   * Toggles the employee's active status.
   */
  const handleToggleStatus = async () => {
    const newStatus = !employee.isActive;
    try {
      const res = await EmployeeService.updateEmployee(employee.id, { isActive: newStatus });
      if (res.success && res.data) {
        setEmployee(res.data);
        toast(
          `${employee.name} has been ${newStatus ? "reactivated" : "deactivated"}.`,
          newStatus ? "success" : "warning"
        );
        loadData();
      } else {
        toast(res.error || "Failed to update status", "error");
      }
    } catch (err: any) {
      toast(err.message || "Failed to update status", "error");
    }
  };

  const handleResendVerification = async () => {
    setIsResending(true);
    try {
      const res = await AuthService.resendVerification(employee.email);
      if (res.success) {
        toast("Verification email successfully resent.", "success");
      } else {
        toast(res.message || "Failed to resend verification.", "error");
      }
    } catch (err: any) {
      toast(err.message || "Failed to resend verification.", "error");
    } finally {
      setIsResending(false);
    }
  };

  const handleUnlockAccount = async () => {
    try {
      const res = await EmployeeService.updateEmployee(employee.id, {
        lockedUntil: null,
        failedLoginAttempts: 0,
      } as any);
      if (res.success && res.data) {
        toast("Account unlocked successfully.", "success");
        loadData();
      } else {
        toast(res.error || "Failed to unlock account.", "error");
      }
    } catch (err: any) {
      toast(err.message || "Failed to unlock account.", "error");
    }
  };

  const handleLockAccount = async () => {
    try {
      const res = await EmployeeService.updateEmployee(employee.id, {
        lockedUntil: new Date(Date.now() + 15 * 60 * 1000),
      } as any);
      if (res.success && res.data) {
        toast("Account locked temporarily for 15 minutes.", "warning");
        loadData();
      } else {
        toast(res.error || "Failed to lock account.", "error");
      }
    } catch (err: any) {
      toast(err.message || "Failed to lock account.", "error");
    }
  };

  // ── Milestones ──────────────────────────────────────────────────────────────

  const hireDate = new Date(employee.createdAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // Mock milestone log representing user onboarding progress path
  const timelineMilestones = [
    {
      label: "Hired & Onboarded",
      desc: "Account created and provisioned in HR system.",
      date: new Date(employee.createdAt).toLocaleDateString(),
      color: "bg-status-success-bg border-status-success/20",
      iconColor: "text-status-success",
      Icon: Briefcase,
    },
    {
      label: "Initial Task Assignment",
      desc: "First task assigned as part of team onboarding workflow.",
      date: new Date(new Date(employee.createdAt).getTime() + 7 * 86400000).toLocaleDateString(),
      color: "bg-brand-muted border-brand-primary/20",
      iconColor: "text-brand-primary",
      Icon: CheckCircle2,
    },
    {
      label: "Q1 Performance Review",
      desc: "Completed first quarterly performance alignment session.",
      date: new Date(new Date(employee.createdAt).getTime() + 90 * 86400000).toLocaleDateString(),
      color: "bg-status-warning-bg border-status-warning/20",
      iconColor: "text-status-warning",
      Icon: BarChart3,
    },
  ];

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <ProtectedRoute permission="employees:view">
      <div className="space-y-6 font-poppins animate-slide-up">

        {/* Back Nav + Action Buttons */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 text-xs font-bold text-text-secondary hover:text-brand-primary transition-colors focus:outline-none"
          >
            <ArrowLeft className="h-4 w-4" />
            {isRtl ? "العودة" : "Back to Employees"}
          </button>

          <div className="flex items-center gap-2 flex-wrap">
            {hasPermission(activeRole || "EMPLOYEE", "employees:update") && (
              <button
                onClick={() => setIsEditOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-xl border border-border-clean bg-bg-primary px-3 py-2 text-xs font-bold text-text-secondary hover:bg-bg-tertiary hover:text-text-primary transition-all focus:outline-none"
              >
                <Edit className="h-3.5 w-3.5" />
                Edit Profile
              </button>
            )}
            {hasPermission(activeRole || "EMPLOYEE", "employees:delete") && (
              <button
                onClick={handleToggleStatus}
                className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold transition-all focus:outline-none ${employee.isActive
                    ? "border border-status-danger/30 bg-status-danger-bg text-status-danger hover:bg-status-danger hover:text-white"
                    : "border border-status-success/30 bg-status-success-bg text-status-success hover:bg-status-success hover:text-white"
                  }`}
              >
                {employee.isActive ? (
                  <><UserX className="h-3.5 w-3.5" />Deactivate</>
                ) : (
                  <><UserCheck className="h-3.5 w-3.5" />Reactivate</>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Profile Hero Card */}
        <div className="rounded-2xl border border-border-clean bg-bg-primary shadow-sm overflow-hidden">
          <div className="h-24 bg-gradient-to-r from-brand-primary via-brand-secondary to-indigo-400" />
          <div className="px-6 pb-6">
            <div className="flex items-end justify-between -mt-10 mb-4 flex-wrap gap-4">
              <div className="relative">
                <img
                  src={employee.avatarUrl}
                  alt={employee.name}
                  className="h-20 w-20 rounded-2xl object-cover border-4 border-bg-primary shadow-lg"
                />
                <span className={`absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-bg-primary ${employee.isActive ? "bg-status-success" : "bg-status-danger"}`} />
              </div>
              <div className="flex items-center gap-2">
                <span className={`rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-widest ${employee.isActive ? "bg-status-success-bg border-status-success/30 text-status-success" : "bg-status-danger-bg border-status-danger/30 text-status-danger"}`}>
                  {employee.isActive ? "Active" : "Inactive"}
                </span>
                <span className="rounded-full border border-brand-primary/30 bg-brand-muted px-3 py-1 text-[10px] font-black uppercase tracking-widest text-brand-primary">
                  {ROLE_LABELS[employee.role] || employee.role}
                </span>
              </div>
            </div>

            <div className="flex items-start justify-between flex-wrap gap-4">
              <div>
                <h1 className="text-xl font-black text-text-primary">{employee.name}</h1>
                <p className="text-sm font-semibold text-text-secondary mt-0.5">{employee.title}</p>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-3">
                  <span className="flex items-center gap-1.5 text-xs text-text-muted font-medium">
                    <Mail className="h-3.5 w-3.5 text-brand-primary" />
                    <a href={`mailto:${employee.email}`} className="hover:text-brand-primary hover:underline transition-colors">{employee.email}</a>
                  </span>
                  {department && (
                    <span className="flex items-center gap-1.5 text-xs text-text-muted font-medium">
                      <Briefcase className="h-3.5 w-3.5 text-brand-primary" />
                      {department.name}
                    </span>
                  )}
                  {team && (
                    <span className="flex items-center gap-1.5 text-xs text-text-muted font-medium">
                      <Users className="h-3.5 w-3.5 text-brand-primary" />
                      {team.name}
                    </span>
                  )}
                  <span className="flex items-center gap-1.5 text-xs text-text-muted font-medium">
                    <Calendar className="h-3.5 w-3.5 text-brand-primary" />
                    Joined {hireDate}
                  </span>
                  <span className="flex items-center gap-1.5 text-xs text-text-muted font-medium">
                    <Shield className="h-3.5 w-3.5 text-brand-primary" />
                    {ROLE_LABELS[employee.role]}
                  </span>
                </div>
              </div>

              {/* Completion Ring */}
              <div className="flex flex-col items-center">
                <div className="relative h-16 w-16">
                  <svg className="-rotate-90 h-16 w-16" viewBox="0 0 64 64">
                    <circle cx="32" cy="32" r="26" fill="none" strokeWidth="6" className="stroke-bg-tertiary" />
                    <circle
                      cx="32" cy="32" r="26" fill="none" strokeWidth="6"
                      strokeDasharray={`${2 * Math.PI * 26}`}
                      strokeDashoffset={`${2 * Math.PI * 26 * (1 - stats.completionRate / 100)}`}
                      className="stroke-status-success transition-all duration-700"
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xs font-black text-status-success">{stats.completionRate}%</span>
                  </div>
                </div>
                <p className="text-[9px] font-bold text-text-muted mt-1 uppercase tracking-wide">Complete</p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="Total Tasks" value={stats.total} color="text-brand-primary" icon={Tag} />
          <StatCard label="Completed" value={stats.completed} color="text-status-success" icon={CheckCircle2} />
          <StatCard label="In Progress" value={stats.inProgress} color="text-brand-primary" icon={Activity} />
          <StatCard label="Overdue" value={stats.overdue} color="text-status-danger" icon={AlertTriangle} />
        </div>

        {/* Task List + Timeline */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Task List */}
          <div className="lg:col-span-2 rounded-2xl border border-border-clean bg-bg-primary shadow-sm overflow-hidden">
            <div className="flex items-center justify-between border-b border-border-clean px-5 py-3">
              <h3 className="text-xs font-black text-text-primary uppercase tracking-widest">Assigned Tasks</h3>
              <div className="flex items-center rounded-xl border border-border-clean bg-bg-secondary p-0.5 gap-0.5">
                {(["active", "completed", "all"] as const).map((tab) => (
                  <button key={tab} onClick={() => setTaskTab(tab)}
                    className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wide transition-all focus:outline-none capitalize ${taskTab === tab ? "bg-brand-primary text-white shadow-sm" : "text-text-muted hover:text-text-primary"
                      }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>
            <div className="divide-y divide-border-clean">
              {filteredTasks.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 gap-3 text-text-muted">
                  <Clock className="h-8 w-8 opacity-40" />
                  <p className="text-xs font-bold uppercase tracking-wide">No {taskTab === "all" ? "" : taskTab} tasks</p>
                </div>
              ) : (
                filteredTasks.slice(0, 12).map((task) => (
                  <div key={task.id} className="flex items-center justify-between gap-3 px-5 py-3.5 hover:bg-bg-secondary transition-colors group">
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-text-primary truncate group-hover:text-brand-primary transition-colors">{task.title}</p>
                      <p className="text-[10px] text-text-muted font-medium mt-0.5">
                        Due {new Date(task.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                        {task.estimatedHours ? ` · ${task.estimatedHours}h est.` : ""}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-md border ${PRIORITY_COLORS[task.priority] || PRIORITY_COLORS.LOW}`}>
                        {task.priority}
                      </span>
                      <StatusBadge status={task.status} />
                    </div>
                  </div>
                ))
              )}
            </div>
            {filteredTasks.length > 12 && (
              <div className="px-5 py-3 border-t border-border-clean">
                <Link href={`/tasks`} className="flex items-center justify-center gap-1.5 text-[10px] font-bold text-brand-primary hover:underline">
                  View all {filteredTasks.length} tasks <ExternalLink className="h-3 w-3" />
                </Link>
              </div>
            )}
          </div>

          {/* Career Timeline */}
          <div className="rounded-2xl border border-border-clean bg-bg-primary shadow-sm overflow-hidden">
            <div className="border-b border-border-clean px-5 py-3">
              <h3 className="text-xs font-black text-text-primary uppercase tracking-widest flex items-center gap-2">
                <Activity className="h-3.5 w-3.5 text-brand-primary" />
                Career Timeline
              </h3>
            </div>
            <div className="p-5 space-y-4">
              {timelineMilestones.map((m, idx) => (
                <div key={idx} className="relative pl-6 pb-2 border-l border-border-clean last:pb-0 last:border-0 ml-3">
                  <div className={`absolute -left-3.5 top-0 flex h-7 w-7 items-center justify-center rounded-full border shadow-sm ${m.color}`}>
                    <m.Icon className={`h-3 w-3 ${m.iconColor}`} />
                  </div>
                  <h5 className="text-[11px] font-black text-text-primary leading-tight">{m.label}</h5>
                  <p className="text-[10px] text-text-muted font-medium mt-0.5 leading-relaxed">{m.desc}</p>
                  <span className="text-[9px] text-text-muted font-bold mt-1 block">{m.date}</span>
                </div>
              ))}
            </div>
            {timeline.length > 0 && (
              <>
                <div className="px-5 py-2 border-t border-border-clean">
                  <p className="text-[9px] font-black text-text-muted uppercase tracking-widest">System Activity Log</p>
                </div>
                <div className="px-5 pb-5 space-y-2.5 max-h-48 overflow-y-auto">
                  {timeline.map((log) => (
                    <div key={log.id} className="flex gap-2.5">
                      <div className="mt-1 h-1.5 w-1.5 rounded-full bg-brand-primary/60 shrink-0" />
                      <div>
                        <p className="text-[10px] font-bold text-text-primary leading-snug">{log.details}</p>
                        <p className="text-[9px] text-text-muted font-medium">
                          {new Date(log.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Security & Access Administration (ADMIN only) */}
          {(activeRole === "SUPER_ADMIN" || activeRole === "ADMIN") && (
            <div className="rounded-2xl border border-border-clean bg-bg-primary shadow-sm overflow-hidden">
              <div className="border-b border-border-clean px-5 py-3">
                <h3 className="text-xs font-black text-text-primary uppercase tracking-widest flex items-center gap-2">
                  <Shield className="h-3.5 w-3.5 text-brand-primary" />
                  Security & Access
                </h3>
              </div>
              <div className="p-5 space-y-4 text-xs font-semibold text-text-secondary">
                <div className="flex justify-between items-center">
                  <span>Email Verification</span>
                  <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase border ${employee.isEmailVerified ? "bg-status-success-bg border-status-success/30 text-status-success" : "bg-status-danger-bg border-status-danger/30 text-status-danger"}`}>
                    {employee.isEmailVerified ? "Verified" : "Unverified"}
                  </span>
                </div>

                {!employee.isEmailVerified && (
                  <button
                    onClick={handleResendVerification}
                    disabled={isResending}
                    className="w-full flex items-center justify-center py-2 border border-border-clean rounded-xl bg-bg-secondary hover:bg-bg-tertiary transition-all cursor-pointer disabled:opacity-50 text-[10px] font-black uppercase tracking-wider"
                  >
                    {isResending ? "Resending..." : "Resend Verification Email"}
                  </button>
                )}

                <div className="divider my-2"></div>

                <div className="flex justify-between items-center">
                  <span>Account Lockout</span>
                  <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase border ${employee.lockedUntil && new Date(employee.lockedUntil) > new Date() ? "bg-status-danger-bg border-status-danger/30 text-status-danger" : "bg-status-success-bg border-status-success/30 text-status-success"}`}>
                    {employee.lockedUntil && new Date(employee.lockedUntil) > new Date() ? "Locked" : "Normal"}
                  </span>
                </div>

                {employee.lockedUntil && new Date(employee.lockedUntil) > new Date() ? (
                  <div className="space-y-2">
                    <p className="text-[10px] text-text-muted">
                      Locked until: {new Date(employee.lockedUntil).toLocaleString()}
                    </p>
                    <button
                      onClick={handleUnlockAccount}
                      className="w-full flex items-center justify-center py-2 border border-transparent rounded-xl bg-status-success text-white hover:bg-status-success/90 transition-all cursor-pointer text-[10px] font-black uppercase tracking-wider"
                    >
                      Unlock Account
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <p className="text-[10px] text-text-muted">
                      Failed Attempts: {employee.failedLoginAttempts || 0} / 5
                    </p>
                    <button
                      onClick={handleLockAccount}
                      className="w-full flex items-center justify-center py-2 border border-transparent rounded-xl bg-status-danger text-white hover:bg-status-danger/90 transition-all cursor-pointer text-[10px] font-black uppercase tracking-wider"
                    >
                      Force Lock (15 Mins)
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {isEditOpen && (
        <EmployeeModal
          isOpen={isEditOpen}
          onClose={() => setIsEditOpen(false)}
          onSubmit={handleUpdateEmployee}
          initialData={{
            id: employee.id,
            employeeCode: employee.id,
            fullName: employee.name,
            email: employee.email,
            phone: null,
            role: employee.role as Employee["role"],
            title: employee.title,
            departmentId: employee.departmentId ?? null,
            teamId: employee.teamId ?? null,
            isActive: employee.isActive,
            createdAt: employee.createdAt,
            avatarUrl: employee.avatarUrl,
          }}
          departments={departments}
        />
      )}
    </ProtectedRoute>
  );
}
