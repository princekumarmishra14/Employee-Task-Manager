/**
 * =============================================================================
 * TASK DETAIL PAGE COMPONENT
 * Project: Employee Task Manager (Enterprise Edition)
 * Role: Next.js App Router Page ((dashboard)/tasks/[id])
 * 
 * Description:
 * Renders the detailed task inspection view. Performs authorization checks
 * (locking view access for standard employees if the task is not assigned to them),
 * manages status updates and reassignments, supports mock file uploads,
 * shows real-time task comment feeds, and displays history audit logs.
 * =============================================================================
 */

"use client";

import React, { useMemo, useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  User, 
  Tag, 
  MessageSquare, 
  Paperclip, 
  Upload, 
  UserPlus, 
  CheckCircle, 
  AlertTriangle, 
  Activity, 
  Lock,
  ChevronRight,
  ExternalLink
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { TaskService } from "@/services/task.service";
import { EmployeeService } from "@/services/employee.service";
import { DepartmentService } from "@/services/department.service";
import { apiGet } from "@/lib/axios";
import { useTranslation } from "@/hooks/useTranslation";
import { hasPermission } from "@/config/rbac";
import StatusBadge from "@/components/common/StatusBadge";
import { useToast } from "@/components/common/Toast";
import AccessDeniedState from "@/components/rbac/AccessDeniedState";

// CSS class dictionary mapping priorities to harmonious UI badges
const PRIORITY_COLORS: Record<string, string> = {
  LOW: "bg-bg-secondary text-text-muted border-border-clean",
  MEDIUM: "bg-status-info-bg text-status-info border-status-info/20",
  HIGH: "bg-status-warning-bg text-status-warning border-status-warning/20",
  ESCALATED: "bg-status-danger-bg text-status-danger border-status-danger/20",
};

export default function TaskDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { isRtl, t } = useTranslation();
  const { toast } = useToast();
  const { user: currentUser, role: activeRole } = useAuth();

  // State Management hooks
  const [task, setTask] = useState<any | null>(null);
  const [employees, setEmployees] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [teams, setTeams] = useState<any[]>([]);
  const [historyLogs, setHistoryLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [commentText, setCommentText] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  // Localized state containing mock document attachments
  const [attachments, setAttachments] = useState([
    { name: "Technical_Specifications_v2.pdf", size: "1.4 MB", type: "pdf", date: "2026-06-20T10:00:00Z" },
    { name: "DB_Schema_Consolidation.xlsx", size: "840 KB", type: "excel", date: "2026-06-22T14:30:00Z" },
  ]);

  /**
   * Refreshes the task's historic event log from backend.
   */
  const loadHistory = useCallback(async () => {
    try {
      const logs = await apiGet<any[]>(`/audit-logs?entity=TASK&entityId=${id}`);
      setHistoryLogs(logs || []);
    } catch (e) {
      console.warn("Failed to load task history", e);
    }
  }, [id]);

  // Coordinated React hooks loading Task profile data
  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      setError(null);
      try {
        const [taskRes, empRes, deptRes, teamRes] = await Promise.all([
          TaskService.getTaskById(id),
          EmployeeService.getEmployees(),
          DepartmentService.getDepartments(),
          DepartmentService.getTeams()
        ]);

        if (taskRes.success && taskRes.data) {
          setTask(taskRes.data);
        } else {
          setError(taskRes.error || "Task not found");
        }

        if (empRes.success && empRes.data) {
          setEmployees(empRes.data);
        }
        if (deptRes.success && deptRes.data) {
          setDepartments(deptRes.data);
        }
        if (teamRes.success && teamRes.data) {
          setTeams(teamRes.data);
        }

        const logs = await apiGet<any[]>(`/audit-logs?entity=TASK&entityId=${id}`);
        setHistoryLogs(logs || []);

      } catch (err: any) {
        setError(err.message || "Failed to load task details");
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, [id]);

  // Derived state calculations
  const assignee = useMemo(() => employees.find((e) => e.id === task?.assignedTo?.id), [employees, task]);
  const taskComments = useMemo(() => task?.comments || [], [task]);
  
  // Sort historic logs oldest first
  const taskHistory = useMemo(() => {
    return [...historyLogs].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }, [historyLogs]);

  // Calculates due date time thresholds (overdue alerts, warning days remaining)
  const dueInfo = useMemo(() => {
    if (!task?.dueDate) return null;
    const due = new Date(task.dueDate);
    const today = new Date();
    due.setHours(0,0,0,0);
    today.setHours(0,0,0,0);
    
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return {
      days: diffDays,
      isOverdue: diffDays < 0,
      isDueToday: diffDays === 0
    };
  }, [task?.dueDate]);

  // Enforces security boundaries: Standard Employees can only inspect tasks assigned directly to them.
  const isAuthorized = useMemo(() => {
    if (!task) return false;
    if (activeRole === "EMPLOYEE") {
      return task.assignedTo?.id === currentUser?.id;
    }
    return hasPermission(activeRole || "EMPLOYEE", "tasks:view");
  }, [activeRole, currentUser?.id, task]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4 font-poppins">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary"></div>
        <p className="text-xs text-text-muted font-semibold">Loading task details...</p>
      </div>
    );
  }

  if (error || !task) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4 font-poppins">
        <div className="rounded-2xl bg-status-danger-bg border border-status-danger/20 p-8 text-center max-w-sm">
          <AlertTriangle className="h-10 w-10 text-status-danger mx-auto mb-3" />
          <h2 className="text-lg font-black text-text-primary">Task Not Found</h2>
          <p className="text-sm text-text-muted mt-1 mb-4">
            {error || "The requested task does not exist or has been deleted."}
          </p>
          <Link
            href="/tasks"
            className="inline-flex items-center gap-2 rounded-xl bg-brand-primary px-4 py-2 text-xs font-black text-white hover:bg-brand-secondary transition-all"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Tasks
          </Link>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return <AccessDeniedState />;
  }

  // Handlers

  /**
   * Dispatches status updates to the server.
   */
  const handleStatusChange = async (newStatus: string) => {
    try {
      const res = await TaskService.updateTask(task.id, { status: newStatus as any });
      if (res.success && res.data) {
        setTask(res.data);
        toast(`Task status updated to: ${newStatus}`, "success");
        loadHistory();
      } else {
        toast(res.error || "Failed to update status", "error");
      }
    } catch (err: any) {
      toast(err.message || "Failed to update status", "error");
    }
  };

  /**
   * Changes task assignee assignment values.
   */
  const handleAssigneeChange = async (newAssigneeId: string) => {
    const assigneeVal = newAssigneeId === "UNASSIGNED" ? null : newAssigneeId;
    try {
      const res = await TaskService.updateTask(task.id, { 
          assigneeId: assigneeVal,
          status: assigneeVal ? "ASSIGNED" : "UNASSIGNED"
      });
      if (res.success && res.data) {
        setTask(res.data);
        toast(assigneeVal ? "Task reassigned successfully." : "Task unassigned.", "success");
        loadHistory();
      } else {
        toast(res.error || "Failed to reassign task", "error");
      }
    } catch (err: any) {
      toast(err.message || "Failed to reassign task", "error");
    }
  };

  /**
   * Submits a discussion comment for this task.
   */
  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    try {
      const res = await TaskService.addComment(task.id, commentText.trim());
      if (res.success && res.data) {
        const taskRes = await TaskService.getTaskById(task.id);
        if (taskRes.success && taskRes.data) {
          setTask(taskRes.data);
        }
        setCommentText("");
        toast("Comment posted successfully.", "success");
      } else {
        toast(res.error || "Failed to post comment", "error");
      }
    } catch (err: any) {
      toast(err.message || "Failed to post comment", "error");
    }
  };

  /**
   * Simulates file uploads and appends mock structures to list.
   */
  const handleMockUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setIsUploading(true);
    setUploadProgress(0);
    
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setIsUploading(false);
            setAttachments((curr) => [
              ...curr,
              { 
                name: file.name, 
                size: `${Math.round(file.size / 1024)} KB`, 
                type: file.name.split(".").pop() || "unknown", 
                date: new Date().toISOString() 
              }
            ]);
            toast("File uploaded successfully.", "success");
          }, 400);
          return 100;
        }
        return prev + 25;
      });
    }, 200);
  };

  return (
    <div className="space-y-6 font-poppins animate-slide-up">
      {/* Top Nav Actions */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <button
          onClick={() => router.push("/tasks")}
          className="inline-flex items-center gap-2 text-xs font-bold text-text-secondary hover:text-brand-primary transition-colors focus:outline-none"
        >
          <ArrowLeft className="h-4 w-4" />
          {isRtl ? "العودة إلى مساحة العمل" : "Back to Tasks"}
        </button>

        {dueInfo?.isOverdue && (
          <div className="inline-flex items-center gap-1.5 rounded-full bg-status-danger-bg border border-status-danger/30 text-status-danger px-3 py-1 text-xs font-black uppercase tracking-wider animate-pulse">
            <AlertTriangle className="h-3.5 w-3.5" />
            <span>Overdue Warning</span>
          </div>
        )}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Columns (2/3 width) - Task Meta and Discussions */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Main Info Box */}
          <div className="rounded-2xl border border-border-clean bg-bg-primary p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-md border ${PRIORITY_COLORS[task.priority]}`}>
                {task.priority} Priority
              </span>
              <StatusBadge status={task.status} />
              {task.estimatedHours && (
                <span className="text-[10px] font-bold text-text-muted bg-bg-secondary px-2.5 py-1 rounded-lg border border-border-clean/50">
                  {task.estimatedHours}h estimated
                </span>
              )}
            </div>

            <h1 className="text-xl sm:text-2xl font-black text-text-primary leading-tight">
              {task.title}
            </h1>

            <div className="bg-bg-secondary/40 border border-border-clean/60 rounded-xl p-4 sm:p-5 whitespace-pre-line leading-relaxed text-sm text-text-secondary font-medium">
              {task.description}
            </div>

            {/* Tags rendering */}
            {task.tags && task.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-2">
                {task.tags.map((tag: string) => (
                  <span key={tag} className="inline-flex items-center gap-1 rounded-full bg-brand-muted border border-brand-primary/15 px-2.5 py-0.5 text-[10px] font-bold text-brand-primary">
                    <Tag className="h-2.5 w-2.5" />
                    {tag}
                  </span>
                ))}
              </div>
            )}

            <div className="border-t border-border-clean pt-4 flex justify-between items-center text-[10px] text-text-muted font-bold flex-wrap gap-2">
              <span>Created by: {task.createdBy}</span>
              <span>Updated: {new Date(task.updatedAt).toLocaleDateString()}</span>
            </div>
          </div>

          {/* Attachments Section */}
          <div className="rounded-2xl border border-border-clean bg-bg-primary p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-border-clean pb-3">
              <h3 className="text-xs font-black text-text-primary uppercase tracking-widest flex items-center gap-2">
                <Paperclip className="h-4 w-4 text-brand-primary" />
                <span>Task Attachments</span>
              </h3>
              
              <label className="inline-flex items-center gap-1.5 rounded-xl border border-border-clean bg-bg-secondary hover:bg-bg-tertiary text-xs font-black text-text-secondary hover:text-text-primary px-3 py-1.5 cursor-pointer transition-all">
                <Upload className="h-3.5 w-3.5" />
                <span>Upload File</span>
                <input 
                  type="file" 
                  disabled={isUploading}
                  onChange={handleMockUpload}
                  className="hidden" 
                />
              </label>
            </div>

            {isUploading && (
              <div className="bg-bg-secondary p-4 rounded-xl border border-border-clean flex flex-col gap-2">
                <div className="flex justify-between items-center text-[10px] font-black text-brand-primary uppercase">
                  <span>Uploading attachment files...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="h-1.5 w-full bg-bg-tertiary rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-brand-primary to-brand-secondary transition-all"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {attachments.map((file, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 rounded-xl border border-border-clean/80 hover:border-brand-primary/20 bg-bg-secondary/20 hover:bg-bg-secondary/40 transition-all group">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="h-8 w-8 rounded-lg bg-brand-muted text-brand-primary flex items-center justify-center shrink-0">
                      <Paperclip className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-text-primary truncate">{file.name}</p>
                      <p className="text-[10px] text-text-muted mt-0.5">{file.size}</p>
                    </div>
                  </div>
                  <button className="text-[10px] font-bold text-brand-primary opacity-0 group-hover:opacity-100 hover:underline transition-all flex items-center gap-0.5 shrink-0">
                    Open <ExternalLink className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Comments Section */}
          <div className="rounded-2xl border border-border-clean bg-bg-primary p-6 shadow-sm space-y-4">
            <h3 className="text-xs font-black text-text-primary uppercase tracking-widest flex items-center gap-2 border-b border-border-clean pb-3">
              <MessageSquare className="h-4 w-4 text-brand-primary" />
              <span>Discussion ({taskComments.length})</span>
            </h3>

            {/* List of comments */}
            <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
              {taskComments.length === 0 ? (
                <p className="text-xs text-text-muted text-center py-6">No discussions yet. Post a comment to begin collaboration.</p>
              ) : (
                taskComments.map((comm: any) => (
                  <div key={comm.id} className="bg-bg-secondary/40 border border-border-clean/50 rounded-xl p-3.5 space-y-1.5">
                    <div className="flex items-center justify-between text-[10px] font-bold text-text-secondary">
                      <span>{comm.authorName}</span>
                      <span>
                        {new Date(comm.createdAt).toLocaleDateString([], {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit"
                        })}
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-text-primary leading-relaxed">{comm.content}</p>
                  </div>
                ))
              )}
            </div>

            {/* Add comment Form */}
            <form onSubmit={handlePostComment} className="flex gap-2">
              <input
                type="text"
                placeholder="Type your message to task participants..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                className="w-full rounded-xl border border-border-clean bg-bg-secondary px-3 py-2 text-xs text-text-primary outline-none focus:border-brand-primary transition-all"
              />
              <button 
                type="submit"
                disabled={!commentText.trim()}
                className="rounded-xl bg-brand-primary text-white hover:bg-brand-secondary px-4 py-2 text-xs font-bold transition-all disabled:opacity-40 select-none shrink-0"
              >
                Send
              </button>
            </form>
          </div>

        </div>

        {/* Right Column (1/3 width) - Work Controls & Timeline Log */}
        <div className="space-y-6">
          
          {/* Work Control Box */}
          <div className="rounded-2xl border border-border-clean bg-bg-primary p-6 shadow-sm space-y-5">
            <h3 className="text-xs font-black text-text-primary uppercase tracking-widest flex items-center gap-2 border-b border-border-clean pb-3">
              <Clock className="h-4 w-4 text-brand-primary" />
              <span>Workflow Controls</span>
            </h3>

            {/* Due Date Indicator */}
            {task.dueDate && (
              <div className="flex items-center justify-between p-3 rounded-xl bg-bg-secondary border border-border-clean/60">
                <div className="flex items-center gap-2 text-xs font-bold text-text-secondary">
                  <Calendar className="h-4 w-4 text-brand-primary" />
                  <span>Due: {new Date(task.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                </div>
                {dueInfo && (
                  <span className={`text-[10px] font-black uppercase tracking-wider rounded px-2 py-0.5 border ${
                    dueInfo.isOverdue
                      ? "bg-status-danger-bg text-status-danger border-status-danger/30"
                      : dueInfo.isDueToday
                      ? "bg-status-warning-bg text-status-warning border-status-warning/30"
                      : "bg-status-success-bg text-status-success border-status-success/30"
                  }`}>
                    {dueInfo.isOverdue 
                      ? `${Math.abs(dueInfo.days)}d Overdue` 
                      : dueInfo.isDueToday 
                      ? "Due Today" 
                      : `${dueInfo.days}d Left`}
                  </span>
                )}
              </div>
            )}

            {/* Status Selector */}
            <div className="space-y-1.5">
              <label className="block text-[10px] font-black text-text-muted uppercase tracking-wider">Update Status</label>
              <select
                value={task.status}
                onChange={(e) => handleStatusChange(e.target.value)}
                className="w-full rounded-xl border border-border-clean bg-bg-secondary py-2.5 px-3 text-xs text-text-primary outline-none focus:border-brand-primary cursor-pointer transition-all"
              >
                <option value="UNASSIGNED">Unassigned</option>
                <option value="ASSIGNED">Assigned</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="COMPLETED">Completed</option>
                <option value="OVERDUE">Overdue</option>
                <option value="ARCHIVED">Archived</option>
              </select>
            </div>

            {/* Assignee Selector (Admin/Manager only) */}
            {hasPermission(activeRole || "EMPLOYEE", "tasks:update") ? (
              <div className="space-y-1.5">
                <label className="block text-[10px] font-black text-text-muted uppercase tracking-wider">Reassign Workflow</label>
                <select
                  value={task.assigneeId || "UNASSIGNED"}
                  onChange={(e) => handleAssigneeChange(e.target.value)}
                  className="w-full rounded-xl border border-border-clean bg-bg-secondary py-2.5 px-3 text-xs text-text-primary outline-none focus:border-brand-primary cursor-pointer transition-all"
                >
                  <option value="UNASSIGNED">Unassigned / Open Pool</option>
                  {employees.filter(e => e.isActive).map((emp) => (
                    <option key={emp.id} value={emp.id}>{emp.name} ({emp.title})</option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="space-y-1 bg-bg-secondary/40 border border-border-clean/50 rounded-xl p-3">
                <span className="text-[9px] font-black text-text-muted uppercase tracking-widest block">Assignee Lock</span>
                <span className="text-xs font-bold text-text-secondary flex items-center gap-1 mt-0.5">
                  <Lock className="h-3.5 w-3.5 text-text-muted" />
                  Reassignment Restricted
                </span>
              </div>
            )}
          </div>

          {/* Assignee Card */}
          <div className="rounded-2xl border border-border-clean bg-bg-primary p-6 shadow-sm space-y-4">
            <h3 className="text-xs font-black text-text-primary uppercase tracking-widest flex items-center gap-2 border-b border-border-clean pb-3">
              <User className="h-4 w-4 text-brand-primary" />
              <span>Assigned Employee</span>
            </h3>

            {assignee ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <img 
                    src={assignee.avatarUrl} 
                    alt={assignee.name}
                    className="h-10 w-10 rounded-xl object-cover border border-border-clean shadow-sm shrink-0" 
                  />
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-text-primary truncate">{assignee.name}</p>
                    <p className="text-[10px] text-text-muted truncate font-medium mt-0.5">{assignee.title}</p>
                  </div>
                </div>
                
                <div className="space-y-2 text-[10px] font-semibold text-text-secondary border-t border-border-clean pt-3">
                  <p><strong>Email:</strong> {assignee.email}</p>
                  {assignee.phone && <p><strong>Phone:</strong> {assignee.phone}</p>}
                  <p><strong>Employee Code:</strong> {assignee.employeeCode}</p>
                </div>

                <Link
                  href={`/employees/${assignee.id}`}
                  className="inline-flex w-full justify-center items-center gap-1 rounded-xl border border-border-clean/80 hover:border-brand-primary/20 bg-bg-secondary hover:bg-bg-tertiary px-3 py-2 text-xs font-bold text-text-secondary hover:text-brand-primary transition-all text-center"
                >
                  <span>View Member Profile</span>
                  <ChevronRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-6 text-center text-text-muted bg-bg-secondary/40 border border-dashed border-border-clean rounded-xl gap-2">
                <UserPlus className="h-8 w-8 text-text-muted opacity-50" />
                <p className="text-xs font-bold">Unassigned Task</p>
                <p className="text-[9px] font-medium leading-normal px-4">This task is currently not allocated. Allocate to an employee to initiate workflow tracking.</p>
              </div>
            )}
          </div>

          {/* Career Status History Timeline */}
          <div className="rounded-2xl border border-border-clean bg-bg-primary p-6 shadow-sm space-y-4">
            <h3 className="text-xs font-black text-text-primary uppercase tracking-widest flex items-center gap-2 border-b border-border-clean pb-3">
              <Activity className="h-4 w-4 text-brand-primary" />
              <span>Status History Log</span>
            </h3>

            <div className="relative border-l border-border-clean pl-4 space-y-4 ml-1.5">
              {taskHistory.length === 0 ? (
                <p className="text-xs text-text-muted">No state log entries recorded yet.</p>
              ) : (
                taskHistory.map((log) => (
                  <div key={log.id} className="relative">
                    <span className="absolute -left-[21px] top-0.5 h-2 w-2 rounded-full bg-brand-primary shadow-sm ring-4 ring-bg-primary" />
                    <div className="text-[10px] leading-tight">
                      <p className="font-bold text-text-primary">{log.details}</p>
                      <p className="text-[9px] text-text-muted font-bold uppercase mt-1">
                        {log.performedBy} · {new Date(log.createdAt).toLocaleDateString([], { month: "short", day: "numeric" })}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
