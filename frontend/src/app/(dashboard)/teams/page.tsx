"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useDBStore } from "@/store/dbStore";
import { useTranslation } from "@/hooks/useTranslation";
import { UsersRound, Plus, Users, Building, X, Pencil, Trash2, Shield } from "lucide-react";
import ProtectedRoute from "@/components/rbac/ProtectedRoute";
import { hasPermission } from "@/config/rbac";
import { useToast } from "@/components/common/Toast";
import { EmployeeService } from "@/services/employee.service";
import { apiGet, apiPost, apiPatch, apiDelete } from "@/lib/axios";

const TEAM_COLORS = [
  "from-blue-500 to-indigo-500",
  "from-violet-500 to-purple-500",
  "from-emerald-500 to-cyan-500",
  "from-rose-500 to-red-500",
  "from-amber-500 to-yellow-500",
  "from-teal-500 to-green-500",
];

export default function TeamsPage() {
  const { t, isRtl } = useTranslation();
  const { departments, activeRole } = useDBStore();
  const { toast } = useToast();

  // API-sourced teams
  const [teams, setTeams] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchTeams = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await apiGet<any>("/teams");
      setTeams(Array.isArray(res) ? res : res.data ?? []);
    } catch {
      // silent fail
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTeams();
  }, [fetchTeams]);

  // Dynamic state for employees list retrieved from PostgreSQL
  const [employeesList, setEmployeesList] = useState<any[]>([]);

  // Form Modal States
  const [isOpen, setIsOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingTeamId, setEditingTeamId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [deptId, setDeptId] = useState("");
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);
  const [error, setError] = useState("");

  // View Modal States
  const [selectedTeam, setSelectedTeam] = useState<any | null>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);

  // Load employees from PostgreSQL database
  const loadEmployees = useCallback(async () => {
    const res = await EmployeeService.getEmployees();
    if (res.success && res.data) {
      setEmployeesList(res.data);
    }
  }, []);

  useEffect(() => {
    loadEmployees();
  }, [loadEmployees]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError(t.required);
      return;
    }
    if (!deptId) {
      setError(isRtl ? "يرجى تحديد قسم" : "Please select a department");
      return;
    }

    try {
      let teamId = editingTeamId;

      if (isEditMode && editingTeamId) {
        await apiPatch(`/teams/${editingTeamId}`, {
          name: name.trim(),
          departmentId: deptId,
        });
        toast(isRtl ? `تم تحديث الفريق "${name.trim()}" بنجاح!` : `Team "${name.trim()}" updated successfully!`, "success");
      } else {
        const res: any = await apiPost("/teams", { name: name.trim(), departmentId: deptId });
        const newTeam = res.data ?? res;
        if (newTeam) teamId = newTeam.id;
        toast(isRtl ? `تم إنشاء الفريق "${name.trim()}" بنجاح!` : `Team "${name.trim()}" created successfully!`, "success");
      }

      await fetchTeams();

      // Synchronize employee assignments in PostgreSQL database
      if (teamId) {
        const currentMembers = employeesList.filter((emp) => emp.teamId === teamId);
        const currentMemberIds = currentMembers.map((emp) => emp.id);

        const toAdd = selectedMemberIds.filter((id) => !currentMemberIds.includes(id));
        const toRemove = currentMemberIds.filter((id) => !selectedMemberIds.includes(id));

        await Promise.all([
          ...toAdd.map((id) => EmployeeService.updateEmployee(id, { teamId })),
          ...toRemove.map((id) => EmployeeService.updateEmployee(id, { teamId: null })),
        ]);

        await loadEmployees();
      }

      handleCloseFormModal();
    } catch (err: any) {
      toast(err?.response?.data?.message || err.message || "Failed to save team changes.", "error");
    }
  };

  const handleCloseFormModal = () => {
    setName("");
    setDeptId("");
    setSelectedMemberIds([]);
    setError("");
    setIsOpen(false);
    setIsEditMode(false);
    setEditingTeamId(null);
  };

  const handleEditClick = (team: any) => {
    setName(team.name);
    setDeptId(team.departmentId);
    setEditingTeamId(team.id);
    setSelectedMemberIds(employeesList.filter((emp) => emp.teamId === team.id).map((emp) => emp.id));
    setIsEditMode(true);
    setIsOpen(true);
  };

  const handleDeleteClick = async (id: string, teamName: string) => {
    const confirmMsg = isRtl 
      ? `هل أنت متأكد من حذف الفريق "${teamName}"؟`
      : `Are you sure you want to delete team "${teamName}"?`;
    if (confirm(confirmMsg)) {
      try {
        await apiDelete(`/teams/${id}`);
        await fetchTeams();
        toast(isRtl ? `تم حذف الفريق بنجاح!` : `Team deleted successfully!`, "success");
      } catch (err: any) {
        toast(err?.response?.data?.message || err.message || "Failed to delete team.", "error");
      }
    }
  };

  const handleViewTeam = (team: any) => {
    setSelectedTeam(team);
    setIsViewOpen(true);
  };

  const getTeamStats = (teamId: string) => {
    const members = employeesList.filter((e) => e.teamId === teamId && e.isActive);
    return { count: members.length, avatars: members.slice(0, 3).map((m) => m.avatarUrl), members };
  };

  return (
    <ProtectedRoute permission="teams:view">
      <div className="space-y-6 font-poppins">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-text-primary uppercase">
              {t.teamTitle}
            </h1>
            <p className="text-xs text-text-secondary font-medium mt-0.5">
              {isRtl
                ? "الفرق التشغيلية داخل أقسام المؤسسة."
                : "Operational functional teams inside business departments."}
            </p>
          </div>
          {hasPermission(activeRole, "teams:create") && (
            <button
              onClick={() => setIsOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-xl bg-brand-primary px-4 py-2 text-sm font-bold text-white shadow-md hover:bg-brand-secondary transition-all active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
            >
              <Plus className="h-4 w-4" />
              <span>{t.teamAddButton}</span>
            </button>
          )}
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {teams.map((team, idx) => {
            const { count, avatars } = getTeamStats(team.id);
            const dept = departments.find((d) => d.id === team.departmentId);
            const gradient = TEAM_COLORS[idx % TEAM_COLORS.length];
            return (
              <div
                key={team.id}
                onClick={() => handleViewTeam(team)}
                className="group relative overflow-hidden rounded-2xl border border-border-clean bg-bg-primary shadow-sm hover:-translate-y-1 hover:shadow-md hover:border-brand-primary/30 transition-all duration-300 cursor-pointer flex flex-col justify-between"
              >
                {/* Gradient accent strip */}
                <div className={`h-1.5 w-full bg-gradient-to-r ${gradient}`} />

                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className={`rounded-xl bg-gradient-to-br ${gradient} p-3 text-white shadow-sm`}>
                        <UsersRound className="h-5 w-5" />
                      </div>
                      <div className="flex items-center gap-1.5">
                        {dept && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-bg-secondary border border-border-clean px-2.5 py-1 text-[10px] font-black text-text-muted uppercase tracking-wide">
                            <Building className="h-3 w-3" />
                            {dept.name}
                          </span>
                        )}
                        <div className="flex items-center gap-0.5">
                          {hasPermission(activeRole, "teams:create") && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditClick(team);
                              }}
                              className="p-1 rounded-lg text-text-muted hover:bg-bg-tertiary hover:text-brand-primary transition-all"
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </button>
                          )}
                          {hasPermission(activeRole, "teams:create") && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteClick(team.id, team.name);
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
                      {team.name}
                    </h3>
                  </div>

                  <div className="mt-4 flex items-center justify-between border-t border-border-clean pt-4">
                    {/* Member avatars stack */}
                    <div className="flex items-center">
                      <div className="flex -space-x-2 animate-in fade-in duration-200">
                        {avatars.map((url, i) => (
                          <img
                            key={i}
                            src={url || ""}
                            alt="Team member"
                            className="h-7 w-7 rounded-full border-2 border-bg-primary object-cover bg-bg-secondary"
                          />
                        ))}
                        {count > 3 && (
                          <div className="h-7 w-7 rounded-full border-2 border-bg-primary bg-bg-tertiary flex items-center justify-center">
                            <span className="text-[9px] font-black text-text-secondary">
                              +{count - 3}
                            </span>
                          </div>
                        )}
                      </div>
                      <span className="ml-2 text-xs font-bold text-text-secondary flex items-center gap-1">
                        <Users className="h-3.5 w-3.5 text-brand-primary" />
                        {count} {isRtl ? "عضو" : "Members"}
                      </span>
                    </div>

                    <span className="text-[9px] text-text-muted font-semibold">
                      {new Date(team.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Create / Edit Team Modal */}
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <div className="w-full max-w-sm rounded-2xl bg-bg-primary p-6 shadow-2xl border border-border-clean animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-border-clean pb-3 mb-5">
                <h3 className="text-base font-black text-text-primary">
                  {isEditMode ? (isRtl ? "تعديل فريق" : "Edit Team") : t.teamAddButton}
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
                    {isRtl ? "اسم الفريق" : "Team Name"} *
                  </label>
                  <input
                    type="text"
                    value={name}
                    autoFocus
                    onChange={(e) => { setName(e.target.value); setError(""); }}
                    placeholder={isRtl ? "مثال: فريق DevOps" : "e.g. Platform DevOps"}
                    className="w-full rounded-xl border border-border-clean bg-bg-secondary py-2.5 px-3 text-sm text-text-primary outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-text-primary mb-1">
                    {t.empDepartment} *
                  </label>
                  <select
                    value={deptId}
                    onChange={(e) => { setDeptId(e.target.value); setError(""); }}
                    className="w-full rounded-xl border border-border-clean bg-bg-secondary py-2.5 px-3 text-sm text-text-primary outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 transition-all"
                  >
                    <option value="">{isRtl ? "اختر القسم..." : "Select department..."}</option>
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                  {error && (
                    <span className="text-xs text-status-danger mt-1 block font-semibold">{error}</span>
                  )}
                </div>

                {/* Team Members List Selection */}
                <div className="space-y-2">
                  <label className="block text-sm font-bold text-text-primary">
                    {isRtl ? "تعديل أعضاء الفريق" : "Assign Team Members"}
                  </label>
                  <div className="max-h-[160px] overflow-y-auto border border-border-clean bg-bg-secondary p-3 rounded-xl space-y-2">
                    {employeesList
                      .filter((emp) => emp.isActive)
                      .map((emp) => {
                        const isChecked = selectedMemberIds.includes(emp.id);
                        return (
                          <label key={emp.id} className="flex items-center gap-2 text-xs font-bold text-text-primary cursor-pointer select-none">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedMemberIds((prev) => [...prev, emp.id]);
                                } else {
                                  setSelectedMemberIds((prev) => prev.filter((id) => id !== emp.id));
                                }
                              }}
                              className="rounded text-brand-primary focus:ring-brand-primary border-border-clean h-4 w-4"
                            />
                            <span>{emp.name} ({emp.title})</span>
                          </label>
                        );
                      })}
                  </div>
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

        {/* View Team Details Modal */}
        {isViewOpen && selectedTeam && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-2xl bg-bg-primary p-6 shadow-2xl border border-border-clean animate-in fade-in zoom-in-95 duration-200 max-h-[85vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-border-clean pb-3 mb-5">
                <div className="flex items-center gap-2">
                  <UsersRound className="h-5 w-5 text-brand-primary animate-pulse" />
                  <h3 className="text-base font-black text-text-primary uppercase">{selectedTeam.name}</h3>
                </div>
                <button
                  onClick={() => setIsViewOpen(false)}
                  className="rounded-lg p-1 text-text-muted hover:bg-bg-tertiary hover:text-text-primary transition-all focus:outline-none"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-4">
                {/* Meta details */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-bg-secondary p-3 rounded-xl border border-border-clean flex items-center gap-2">
                    <Building className="h-4 w-4 text-brand-primary" />
                    <div>
                      <h5 className="text-[10px] font-black text-text-muted uppercase tracking-wider">{isRtl ? "القسم" : "Department"}</h5>
                      <p className="text-xs font-black text-text-primary mt-0.5">
                        {departments.find((d) => d.id === selectedTeam.departmentId)?.name || (isRtl ? "عام" : "General")}
                      </p>
                    </div>
                  </div>
                  <div className="bg-bg-secondary p-3 rounded-xl border border-border-clean flex items-center gap-2">
                    <Shield className="h-4 w-4 text-brand-primary" />
                    <div>
                      <h5 className="text-[10px] font-black text-text-muted uppercase tracking-wider">{isRtl ? "تاريخ الإنشاء" : "Created At"}</h5>
                      <p className="text-xs font-black text-text-primary mt-0.5">
                        {new Date(selectedTeam.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Team Members List */}
                <div>
                  <h4 className="text-xs font-black text-text-muted uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                    <Users className="h-4 w-4 text-brand-primary" />
                    <span>{isRtl ? "أعضاء الفريق" : "Team Members"} ({getTeamStats(selectedTeam.id).count})</span>
                  </h4>
                  <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                    {getTeamStats(selectedTeam.id).members.length === 0 ? (
                      <p className="text-xs text-text-muted text-center py-4 bg-bg-secondary/40 rounded-xl border border-dashed border-border-clean">
                        {isRtl ? "لا يوجد أعضاء في هذا الفريق بعد." : "No members in this team yet."}
                      </p>
                    ) : (
                      getTeamStats(selectedTeam.id).members.map((emp) => (
                        <div key={emp.id} className="flex justify-between items-center bg-bg-secondary/60 p-2.5 rounded-xl border border-border-clean hover:border-brand-primary/25 transition-all text-xs">
                          <div className="flex items-center gap-2 min-w-0">
                            <div className="h-7 w-7 rounded-lg overflow-hidden border border-border-clean shrink-0">
                              {emp.avatarUrl ? (
                                <img src={emp.avatarUrl} alt={emp.name} className="h-full w-full object-cover" />
                              ) : (
                                <div className="h-full w-full bg-brand-primary/10 flex items-center justify-center text-[10px] font-bold text-brand-primary">
                                  {(emp.name || "").substring(0, 2).toUpperCase()}
                                </div>
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="font-bold text-text-primary truncate">{emp.name}</p>
                              <p className="text-[9px] text-text-muted truncate leading-none mt-0.5">{emp.title}</p>
                            </div>
                          </div>
                          <span className="text-[9px] font-black text-status-success bg-status-success-bg border border-status-success/20 px-2 py-0.5 rounded-lg shrink-0 uppercase">
                            {emp.role}
                          </span>
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
