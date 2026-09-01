"use client";

import React, { useState } from "react";
import { useDBStore } from "@/store/dbStore";
import { useTranslation } from "@/hooks/useTranslation";
import { FolderKanban, Plus, Briefcase, FileCheck, X, Pencil, Trash2, Calendar, UsersRound } from "lucide-react";
import ProtectedRoute from "@/components/rbac/ProtectedRoute";
import { hasPermission } from "@/config/rbac";
import { useToast } from "@/components/common/Toast";
import { apiGet, apiPost, apiPatch, apiDelete } from "@/lib/axios";

const PROJECT_COLORS = [
  "from-teal-500 to-emerald-500",
  "from-indigo-500 to-blue-500",
  "from-orange-500 to-amber-500",
  "from-pink-500 to-rose-500",
  "from-violet-500 to-purple-500",
  "from-cyan-500 to-sky-500",
];

export default function ProjectsPage() {
  const { t, isRtl } = useTranslation();
  const { departments, teams, tasks, activeRole } = useDBStore();
  const { toast } = useToast();

  // API-sourced projects
  const [projects, setProjects] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProjects = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await apiGet<any>("/projects");
      setProjects(Array.isArray(res) ? res : res.data ?? []);
    } catch {
      // silent fail
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  // Create / Edit Modal States
  const [isOpen, setIsOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [deptId, setDeptId] = useState("");
  const [teamId, setTeamId] = useState("");
  const [error, setError] = useState("");

  // View Modal States
  const [selectedProject, setSelectedProject] = useState<any | null>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError(t.required);
      return;
    }

    try {
      if (isEditMode && editingProjectId) {
        await apiPatch(`/projects/${editingProjectId}`, {
          name: name.trim(),
          description: desc.trim(),
          departmentId: deptId || null,
          teamId: teamId || null,
        });
        toast(isRtl ? `تم تحديث المشروع "${name.trim()}" بنجاح!` : `Project "${name.trim()}" updated successfully!`, "success");
      } else {
        await apiPost("/projects", {
          name: name.trim(),
          description: desc.trim(),
          departmentId: deptId || null,
          teamId: teamId || null,
        });
        toast(isRtl ? `تم إنشاء المشروع "${name.trim()}" بنجاح!` : `Project "${name.trim()}" created successfully!`, "success");
      }
      await fetchProjects();
      handleCloseFormModal();
    } catch (err: any) {
      toast(err?.response?.data?.message || err.message || "Failed to save project changes.", "error");
    }
  };

  const handleCloseFormModal = () => {
    setName("");
    setDesc("");
    setDeptId("");
    setTeamId("");
    setError("");
    setIsOpen(false);
    setIsEditMode(false);
    setEditingProjectId(null);
  };

  const handleEditClick = (proj: any) => {
    setName(proj.name);
    setDesc(proj.description || "");
    setDeptId(proj.departmentId || "");
    setTeamId(proj.teamId || "");
    setEditingProjectId(proj.id);
    setIsEditMode(true);
    setIsOpen(true);
  };

  const handleDeleteClick = async (id: string, projectName: string) => {
    const confirmMsg = isRtl 
      ? `هل أنت متأكد من حذف المشروع "${projectName}"؟`
      : `Are you sure you want to delete project "${projectName}"?`;
    if (confirm(confirmMsg)) {
      try {
        await apiDelete(`/projects/${id}`);
        await fetchProjects();
        toast(isRtl ? `تم حذف المشروع بنجاح!` : `Project deleted successfully!`, "success");
      } catch (err: any) {
        toast(err?.response?.data?.message || err.message || "Failed to delete project.", "error");
      }
    }
  };

  const handleViewProject = (proj: any) => {
    setSelectedProject(proj);
    setIsViewOpen(true);
  };

  const getProjectStats = (projId: string) => {
    const projectTasks = tasks.filter((t) => t.projectId === projId && !t.isDeleted);
    const completed = projectTasks.filter((t) => t.status === "COMPLETED").length;
    const rate = projectTasks.length > 0 ? Math.round((completed / projectTasks.length) * 100) : 0;
    return { taskCount: projectTasks.length, rate, projectTasks };
  };

  return (
    <ProtectedRoute permission="projects:view">
      <div className="space-y-6 font-poppins">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-text-primary uppercase">
              {t.projTitle}
            </h1>
            <p className="text-xs text-text-secondary font-medium mt-0.5">
              {isRtl
                ? "عرض وإدارة سجل مشاريع المؤسسة وحالاتها."
                : "Manage active company projects and resource allocation pipelines."}
            </p>
          </div>
          {hasPermission(activeRole, "projects:create") && (
            <button
              onClick={() => setIsOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-xl bg-brand-primary px-4 py-2 text-sm font-bold text-white shadow-md hover:bg-brand-secondary transition-all active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
            >
              <Plus className="h-4 w-4" />
              <span>{t.projAddButton}</span>
            </button>
          )}
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((proj, idx) => {
            const { taskCount, rate } = getProjectStats(proj.id);
            const dept = departments.find((d) => d.id === proj.departmentId);
            const team = teams.find((t) => t.id === proj.teamId);
            const gradient = PROJECT_COLORS[idx % PROJECT_COLORS.length];
            return (
              <div
                key={proj.id}
                onClick={() => handleViewProject(proj)}
                className="group relative overflow-hidden rounded-2xl border border-border-clean bg-bg-primary shadow-sm hover:-translate-y-1 hover:shadow-md hover:border-brand-primary/30 transition-all duration-300 cursor-pointer flex flex-col justify-between"
              >
                {/* Gradient top strip */}
                <div className={`h-1.5 w-full bg-gradient-to-r ${gradient}`} />

                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                      <div className={`rounded-xl bg-gradient-to-br ${gradient} p-3 text-white shadow-sm`}>
                        <FolderKanban className="h-5 w-5" />
                      </div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {dept && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-bg-secondary border border-border-clean px-2.5 py-1 text-[10px] font-black text-text-muted uppercase tracking-wide">
                            <Briefcase className="h-3 w-3" />
                            {dept.name}
                          </span>
                        )}
                        {team && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-bg-secondary border border-border-clean px-2.5 py-1 text-[10px] font-black text-text-muted uppercase tracking-wide">
                            <UsersRound className="h-3 w-3 text-brand-primary" />
                            {team.name}
                          </span>
                        )}
                        <div className="flex items-center gap-0.5">
                          {hasPermission(activeRole, "projects:create") && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditClick(proj);
                              }}
                              className="p-1 rounded-lg text-text-muted hover:bg-bg-tertiary hover:text-brand-primary transition-all"
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </button>
                          )}
                          {hasPermission(activeRole, "projects:create") && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteClick(proj.id, proj.name);
                              }}
                              className="p-1 rounded-lg text-text-muted hover:bg-bg-tertiary hover:text-status-danger transition-all"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    <h3 className="text-base font-black text-text-primary group-hover:text-brand-primary transition-colors duration-200">
                      {proj.name}
                    </h3>
                    <p className="text-xs text-text-secondary mt-1.5 line-clamp-2 font-medium leading-relaxed">
                      {proj.description || (isRtl ? "لا يوجد وصف متوفر لهذا المشروع." : "No project description provided.")}
                    </p>
                  </div>

                  <div className="mt-4">
                    {/* Completion bar */}
                    <div className="mb-1">
                      <div className="flex items-center justify-between text-[9px] font-black text-text-muted mb-1.5 uppercase">
                        <span>{isRtl ? "الإنجاز" : "Completion"}</span>
                        <span className="text-brand-primary">{rate}%</span>
                      </div>
                      <div className="h-1.5 w-full rounded-full bg-bg-tertiary overflow-hidden">
                        <div
                          className={`h-full rounded-full bg-gradient-to-r ${gradient} transition-all duration-700`}
                          style={{ width: `${rate}%` }}
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs text-text-secondary border-t border-border-clean pt-4 mt-4">
                      <span className="flex items-center gap-1.5 font-semibold">
                        <FileCheck className="h-3.5 w-3.5 text-brand-primary" />
                        {taskCount} {isRtl ? "مهمة" : "Tasks"}
                      </span>
                      <span className="text-[9px] text-text-muted font-semibold">
                        {isRtl ? "بدأ:" : "Started:"}{" "}
                        {new Date(proj.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Create / Edit Project Modal */}
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <div className="w-full max-w-sm rounded-2xl bg-bg-primary p-6 shadow-2xl border border-border-clean animate-in fade-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between border-b border-border-clean pb-3 mb-5">
                <h3 className="text-base font-black text-text-primary">
                  {isEditMode ? (isRtl ? "تعديل مشروع" : "Edit Project") : t.projAddButton}
                </h3>
                <button
                  onClick={handleCloseFormModal}
                  className="rounded-lg p-1 text-text-muted hover:bg-bg-tertiary hover:text-text-primary transition-all focus:outline-none"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-text-primary mb-1">
                    {isRtl ? "اسم المشروع" : "Project Name"} *
                  </label>
                  <input
                    type="text"
                    value={name}
                    autoFocus
                    onChange={(e) => { setName(e.target.value); setError(""); }}
                    placeholder={isRtl ? "مثال: تجهيز تدقيق SOC2" : "e.g. SOC2 Auditor Prep"}
                    className="w-full rounded-xl border border-border-clean bg-bg-secondary py-2.5 px-3 text-sm text-text-primary outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 transition-all"
                  />
                  {error && (
                    <span className="text-xs text-status-danger mt-1 block font-semibold">{error}</span>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-bold text-text-primary mb-1">
                    {isRtl ? "الوصف" : "Description"}
                  </label>
                  <textarea
                    rows={2}
                    value={desc}
                    onChange={(e) => setDesc(e.target.value)}
                    placeholder={isRtl ? "وصف المشروع..." : "e.g. Pre-audit details and compliance readiness."}
                    className="w-full rounded-xl border border-border-clean bg-bg-secondary py-2.5 px-3 text-sm text-text-primary outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 transition-all resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-text-primary mb-1">
                    {t.empDepartment}
                  </label>
                  <select
                    value={deptId}
                    onChange={(e) => {
                      setDeptId(e.target.value);
                      setTeamId(""); // Reset team on dept change
                    }}
                    className="w-full rounded-xl border border-border-clean bg-bg-secondary py-2.5 px-3 text-sm text-text-primary outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 transition-all"
                  >
                    <option value="">{isRtl ? "اختياري..." : "None (optional)"}</option>
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-text-primary mb-1">
                    {isRtl ? "الفريق المسؤول" : "Responsible Team"}
                  </label>
                  <select
                    value={teamId}
                    onChange={(e) => setTeamId(e.target.value)}
                    className="w-full rounded-xl border border-border-clean bg-bg-secondary py-2.5 px-3 text-sm text-text-primary outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 transition-all"
                  >
                    <option value="">{isRtl ? "اختياري..." : "None (optional)"}</option>
                    {teams
                      .filter((t) => !deptId || t.departmentId === deptId)
                      .map((t) => (
                        <option key={t.id} value={t.id}>{t.name}</option>
                      ))}
                  </select>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-border-clean">
                  <button
                    type="button"
                    onClick={handleCloseFormModal}
                    className="rounded-xl border border-border-clean px-4 py-2 text-sm font-bold text-text-primary hover:bg-bg-tertiary transition-all focus:outline-none"
                  >
                    {t.cancel}
                  </button>
                  <button
                    type="submit"
                    className="rounded-xl bg-brand-primary px-4 py-2 text-sm font-bold text-white hover:bg-brand-secondary transition-all shadow-sm focus:outline-none"
                  >
                    {t.save}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* View Project Details Modal */}
        {isViewOpen && selectedProject && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <div className="w-full max-w-lg rounded-2xl bg-bg-primary p-6 shadow-2xl border border-border-clean animate-in fade-in zoom-in-95 duration-200 max-h-[85vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-border-clean pb-3 mb-5">
                <div className="flex items-center gap-2">
                  <FolderKanban className="h-5 w-5 text-brand-primary animate-pulse" />
                  <h3 className="text-base font-black text-text-primary uppercase">{selectedProject.name}</h3>
                </div>
                <button
                  onClick={() => setIsViewOpen(false)}
                  className="rounded-lg p-1 text-text-muted hover:bg-bg-tertiary hover:text-text-primary transition-all focus:outline-none"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-4">
                {/* Description */}
                <div>
                  <h4 className="text-xs font-black text-text-muted uppercase tracking-wider mb-1">
                    {isRtl ? "الوصف" : "Description"}
                  </h4>
                  <p className="text-xs text-text-primary leading-relaxed font-medium bg-bg-secondary p-3.5 rounded-xl border border-border-clean">
                    {selectedProject.description || (isRtl ? "لا يوجد وصف متوفر لهذا المشروع." : "No project description provided.")}
                  </p>
                </div>

                {/* Metadata Info */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-bg-secondary p-2.5 rounded-xl border border-border-clean flex flex-col justify-center">
                    <span className="text-[9px] font-black text-text-muted uppercase tracking-wider">{isRtl ? "القسم" : "Department"}</span>
                    <span className="text-xs font-black text-text-primary mt-1 truncate">
                      {departments.find((d) => d.id === selectedProject.departmentId)?.name || (isRtl ? "عام" : "General")}
                    </span>
                  </div>
                  <div className="bg-bg-secondary p-2.5 rounded-xl border border-border-clean flex flex-col justify-center">
                    <span className="text-[9px] font-black text-text-muted uppercase tracking-wider">{isRtl ? "الفريق" : "Team"}</span>
                    <span className="text-xs font-black text-text-primary mt-1 truncate">
                      {teams.find((t) => t.id === selectedProject.teamId)?.name || (isRtl ? "غير محدد" : "None")}
                    </span>
                  </div>
                  <div className="bg-bg-secondary p-2.5 rounded-xl border border-border-clean flex flex-col justify-center">
                    <span className="text-[9px] font-black text-text-muted uppercase tracking-wider">{isRtl ? "تاريخ البدء" : "Start Date"}</span>
                    <span className="text-xs font-black text-text-primary mt-1">
                      {new Date(selectedProject.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {/* Project Tasks */}
                <div>
                  <h4 className="text-xs font-black text-text-muted uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                    <FileCheck className="h-4 w-4 text-brand-primary" />
                    <span>{isRtl ? "مهام المشروع" : "Project Tasks"} ({getProjectStats(selectedProject.id).taskCount})</span>
                  </h4>
                  <div className="space-y-2 max-h-[200px] overflow-y-auto pr-1">
                    {getProjectStats(selectedProject.id).projectTasks.length === 0 ? (
                      <p className="text-xs text-text-muted text-center py-4 bg-bg-secondary/40 rounded-xl border border-dashed border-border-clean">
                        {isRtl ? "لا توجد مهام نشطة في هذا المشروع." : "No active tasks in this project."}
                      </p>
                    ) : (
                      getProjectStats(selectedProject.id).projectTasks.map((t) => (
                        <div key={t.id} className="flex justify-between items-center bg-bg-secondary/60 p-2.5 rounded-xl border border-border-clean hover:border-brand-primary/25 transition-all text-xs">
                          <span className="font-bold text-text-primary truncate max-w-[200px]">{t.title}</span>
                          <div className="flex items-center gap-2 shrink-0">
                            <span className="px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-wider border border-brand-primary/10 bg-brand-muted text-brand-primary">
                              {t.status.replace("_", " ")}
                            </span>
                            <span className="px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-wider border border-status-warning/20 bg-status-warning-bg text-status-warning">
                              {t.priority}
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
