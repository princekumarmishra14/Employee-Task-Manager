"use client";

import React from "react";
import { X, Briefcase, Award, Activity, Clock, AwardIcon, CheckSquare } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import { Employee } from "@/types/employee.types";
import { Department } from "@/data/seedData";
import { Task } from "@/types/task.types";

interface EmployeeTimelineDrawerProps {
  employee: Employee | null;
  onClose: () => void;
  departments: Department[];
  tasks: Task[];
}

export default function EmployeeTimelineDrawer({
  employee,
  onClose,
  departments,
  tasks,
}: EmployeeTimelineDrawerProps) {
  const { t, isRtl } = useTranslation();

  if (!employee) return null;

  // Get active tasks assigned to this employee
  const employeeTasks = tasks.filter((task) => task.assigneeId === employee.id && !task.isDeleted);
  const activeTasks = employeeTasks.filter((t) => t.status !== "COMPLETED" && t.status !== "ARCHIVED");
  const completedCount = employeeTasks.filter((t) => t.status === "COMPLETED").length;

  // Calculate mock department name
  const deptName = departments.find((d) => d.id === employee.departmentId)?.name || "-";

  // Mock performance score calculation
  const performanceScore = employee.isActive ? 92 : 0;

  // Render a mock structured timeline based on hire date for premium visual realism
  const hireDate = new Date(employee.createdAt);
  const onboardingDate = new Date(hireDate.getTime() + 2 * 24 * 60 * 60 * 1000); // +2 days
  const promotionDate = new Date(hireDate.getTime() + 30 * 24 * 60 * 60 * 1000); // +30 days

  const timelineMilestones = [
    {
      title: isRtl ? "تاريخ التعيين والانضمام" : "Hired & Account Initiated",
      description: isRtl ? "تم تسجيل الموظف في النظام بنجاح" : "Successfully onboarded into HR records directory.",
      date: hireDate.toLocaleDateString(),
      icon: <Briefcase className="h-3 w-3 text-status-success" />,
      color: "bg-status-success-bg border-status-success/20",
    },
    {
      title: isRtl ? "إكمال التدريب الأساسي" : "Onboarding Milestones Met",
      description: isRtl ? "أكمل الموظف التدريب التعريفي للمؤسسة" : "Completed workspace system credential configurations.",
      date: onboardingDate.toLocaleDateString(),
      icon: <Award className="h-3 w-3 text-brand-primary" />,
      color: "bg-brand-muted border-brand-primary/20",
    },
    {
      title: isRtl ? "مراجعة الأداء الربع سنوي" : "Quarterly Performance Alignment",
      description: isRtl ? "حقق درجة أداء ممتازة في الدورة الأخيرة" : "Scored exemplary feedback from team lead evaluation.",
      date: promotionDate.toLocaleDateString(),
      icon: <AwardIcon className="h-3 w-3 text-status-warning" />,
      color: "bg-status-warning-bg border-status-warning/20",
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/60 backdrop-blur-sm font-poppins select-none">
      {/* Click away backdrop */}
      <div className="absolute inset-0" onClick={onClose} />

      <div
        className={`relative w-full max-w-md bg-bg-primary p-6 shadow-2xl h-full overflow-y-auto flex flex-col border-l border-border-clean transition-transform ${
          isRtl ? "animate-slide-in-left" : "animate-slide-in-right"
        }`}
      >
        {/* Close Header */}
        <div className="flex items-center justify-between border-b border-border-clean pb-4 mb-6">
          <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider">
            {t.empTimeline}
          </h3>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-text-secondary hover:bg-bg-tertiary transition-all focus:outline-none"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Profile Card */}
        <div className="flex flex-col items-center text-center pb-6 border-b border-border-clean/50 mb-6">
          <img
            src={employee.avatarUrl}
            alt={employee.fullName}
            className="h-20 w-20 rounded-full object-cover border-2 border-brand-primary shadow-md mb-3"
          />
          <h2 className="text-base font-bold text-text-primary">
            {employee.fullName}
          </h2>
          <p className="text-xs text-text-secondary font-medium mt-0.5">
            {employee.title}
          </p>
          <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-brand-muted px-3 py-1 text-[10px] text-brand-primary font-bold uppercase">
            <Briefcase className="h-3.5 w-3.5" />
            <span>{deptName}</span>
          </div>
        </div>

        {/* Key Metrics / Timeline Body */}
        <div className="flex-1 space-y-6">
          {/* Key Metrics */}
          <div>
            <h4 className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Award className="h-4 w-4 text-brand-primary" />
              <span>{isRtl ? "مؤشرات الأداء" : "Key Metrics"}</span>
            </h4>
            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="rounded-xl border border-border-clean p-3 bg-bg-secondary">
                <span className="text-[9px] text-text-muted font-bold block uppercase tracking-wider">
                  {t.empPerformance}
                </span>
                <span className="text-lg font-black text-brand-primary mt-1 block">
                  {performanceScore ? `${performanceScore} / 100` : "-"}
                </span>
              </div>
              <div className="rounded-xl border border-border-clean p-3 bg-bg-secondary">
                <span className="text-[9px] text-text-muted font-bold block uppercase tracking-wider">
                  {isRtl ? "المهام المكتملة" : "Completed Tasks"}
                </span>
                <span className="text-lg font-black text-status-success mt-1 block">
                  {completedCount}
                </span>
              </div>
            </div>
          </div>

          {/* Active Workload */}
          <div>
            <h4 className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Activity className="h-4 w-4 text-brand-primary" />
              <span>{isRtl ? "المهام النشطة المعينة" : "Active Workload"}</span>
            </h4>

            <div className="space-y-2 max-h-[200px] overflow-y-auto pr-1">
              {activeTasks.map((task) => (
                <div
                  key={task.id}
                  className="rounded-xl border border-border-clean p-3 bg-bg-secondary hover:border-border-hover transition-all"
                >
                  <div className="flex items-center justify-between gap-2">
                    <h5 className="text-xs font-bold text-text-primary truncate">
                      {task.title}
                    </h5>
                    <span className={`text-[8px] font-extrabold uppercase px-1.5 py-0.5 rounded ${
                      task.priority === "HIGH" ? "bg-status-danger-bg text-status-danger" : "bg-status-info-bg text-status-info"
                    }`}>
                      {task.priority}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[9px] text-text-secondary mt-2 font-semibold">
                    <span className="uppercase text-brand-primary">{task.status}</span>
                    <span>{new Date(task.dueDate).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
              {activeTasks.length === 0 && (
                <p className="text-xs text-text-muted italic text-center py-4">
                  {isRtl ? "لا توجد مهام نشطة حالياً." : "No active tasks currently assigned."}
                </p>
              )}
            </div>
          </div>

          {/* Structured Timeline History */}
          <div>
            <h4 className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-4 flex items-center gap-1.5">
              <Clock className="h-4 w-4 text-brand-primary" />
              <span>{isRtl ? "سجل التطور الوظيفي" : "Career Timeline Log"}</span>
            </h4>
            
            <div className="space-y-4">
              {timelineMilestones.map((milestone, idx) => (
                <div key={idx} className="relative pl-6 pb-2 border-l border-border-clean last:pb-0 last:border-0 ml-2.5">
                  {/* Timeline icon badge */}
                  <div className={`absolute -left-3.5 top-0 flex h-7 w-7 items-center justify-center rounded-full border shadow-sm ${milestone.color}`}>
                    {milestone.icon}
                  </div>
                  <div className="text-xs">
                    <h5 className="font-bold text-text-primary leading-tight">
                      {milestone.title}
                    </h5>
                    <p className="text-[11px] text-text-secondary mt-0.5 font-medium leading-relaxed">
                      {milestone.description}
                    </p>
                  </div>
                  <span className="text-[9px] text-text-muted mt-1 block font-bold">
                    {milestone.date}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
