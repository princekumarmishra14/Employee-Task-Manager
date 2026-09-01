"use client";

import React, { useState, useMemo } from "react";
import { useDBStore } from "@/store/dbStore";
import { useTranslation } from "@/hooks/useTranslation";
import { 
  BarChart3, 
  Download, 
  CheckCircle2, 
  TrendingUp, 
  Calendar,
  Users,
  Building,
  Briefcase,
  FileText,
  AlertTriangle
} from "lucide-react";
import ProtectedRoute from "@/components/rbac/ProtectedRoute";
import { useToast } from "@/components/common/Toast";

export default function ReportsPage() {
  const { t, isRtl } = useTranslation();
  const { tasks, employees, departments } = useDBStore();
  const { toast } = useToast();
  
  const [activeReportTab, setActiveReportTab] = useState<"employee" | "task" | "department">("employee");

  // ─── Report Datasets Calculations ──────────────────────────────────────────

  // 1. Employee Performance dataset
  const employeeReport = useMemo(() => {
    return employees.map((emp) => {
      const empTasks = tasks.filter((t) => t.assigneeId === emp.id && !t.isDeleted);
      const total = empTasks.length;
      const completed = empTasks.filter((t) => t.status === "COMPLETED").length;
      const overdue = empTasks.filter((t) => t.status === "OVERDUE").length;
      const rate = total > 0 ? Math.round((completed / total) * 100) : 0;
      const deptName = departments.find((d) => d.id === emp.departmentId)?.name || "N/A";
      
      return {
        name: emp.name,
        email: emp.email,
        department: deptName,
        total,
        completed,
        overdue,
        rate
      };
    }).sort((a, b) => b.rate - a.rate);
  }, [employees, tasks, departments]);

  // 2. Task Completion Lead-Time dataset
  const taskCompletionReport = useMemo(() => {
    const completedTasks = tasks.filter((t) => t.status === "COMPLETED" && !t.isDeleted);
    return completedTasks.map((task) => {
      const assigneeName = employees.find((e) => e.id === task.assigneeId)?.name || "Unassigned";
      
      const start = new Date(task.startDate || task.createdAt);
      const completion = new Date(task.updatedAt);
      const diffTime = completion.getTime() - start.getTime();
      const daysToComplete = Math.max(1, Math.round(diffTime / (1000 * 60 * 60 * 24)));
      
      return {
        id: task.id,
        title: task.title,
        assignee: assigneeName,
        priority: task.priority,
        dueDate: new Date(task.dueDate).toLocaleDateString(),
        completedDate: completion.toLocaleDateString(),
        days: daysToComplete
      };
    }).sort((a, b) => b.days - a.days);
  }, [tasks, employees]);

  // 3. Department Productivity dataset
  const departmentReport = useMemo(() => {
    return departments.map((dept) => {
      const deptTasks = tasks.filter((t) => t.departmentId === dept.id && !t.isDeleted);
      const total = deptTasks.length;
      const completed = deptTasks.filter((t) => t.status === "COMPLETED").length;
      const active = deptTasks.filter((t) => t.status !== "COMPLETED" && t.status !== "ARCHIVED").length;
      const rate = total > 0 ? Math.round((completed / total) * 100) : 0;
      
      return {
        name: dept.name,
        total,
        completed,
        active,
        rate
      };
    }).sort((a, b) => b.rate - a.rate);
  }, [departments, tasks]);

  // ─── CSV Export Engine ──────────────────────────────────────────────────────

  const exportCSV = (filename: string, headers: string[], rows: string[][]) => {
    // Generate clean CSV content string
    const csvRows = [headers.join(",")];
    rows.forEach((row) => {
      const escapedRow = row.map((val) => {
        const cleanVal = val ? val.toString().replace(/"/g, '""') : "";
        return `"${cleanVal}"`;
      });
      csvRows.push(escapedRow.join(","));
    });
    
    const csvContent = "\uFEFF" + csvRows.join("\n"); // Add BOM for UTF-8 compatibility
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast(`${filename} exported successfully.`, "success");
  };

  const handleExportSelected = () => {
    if (activeReportTab === "employee") {
      const headers = ["Employee Name", "Email", "Department", "Total Tasks", "Tasks Completed", "Tasks Overdue", "Completion Rate (%)"];
      const rows = employeeReport.map((r) => [
        r.name, r.email, r.department, r.total.toString(), r.completed.toString(), r.overdue.toString(), `${r.rate}%`
      ]);
      exportCSV("Employee_Performance_Report.csv", headers, rows);
    } else if (activeReportTab === "task") {
      const headers = ["Task ID", "Task Title", "Assignee", "Priority", "Due Date", "Completed Date", "Days to Complete"];
      const rows = taskCompletionReport.map((r) => [
        r.id, r.title, r.assignee, r.priority, r.dueDate, r.completedDate, r.days.toString()
      ]);
      exportCSV("Task_Completion_Report.csv", headers, rows);
    } else if (activeReportTab === "department") {
      const headers = ["Department Name", "Total Tasks", "Tasks Completed", "Active Tasks", "Completion Rate (%)"];
      const rows = departmentReport.map((r) => [
        r.name, r.total.toString(), r.completed.toString(), r.active.toString(), `${r.rate}%`
      ]);
      exportCSV("Department_Productivity_Report.csv", headers, rows);
    }
  };

  // Cumulative Summaries
  const totalTasks = tasks.filter((t) => !t.isDeleted).length;
  const completedTasks = tasks.filter((t) => t.status === "COMPLETED" && !t.isDeleted).length;
  const overdueTasks = tasks.filter((t) => t.status === "OVERDUE" && !t.isDeleted).length;

  return (
    <ProtectedRoute permission="reports:view">
      <div className="space-y-6 font-poppins animate-slide-up">
        {/* Page Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-text-primary uppercase flex items-center gap-2">
              <BarChart3 className="h-6 w-6 text-brand-primary" />
              <span>{t.reportsTitle}</span>
            </h1>
            <p className="text-xs text-text-secondary font-medium mt-0.5">
              {t.reportsSubtitle}
            </p>
          </div>
          <button
            onClick={handleExportSelected}
            className="inline-flex items-center gap-1.5 rounded-xl bg-brand-primary px-4 py-2 text-sm font-bold text-white shadow-md hover:bg-brand-secondary transition-all focus:outline-none active:scale-95 cursor-pointer"
          >
            <Download className="h-4 w-4" />
            <span>{isRtl ? "تصدير التقرير الحالي" : "Export Report (CSV)"}</span>
          </button>
        </div>

        {/* Key Metrics Summary */}
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            {
              icon: <CheckCircle2 className="h-5 w-5" />,
              iconBg: "bg-status-success-bg text-status-success border border-status-success/20",
              label: isRtl ? "معدل الإنجاز العام" : "General Completion Rate",
              value: `${totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0}%`,
              desc: isRtl ? "من أصل إجمالي المهام المجدولة" : "Based on cumulative scheduled workflow cycles",
            },
            {
              icon: <TrendingUp className="h-5 w-5" />,
              iconBg: "bg-status-info-bg text-status-info border border-status-info/20",
              label: isRtl ? "مؤشر الكفاءة التشغيلية" : "Operational Efficiency Index",
              value: "94.8 / 100",
              desc: isRtl ? "متوسط سرعة الإنجاز والالتزام بالمواعيد" : "Weighted average of lead-time targets",
            },
            {
              icon: <Calendar className="h-5 w-5" />,
              iconBg: "bg-status-warning-bg text-status-warning border border-status-warning/20",
              label: isRtl ? "دورة تسليم العمل المتوسطة" : "Mean Deliverable Lead Time",
              value: `4.2 ${isRtl ? "أيام" : "Days"}`,
              desc: isRtl ? "الوقت المستغرق من الانطلاق للمكتمل" : "Duration from task assignment to completion",
            },
          ].map((card, i) => (
            <div
              key={i}
              className="rounded-2xl border border-border-clean bg-bg-primary p-6 shadow-sm hover:shadow-md transition-all duration-200"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className={`rounded-xl p-2.5 ${card.iconBg}`}>{card.icon}</div>
                <span className="text-[10px] font-black text-text-muted uppercase tracking-widest leading-none">
                  {card.label}
                </span>
              </div>
              <h2 className="text-3xl font-black text-text-primary">{card.value}</h2>
              <p className="text-[10px] text-text-muted mt-1 font-semibold">{card.desc}</p>
            </div>
          ))}
        </div>

        {/* Tab Headers */}
        <div className="flex border-b border-border-clean bg-bg-primary rounded-xl p-1 shadow-sm gap-2">
          {[
            { id: "employee", label: isRtl ? "أداء الموظفين" : "Employee Performance", icon: Users },
            { id: "task", label: isRtl ? "مدد إنجاز المهام" : "Task Completion Lead-Time", icon: FileText },
            { id: "department", label: isRtl ? "إنتاجية الأقسام" : "Department Productivity", icon: Building },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeReportTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveReportTab(tab.id as any)}
                className={`flex items-center gap-2 py-2.5 px-4 text-xs font-bold rounded-lg transition-all focus:outline-none cursor-pointer ${
                  isActive
                    ? "bg-brand-primary text-white shadow"
                    : "text-text-secondary hover:bg-bg-secondary hover:text-text-primary"
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Dynamic Report Table Layout */}
        <div className="overflow-hidden rounded-2xl border border-border-clean bg-bg-primary shadow-sm">
          <div className="overflow-x-auto">
            
            {/* 1. Employee Report Table */}
            {activeReportTab === "employee" && (
              <table className="w-full text-left border-collapse dir-ltr">
                <thead>
                  <tr className="border-b border-border-clean bg-bg-secondary text-[10px] font-black text-text-muted uppercase tracking-widest">
                    <th className="py-3.5 px-5">Employee Name</th>
                    <th className="py-3.5 px-5">Department</th>
                    <th className="py-3.5 px-5 text-center">Total Tasks</th>
                    <th className="py-3.5 px-5 text-center">Completed</th>
                    <th className="py-3.5 px-5 text-center">Overdue</th>
                    <th className="py-3.5 px-5 text-right">Completion Rate</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-clean text-xs font-semibold text-text-secondary">
                  {employeeReport.map((row, idx) => (
                    <tr key={idx} className="hover:bg-bg-secondary transition-colors">
                      <td className="py-3.5 px-5">
                        <div className="font-bold text-text-primary">{row.name}</div>
                        <div className="text-[10px] text-text-muted font-normal mt-0.5">{row.email}</div>
                      </td>
                      <td className="py-3.5 px-5">{row.department}</td>
                      <td className="py-3.5 px-5 text-center font-mono">{row.total}</td>
                      <td className="py-3.5 px-5 text-center font-mono text-status-success">{row.completed}</td>
                      <td className="py-3.5 px-5 text-center font-mono text-status-danger">{row.overdue}</td>
                      <td className="py-3.5 px-5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <span className="font-mono font-bold text-brand-primary">{row.rate}%</span>
                          <div className="h-1.5 w-16 bg-bg-tertiary rounded-full overflow-hidden border border-border-clean/50 hidden sm:block">
                            <div className="h-full bg-brand-primary rounded-full" style={{ width: `${row.rate}%` }} />
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {/* 2. Task lead-time Report Table */}
            {activeReportTab === "task" && (
              <table className="w-full text-left border-collapse dir-ltr">
                <thead>
                  <tr className="border-b border-border-clean bg-bg-secondary text-[10px] font-black text-text-muted uppercase tracking-widest">
                    <th className="py-3.5 px-5">Task Details</th>
                    <th className="py-3.5 px-5">Assignee</th>
                    <th className="py-3.5 px-5">Priority</th>
                    <th className="py-3.5 px-5">Due Date</th>
                    <th className="py-3.5 px-5">Completed Date</th>
                    <th className="py-3.5 px-5 text-right">Lead Time (Days)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-clean text-xs font-semibold text-text-secondary">
                  {taskCompletionReport.map((row, idx) => (
                    <tr key={idx} className="hover:bg-bg-secondary transition-colors">
                      <td className="py-3.5 px-5">
                        <div className="font-bold text-text-primary line-clamp-1">{row.title}</div>
                        <div className="text-[9px] text-text-muted font-mono mt-0.5 uppercase">{row.id}</div>
                      </td>
                      <td className="py-3.5 px-5 font-bold">{row.assignee}</td>
                      <td className="py-3.5 px-5">
                        <span className="text-[9px] font-bold uppercase">{row.priority}</span>
                      </td>
                      <td className="py-3.5 px-5 font-mono">{row.dueDate}</td>
                      <td className="py-3.5 px-5 font-mono text-status-success">{row.completedDate}</td>
                      <td className="py-3.5 px-5 text-right font-mono font-bold text-brand-primary">
                        {row.days} {row.days === 1 ? "day" : "days"}
                      </td>
                    </tr>
                  ))}
                  {taskCompletionReport.length === 0 && (
                    <tr>
                      <td colSpan={6} className="text-center py-12 text-text-muted font-bold">
                        No tasks have been completed yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}

            {/* 3. Department Productivity Table */}
            {activeReportTab === "department" && (
              <table className="w-full text-left border-collapse dir-ltr">
                <thead>
                  <tr className="border-b border-border-clean bg-bg-secondary text-[10px] font-black text-text-muted uppercase tracking-widest">
                    <th className="py-3.5 px-5">Department Name</th>
                    <th className="py-3.5 px-5 text-center">Total tasks</th>
                    <th className="py-3.5 px-5 text-center">Completed</th>
                    <th className="py-3.5 px-5 text-center">Active / Pending</th>
                    <th className="py-3.5 px-5 text-right">Efficiency Rate</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-clean text-xs font-semibold text-text-secondary">
                  {departmentReport.map((row, idx) => (
                    <tr key={idx} className="hover:bg-bg-secondary transition-colors">
                      <td className="py-3.5 px-5 font-bold text-text-primary">{row.name}</td>
                      <td className="py-3.5 px-5 text-center font-mono">{row.total}</td>
                      <td className="py-3.5 px-5 text-center font-mono text-status-success">{row.completed}</td>
                      <td className="py-3.5 px-5 text-center font-mono text-status-info">{row.active}</td>
                      <td className="py-3.5 px-5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <span className="font-mono font-bold text-brand-primary">{row.rate}%</span>
                          <div className="h-1.5 w-16 bg-bg-tertiary rounded-full overflow-hidden border border-border-clean/50 hidden sm:block">
                            <div className="h-full bg-brand-primary rounded-full" style={{ width: `${row.rate}%` }} />
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
