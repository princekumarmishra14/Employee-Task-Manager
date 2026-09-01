"use client";

/**
 * DepartmentsPage — fully self-contained.
 *
 * Departments are fetched directly from the API on every mount.
 * The Zustand store is NOT used as the source of truth for department IDs,
 * so stale seed data can NEVER reach a PATCH/DELETE call.
 *
 * Flow:
 *  mount → GET /departments → populate local `depts` state
 *  create   → POST /departments, then re-fetch
 *  edit     → PATCH /departments/:realId, then re-fetch
 *  delete   → DELETE /departments/:realId, then re-fetch
 *  staff    → GET /employees, set picks, PATCH /employees/:id, re-fetch
 */

import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";
import {
  Building2, Plus, Users, X, TrendingUp,
  Pencil, Trash2, AlertTriangle, Loader2,
  Search, CheckCircle2, UserPlus, ArrowRight,
  Check, RefreshCw,
} from "lucide-react";
import { apiGet, apiPost, apiPatch, apiDelete } from "@/lib/axios";
import { useDBStore } from "@/store/dbStore";
import { useTranslation } from "@/hooks/useTranslation";
import ProtectedRoute from "@/components/rbac/ProtectedRoute";
import { hasPermission } from "@/config/rbac";
import { useToast } from "@/components/common/Toast";
import { EmployeeService } from "@/services/employee.service";

// ─── Gradients ───────────────────────────────────────────────────────────────
const GRAD = [
  "from-violet-500 to-indigo-600",
  "from-emerald-500 to-teal-600",
  "from-amber-500 to-orange-500",
  "from-rose-500 to-pink-600",
  "from-cyan-500 to-sky-600",
  "from-purple-500 to-fuchsia-600",
];

// ─── Avatar ──────────────────────────────────────────────────────────────────
function Av({ src, name, px = 28 }: { src?: string | null; name: string; px?: number }) {
  const initials = (name || "?")
    .trim().split(/\s+/).slice(0, 2).map((w) => w[0]).join("").toUpperCase();
  const style = { width: px, height: px, minWidth: px };
  return src ? (
    <img src={src} alt={name} style={style}
      className="rounded-full object-cover border-2 border-bg-primary shrink-0" />
  ) : (
    <div style={style}
      className="rounded-full border-2 border-bg-primary bg-gradient-to-br from-brand-primary to-brand-secondary flex items-center justify-center text-[10px] font-black text-white shrink-0">
      {initials}
    </div>
  );
}

// ─── 2-step progress indicator ───────────────────────────────────────────────
function WizSteps({ step }: { step: 1 | 2 }) {
  return (
    <div className="flex items-center justify-center gap-2 py-4 border-b border-border-clean">
      {[{ n: 1, label: "Department" }, { n: 2, label: "Add Staff" }].map(({ n, label }, i) => (
        <React.Fragment key={n}>
          {i > 0 && (
            <div className={`h-px w-10 transition-colors duration-300 ${step > 1 ? "bg-brand-primary" : "bg-border-clean"}`} />
          )}
          <div className="flex flex-col items-center gap-0.5 select-none">
            <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-black transition-all duration-300 ${
              step > n  ? "bg-status-success text-white" :
              step === n ? "bg-brand-primary text-white ring-4 ring-brand-primary/20" :
                           "bg-bg-tertiary text-text-muted"
            }`}>
              {step > n ? <Check className="h-4 w-4" /> : n}
            </div>
            <span className={`text-[9px] font-black uppercase tracking-wider ${
              step === n ? "text-brand-primary" : step > n ? "text-status-success" : "text-text-muted"
            }`}>{label}</span>
          </div>
        </React.Fragment>
      ))}
    </div>
  );
}

// ─── Shared modal primitives ──────────────────────────────────────────────────
function Overlay({ children, onClose, busy }: { children: React.ReactNode; onClose: () => void; busy: boolean }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4"
      onClick={(e) => { if (e.target === e.currentTarget && !busy) onClose(); }}>
      {children}
    </div>
  );
}
function Panel({ children, wide = false }: { children: React.ReactNode; wide?: boolean }) {
  return (
    <div className={`w-full ${wide ? "max-w-lg" : "max-w-md"} rounded-2xl bg-bg-primary shadow-2xl border border-border-clean animate-in fade-in zoom-in-95 duration-200 max-h-[92vh] overflow-y-auto`}>
      {children}
    </div>
  );
}
function CloseBtn({ onClick, disabled }: { onClick: () => void; disabled: boolean }) {
  return (
    <button onClick={onClick} disabled={disabled}
      className="p-1 rounded-lg text-text-muted hover:bg-bg-tertiary hover:text-text-primary transition-all disabled:opacity-40">
      <X className="h-5 w-5" />
    </button>
  );
}
function ModalHeader({ title, icon, onClose, busy }: {
  title: string; icon: React.ReactNode; onClose: () => void; busy: boolean;
}) {
  return (
    <div className="flex items-center justify-between px-6 py-4 border-b border-border-clean">
      <h3 className="text-sm font-black text-text-primary uppercase tracking-wide flex items-center gap-2">
        {icon}{title}
      </h3>
      <CloseBtn onClick={onClose} disabled={busy} />
    </div>
  );
}

// ─── Types ────────────────────────────────────────────────────────────────────
type ModalKind = "create" | "edit" | "staff" | "delete" | null;
interface ApiDept { id: string; name: string; description?: string | null; isActive: boolean; }

// ═════════════════════════════════════════════════════════════════════════════
export default function DepartmentsPage() {
  const { t, isRtl }   = useTranslation();
  const { tasks, activeRole } = useDBStore();
  const { toast }      = useToast();

  // ── API-sourced departments (never from Zustand seed data) ─────────────────
  const [depts, setDepts]         = useState<ApiDept[]>([]);
  const [deptsLoading, setDeptsLoading] = useState(true);

  const fetchDepts = useCallback(async () => {
    setDeptsLoading(true);
    try {
      const raw = await apiGet<ApiDept[]>("/departments");
      // apiGet unwraps .data for us — if not, handle both shapes
      const list: ApiDept[] = Array.isArray(raw) ? raw : (raw as any).data ?? [];
      setDepts(list);
    } catch {
      /* silent — UI shows empty grid */
    } finally {
      setDeptsLoading(false);
    }
  }, []);

  useEffect(() => { fetchDepts(); }, [fetchDepts]);

  // ── Live employees ─────────────────────────────────────────────────────────
  const [emps, setEmps]     = useState<any[]>([]);
  const [empBusy, setEmpBusy] = useState(false);

  const fetchEmps = useCallback(async () => {
    setEmpBusy(true);
    const r = await EmployeeService.getEmployees();
    if (r.success && r.data) setEmps(r.data);
    setEmpBusy(false);
  }, []);

  useEffect(() => { fetchEmps(); }, [fetchEmps]);

  // ── Modal state ────────────────────────────────────────────────────────────
  const [modal, setModal]       = useState<ModalKind>(null);
  const [target, setTarget]     = useState<ApiDept | null>(null);
  const [busy, setBusy]         = useState(false);

  // Wizard
  const [wizStep, setWizStep]   = useState<1 | 2>(1);
  const [wizDept, setWizDept]   = useState<ApiDept | null>(null);
  const [deptName, setDeptName] = useState("");
  const [deptDesc, setDeptDesc] = useState("");
  const [deptErr, setDeptErr]   = useState("");

  // Edit
  const [editName, setEditName] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editErr, setEditErr]   = useState("");

  // Staff picker
  const [search, setSearch]     = useState("");
  const [picked, setPicked]     = useState<string[]>([]);
  const [staffBusy, setStaffBusy] = useState(false);

  const nameRef = useRef<HTMLInputElement>(null);

  // ── Close / reset ──────────────────────────────────────────────────────────
  const close = useCallback(() => {
    if (busy || staffBusy) return;
    setModal(null); setTarget(null);
    setWizStep(1); setWizDept(null);
    setDeptName(""); setDeptDesc(""); setDeptErr("");
    setEditName(""); setEditDesc(""); setEditErr("");
    setSearch(""); setPicked([]);
  }, [busy, staffBusy]);

  // ── Stats ──────────────────────────────────────────────────────────────────
  const stats = useCallback((deptId: string) => {
    const members   = emps.filter((e) => e.departmentId === deptId && e.isActive);
    const dt        = tasks.filter((t) => t.departmentId === deptId && !t.isDeleted);
    const completed = dt.filter((t) => t.status === "COMPLETED").length;
    const rate      = dt.length > 0 ? Math.round((completed / dt.length) * 100) : 0;
    return { members, taskCount: dt.length, rate };
  }, [emps, tasks]);

  // ── RBAC ───────────────────────────────────────────────────────────────────
  const canCreate = hasPermission(activeRole, "departments:create");
  const canEdit   = hasPermission(activeRole, "departments:update");
  const canDelete = activeRole === "SUPER_ADMIN" || activeRole === "ADMIN";

  // ── Wizard Step 1: Create department ──────────────────────────────────────
  const openCreate = () => {
    setWizStep(1); setWizDept(null);
    setDeptName(""); setDeptDesc(""); setDeptErr("");
    setPicked([]); setSearch("");
    setModal("create");
    setTimeout(() => nameRef.current?.focus(), 60);
  };

  const handleStep1 = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deptName.trim()) { setDeptErr("Department name is required."); return; }
    setBusy(true); setDeptErr("");
    try {
      const created = await apiPost<ApiDept>("/departments", {
        name: deptName.trim(),
        description: deptDesc.trim() || undefined,
      });
      // apiPost returns the response — handle both shapes
      const newDept: ApiDept = (created as any).data ?? created;
      await fetchDepts();                    // refresh grid with real UUID
      setWizDept(newDept);
      setPicked([]); setSearch("");
      setWizStep(2);
      toast(`Department "${newDept.name}" created!`, "success");
    } catch (err: any) {
      setDeptErr(err?.response?.data?.message || "An error occurred.");
    } finally { setBusy(false); }
  };

  // ── Wizard Step 2: Assign employees ───────────────────────────────────────
  const handleStep2 = async () => {
    if (!wizDept || picked.length === 0) { close(); return; }
    setStaffBusy(true);
    try {
      await Promise.all(picked.map((id) =>
        EmployeeService.updateEmployee(id, { departmentId: wizDept.id })
      ));
      await fetchEmps();
      toast(`${picked.length} employee(s) added to "${wizDept.name}".`, "success");
    } catch {
      toast("Staff assignment partially failed.", "error");
    } finally { setStaffBusy(false); close(); }
  };

  // ── Edit ───────────────────────────────────────────────────────────────────
  const openEdit = (dept: ApiDept) => {
    setTarget(dept);
    setEditName(dept.name);
    setEditDesc(dept.description || "");
    setEditErr("");
    setModal("edit");
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editName.trim() || !target) { setEditErr("Name is required."); return; }
    setBusy(true); setEditErr("");
    try {
      await apiPatch(`/departments/${target.id}`, {
        name: editName.trim(),
        description: editDesc.trim() || undefined,
      });
      await fetchDepts();
      toast(`"${editName.trim()}" updated.`, "success");
      close();
    } catch (err: any) {
      setEditErr(err?.response?.data?.message || "An error occurred.");
    } finally { setBusy(false); }
  };

  // ── Standalone Staff management ────────────────────────────────────────────
  const openStaff = (dept: ApiDept) => {
    setTarget(dept);
    setPicked(emps.filter((e) => e.departmentId === dept.id && e.isActive).map((e) => e.id));
    setSearch("");
    setModal("staff");
  };

  const handleSaveStaff = async () => {
    if (!target) return;
    setStaffBusy(true);
    try {
      const current  = emps.filter((e) => e.departmentId === target.id).map((e) => e.id);
      const toAdd    = picked.filter((id) => !current.includes(id));
      const toRemove = current.filter((id) => !picked.includes(id));
      await Promise.all([
        ...toAdd.map((id)    => EmployeeService.updateEmployee(id, { departmentId: target.id })),
        ...toRemove.map((id) => EmployeeService.updateEmployee(id, { departmentId: "" })),
      ]);
      await fetchEmps();
      toast("Staff updated.", "success");
      close();
    } catch { toast("Update failed.", "error"); }
    finally { setStaffBusy(false); }
  };

  // ── Delete ─────────────────────────────────────────────────────────────────
  const openDelete = (dept: ApiDept) => { setTarget(dept); setModal("delete"); };

  const handleDelete = async () => {
    if (!target) return;
    setBusy(true);
    try {
      await apiDelete(`/departments/${target.id}`);
      await fetchDepts();
      toast(`"${target.name}" deleted.`, "success");
      close();
    } catch (err: any) {
      toast(err?.response?.data?.message || "Delete failed.", "error");
      setBusy(false);
    }
  };

  // ── Filtered employee list ─────────────────────────────────────────────────
  const filteredEmps = useMemo(
    () => emps.filter((e) => e.isActive && (
      search ? `${e.name} ${e.title}`.toLowerCase().includes(search.toLowerCase()) : true
    )),
    [emps, search]
  );

  // ─────────────────────────────────────────────────────────────────────────
  //  RENDER
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <ProtectedRoute permission="departments:view">
      <div className="space-y-8 font-poppins">

        {/* Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-text-primary uppercase flex items-center gap-2">
              <Building2 className="h-6 w-6 text-brand-primary" />
              {t.deptTitle}
            </h1>
            <p className="text-xs text-text-secondary font-medium mt-1">
              Manage departments and assign employees to organisational units.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={fetchDepts} title="Refresh"
              className="p-2 rounded-xl border border-border-clean text-text-muted hover:bg-bg-tertiary hover:text-brand-primary transition-all">
              <RefreshCw className={`h-4 w-4 ${deptsLoading ? "animate-spin" : ""}`} />
            </button>
            {canCreate && (
              <button onClick={openCreate}
                className="inline-flex items-center gap-2 rounded-xl bg-brand-primary px-5 py-2.5 text-sm font-bold text-white shadow-md hover:bg-brand-secondary transition-all active:scale-95">
                <Plus className="h-4 w-4" /> {t.deptAddButton}
              </button>
            )}
          </div>
        </div>

        {/* Loading skeleton */}
        {deptsLoading && depts.length === 0 && (
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-52 rounded-2xl border border-border-clean bg-bg-secondary animate-pulse" />
            ))}
          </div>
        )}

        {/* Cards */}
        {!deptsLoading && depts.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Building2 className="h-12 w-12 text-text-muted mb-3 opacity-40" />
            <p className="text-sm font-bold text-text-muted">No departments found.</p>
            {canCreate && (
              <button onClick={openCreate}
                className="mt-4 inline-flex items-center gap-2 rounded-xl bg-brand-primary px-4 py-2 text-sm font-bold text-white hover:bg-brand-secondary transition-all">
                <Plus className="h-4 w-4" /> Create your first department
              </button>
            )}
          </div>
        )}

        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {depts.map((dept, idx) => {
            const { members, taskCount, rate } = stats(dept.id);
            const g       = GRAD[idx % GRAD.length];
            const preview = members.slice(0, 4);
            const over    = members.length - preview.length;

            return (
              <div key={dept.id}
                className="group relative flex flex-col rounded-2xl border border-border-clean bg-bg-primary shadow-sm hover:-translate-y-1 hover:shadow-lg hover:border-brand-primary/20 transition-all duration-300 overflow-hidden">

                {/* Accent bar */}
                <div className={`h-1 w-full bg-gradient-to-r ${g}`} />

                <div className="flex flex-col flex-1 p-5 gap-4">

                  {/* Icon + actions */}
                  <div className="flex items-start justify-between">
                    <div className={`rounded-2xl bg-gradient-to-br ${g} p-3 text-white shadow-md`}>
                      <Building2 className="h-5 w-5" />
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      {canEdit && (
                        <button onClick={() => openEdit(dept)}
                          title="Edit"
                          className="p-1.5 rounded-lg text-text-muted hover:bg-brand-muted hover:text-brand-primary transition-all">
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                      )}
                      {canDelete && (
                        <button onClick={() => openDelete(dept)}
                          title="Delete"
                          className="p-1.5 rounded-lg text-text-muted hover:bg-status-danger-bg hover:text-status-danger transition-all">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Name + rate badge */}
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-base font-black text-text-primary group-hover:text-brand-primary transition-colors truncate">
                      {dept.name}
                    </h3>
                    <span className={`shrink-0 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-black border ${
                      rate >= 70
                        ? "bg-status-success-bg text-status-success border-status-success/20"
                        : "bg-bg-tertiary text-text-muted border-border-clean"
                    }`}>
                      <TrendingUp className="h-2.5 w-2.5" /> {rate}%
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div>
                    <div className="h-1.5 w-full rounded-full bg-bg-tertiary overflow-hidden">
                      <div className={`h-full rounded-full bg-gradient-to-r ${g} transition-all duration-700`}
                        style={{ width: `${rate}%` }} />
                    </div>
                    <div className="flex justify-between mt-1.5">
                      <span className="text-[10px] text-text-muted font-semibold">Task Completion</span>
                      <span className="text-[10px] font-bold text-text-secondary">{taskCount} tasks</span>
                    </div>
                  </div>

                  {/* Staff row */}
                  <div className="flex items-center justify-between border-t border-border-clean pt-3 mt-auto gap-3">
                    <div className="flex items-center gap-2 min-w-0">
                      {members.length === 0 ? (
                        <span className="text-xs text-text-muted italic">No staff yet</span>
                      ) : (
                        <>
                          <div className="flex -space-x-2 shrink-0">
                            {preview.map((e) => <Av key={e.id} src={e.avatarUrl} name={e.name} px={28} />)}
                            {over > 0 && (
                              <div className="h-7 w-7 rounded-full border-2 border-bg-primary bg-bg-tertiary flex items-center justify-center text-[9px] font-black text-text-secondary shrink-0">
                                +{over}
                              </div>
                            )}
                          </div>
                          <span className="text-xs font-bold text-text-secondary truncate">
                            {members.length} staff
                          </span>
                        </>
                      )}
                    </div>
                    {canEdit && (
                      <button onClick={() => openStaff(dept)}
                        className={`shrink-0 inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-[11px] font-black text-white bg-gradient-to-r ${g} shadow-sm hover:-translate-y-0.5 hover:shadow-md active:scale-95 transition-all`}>
                        <UserPlus className="h-3.5 w-3.5" />
                        Add Employee
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* ═══ CREATE WIZARD ═══════════════════════════════════════════════════ */}
        {modal === "create" && (
          <Overlay onClose={close} busy={busy || staffBusy}>
            <Panel>
              <WizSteps step={wizStep} />

              {/* Step 1 */}
              {wizStep === 1 && (
                <div className="px-6 py-5">
                  <p className="text-xs text-text-secondary mb-5">
                    Name your department. You'll add staff in the next step.
                  </p>
                  <form onSubmit={handleStep1} className="space-y-4">
                    <div>
                      <label className="block text-xs font-black text-text-primary uppercase tracking-wider mb-1.5">
                        Department Name *
                      </label>
                      <input ref={nameRef} type="text" value={deptName} disabled={busy}
                        onChange={(e) => { setDeptName(e.target.value); setDeptErr(""); }}
                        placeholder="e.g. Engineering"
                        className="w-full rounded-xl border border-border-clean bg-bg-secondary py-2.5 px-3 text-sm text-text-primary outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 transition-all disabled:opacity-60" />
                      {deptErr && <p className="text-xs text-status-danger font-semibold mt-1">{deptErr}</p>}
                    </div>
                    <div>
                      <label className="block text-xs font-black text-text-primary uppercase tracking-wider mb-1.5">
                        Description <span className="font-normal normal-case text-text-muted">(optional)</span>
                      </label>
                      <textarea rows={3} value={deptDesc} disabled={busy}
                        onChange={(e) => setDeptDesc(e.target.value)}
                        placeholder="Brief description..."
                        className="w-full rounded-xl border border-border-clean bg-bg-secondary py-2.5 px-3 text-sm text-text-primary outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 transition-all resize-none disabled:opacity-60" />
                    </div>
                    <div className="flex justify-end gap-3 pt-2 border-t border-border-clean">
                      <button type="button" onClick={close} disabled={busy}
                        className="rounded-xl border border-border-clean px-4 py-2 text-sm font-bold text-text-primary hover:bg-bg-tertiary transition-all disabled:opacity-40">
                        Cancel
                      </button>
                      <button type="submit" disabled={busy}
                        className="inline-flex items-center gap-2 rounded-xl bg-brand-primary px-5 py-2 text-sm font-bold text-white hover:bg-brand-secondary transition-all shadow-sm disabled:opacity-60">
                        {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ArrowRight className="h-3.5 w-3.5" />}
                        {busy ? "Creating..." : "Create & Add Staff →"}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Step 2 */}
              {wizStep === 2 && wizDept && (
                <div className="px-6 py-5">
                  <div className="flex items-center gap-2 mb-4">
                    <CheckCircle2 className="h-5 w-5 text-status-success shrink-0" />
                    <div>
                      <p className="text-sm font-black text-text-primary">"{wizDept.name}" created!</p>
                      <p className="text-xs text-text-secondary">Select employees to assign. Skip if not needed.</p>
                    </div>
                  </div>

                  {/* Selected pills */}
                  {picked.length > 0 && (
                    <div className="mb-3 flex flex-wrap gap-1.5">
                      {picked.map((id) => {
                        const e = emps.find((x) => x.id === id);
                        if (!e) return null;
                        return (
                          <span key={id}
                            className="inline-flex items-center gap-1.5 bg-brand-primary/10 border border-brand-primary/20 text-brand-primary text-[10px] font-bold px-2 py-1 rounded-full">
                            <Av src={e.avatarUrl} name={e.name} px={16} />
                            {e.name}
                            <button onClick={() => setPicked((p) => p.filter((x) => x !== id))}
                              className="hover:text-status-danger transition-colors">
                              <X className="h-3 w-3" />
                            </button>
                          </span>
                        );
                      })}
                    </div>
                  )}

                  <StaffPicker emps={filteredEmps} empBusy={empBusy} search={search}
                    onSearch={setSearch} picked={picked}
                    onToggle={(id) => setPicked((p) => p.includes(id) ? p.filter((x) => x !== id) : [...p, id])} />

                  <div className="flex justify-end gap-3 pt-4 border-t border-border-clean">
                    <button onClick={close} disabled={staffBusy}
                      className="rounded-xl border border-border-clean px-4 py-2 text-sm font-bold text-text-primary hover:bg-bg-tertiary transition-all disabled:opacity-40">
                      Skip for now
                    </button>
                    <button onClick={handleStep2} disabled={staffBusy}
                      className="inline-flex items-center gap-2 rounded-xl bg-brand-primary px-5 py-2 text-sm font-bold text-white hover:bg-brand-secondary transition-all shadow-sm disabled:opacity-60">
                      {staffBusy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <UserPlus className="h-3.5 w-3.5" />}
                      {staffBusy ? "Saving..." : picked.length > 0 ? `Add ${picked.length} Employee${picked.length > 1 ? "s" : ""}` : "Done"}
                    </button>
                  </div>
                </div>
              )}
            </Panel>
          </Overlay>
        )}

        {/* ═══ EDIT ════════════════════════════════════════════════════════════ */}
        {modal === "edit" && target && (
          <Overlay onClose={close} busy={busy}>
            <Panel>
              <ModalHeader title={`Edit: ${target.name}`} icon={<Pencil className="h-4 w-4 text-brand-primary" />}
                onClose={close} busy={busy} />
              <form onSubmit={handleEdit} className="px-6 py-5 space-y-4">
                <div>
                  <label className="block text-xs font-black text-text-primary uppercase tracking-wider mb-1.5">Name *</label>
                  <input autoFocus type="text" value={editName} disabled={busy}
                    onChange={(e) => { setEditName(e.target.value); setEditErr(""); }}
                    className="w-full rounded-xl border border-border-clean bg-bg-secondary py-2.5 px-3 text-sm text-text-primary outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 transition-all disabled:opacity-60" />
                </div>
                <div>
                  <label className="block text-xs font-black text-text-primary uppercase tracking-wider mb-1.5">
                    Description <span className="font-normal normal-case text-text-muted">(optional)</span>
                  </label>
                  <textarea rows={3} value={editDesc} disabled={busy}
                    onChange={(e) => setEditDesc(e.target.value)}
                    className="w-full rounded-xl border border-border-clean bg-bg-secondary py-2.5 px-3 text-sm text-text-primary outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 transition-all resize-none disabled:opacity-60" />
                </div>
                {editErr && <p className="text-xs text-status-danger font-semibold">{editErr}</p>}
                <div className="flex justify-end gap-3 pt-2 border-t border-border-clean">
                  <button type="button" onClick={close} disabled={busy}
                    className="rounded-xl border border-border-clean px-4 py-2 text-sm font-bold text-text-primary hover:bg-bg-tertiary transition-all disabled:opacity-40">
                    Cancel
                  </button>
                  <button type="submit" disabled={busy}
                    className="inline-flex items-center gap-2 rounded-xl bg-brand-primary px-5 py-2 text-sm font-bold text-white hover:bg-brand-secondary transition-all shadow-sm disabled:opacity-60">
                    {busy && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                    {busy ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </form>
            </Panel>
          </Overlay>
        )}

        {/* ═══ STAFF ═══════════════════════════════════════════════════════════ */}
        {modal === "staff" && target && (
          <Overlay onClose={close} busy={staffBusy}>
            <Panel wide>
              <ModalHeader
                title={`Staff — ${target.name}`}
                icon={<Users className="h-4 w-4 text-brand-primary" />}
                onClose={close} busy={staffBusy}
              />
              <div className="px-6 py-5 space-y-4">
                {/* Selected pills */}
                {picked.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 p-3 rounded-xl bg-brand-muted border border-brand-primary/15">
                    <p className="text-[10px] font-black text-brand-primary uppercase tracking-wider w-full flex items-center gap-1 mb-1">
                      <CheckCircle2 className="h-3 w-3" /> Selected ({picked.length})
                    </p>
                    {picked.map((id) => {
                      const e = emps.find((x) => x.id === id);
                      if (!e) return null;
                      return (
                        <span key={id}
                          className="inline-flex items-center gap-1.5 bg-brand-primary/10 border border-brand-primary/20 text-brand-primary text-[10px] font-bold px-2.5 py-1 rounded-full">
                          <Av src={e.avatarUrl} name={e.name} px={16} />
                          {e.name}
                          <button onClick={() => setPicked((p) => p.filter((x) => x !== id))}
                            className="hover:text-status-danger transition-colors ml-0.5">
                            <X className="h-3 w-3" />
                          </button>
                        </span>
                      );
                    })}
                  </div>
                )}

                <StaffPicker emps={filteredEmps} empBusy={empBusy} search={search}
                  onSearch={setSearch} picked={picked}
                  onToggle={(id) => setPicked((p) => p.includes(id) ? p.filter((x) => x !== id) : [...p, id])} />

                <div className="flex justify-end gap-3 pt-3 border-t border-border-clean">
                  <button onClick={close} disabled={staffBusy}
                    className="rounded-xl border border-border-clean px-4 py-2 text-sm font-bold text-text-primary hover:bg-bg-tertiary transition-all disabled:opacity-40">
                    Cancel
                  </button>
                  <button onClick={handleSaveStaff} disabled={staffBusy}
                    className="inline-flex items-center gap-2 rounded-xl bg-brand-primary px-5 py-2 text-sm font-bold text-white hover:bg-brand-secondary transition-all shadow-sm disabled:opacity-60">
                    {staffBusy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <UserPlus className="h-3.5 w-3.5" />}
                    {staffBusy ? "Saving..." : "Save Staff"}
                  </button>
                </div>
              </div>
            </Panel>
          </Overlay>
        )}

        {/* ═══ DELETE CONFIRM ══════════════════════════════════════════════════ */}
        {modal === "delete" && target && (
          <Overlay onClose={close} busy={busy}>
            <div className="w-full max-w-sm mx-4 rounded-2xl bg-bg-primary p-6 shadow-2xl border border-status-danger/20 animate-in fade-in zoom-in-95 duration-200">
              <div className="flex flex-col items-center text-center gap-3 mb-6">
                <div className="h-14 w-14 rounded-full bg-status-danger-bg border border-status-danger/20 flex items-center justify-center">
                  <AlertTriangle className="h-7 w-7 text-status-danger" />
                </div>
                <div>
                  <h3 className="text-base font-black text-text-primary">Delete Department?</h3>
                  <p className="text-xs text-text-secondary font-medium mt-1 leading-relaxed">
                    "{target.name}" will be permanently removed. This cannot be undone.
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <button onClick={close} disabled={busy}
                  className="flex-1 rounded-xl border border-border-clean py-2.5 text-sm font-bold text-text-primary hover:bg-bg-tertiary transition-all disabled:opacity-40">
                  Cancel
                </button>
                <button onClick={handleDelete} disabled={busy}
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-status-danger py-2.5 text-sm font-bold text-white hover:opacity-90 transition-all shadow-sm disabled:opacity-60">
                  {busy && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  {busy ? "Deleting..." : "Yes, Delete"}
                </button>
              </div>
            </div>
          </Overlay>
        )}

      </div>
    </ProtectedRoute>
  );
}

// ─── Staff picker sub-component ───────────────────────────────────────────────
function StaffPicker({ emps, empBusy, search, onSearch, picked, onToggle }: {
  emps: any[];
  empBusy: boolean;
  search: string;
  onSearch: (v: string) => void;
  picked: string[];
  onToggle: (id: string) => void;
}) {
  return (
    <div className="space-y-2">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-text-muted pointer-events-none" />
        <input type="text" value={search} onChange={(e) => onSearch(e.target.value)}
          placeholder="Search employees..."
          className="w-full rounded-xl border border-border-clean bg-bg-secondary py-2.5 pl-9 pr-3 text-sm text-text-primary outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 transition-all" />
      </div>
      <div className="max-h-64 overflow-y-auto space-y-1.5 pr-0.5">
        {empBusy && (
          <div className="flex justify-center py-10">
            <Loader2 className="h-5 w-5 animate-spin text-brand-primary" />
          </div>
        )}
        {!empBusy && emps.length === 0 && (
          <p className="text-xs text-text-muted text-center py-10">No employees found.</p>
        )}
        {!empBusy && emps.map((emp) => {
          const sel = picked.includes(emp.id);
          return (
            <label key={emp.id}
              className={`flex items-center gap-3 p-2.5 rounded-xl border cursor-pointer select-none transition-all ${
                sel ? "border-brand-primary/30 bg-brand-muted" : "border-border-clean bg-bg-secondary hover:bg-bg-tertiary"
              }`}>
              <input type="checkbox" checked={sel} onChange={() => onToggle(emp.id)}
                className="h-4 w-4 rounded text-brand-primary border-border-clean focus:ring-brand-primary shrink-0" />
              <Av src={emp.avatarUrl} name={emp.name} px={32} />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-text-primary truncate">{emp.name}</p>
                <p className="text-[10px] text-text-muted truncate">{emp.title}</p>
              </div>
              <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-lg border shrink-0 ${
                sel ? "bg-brand-primary/10 text-brand-primary border-brand-primary/20"
                    : "bg-bg-tertiary text-text-muted border-border-clean"
              }`}>{emp.role}</span>
            </label>
          );
        })}
      </div>
    </div>
  );
}
