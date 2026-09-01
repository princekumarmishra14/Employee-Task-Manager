"use client";

import React, { useState, useMemo } from "react";
import { useDBStore } from "@/store/dbStore";
import { useTranslation } from "@/hooks/useTranslation";
import { 
  Activity, 
  Search, 
  Plus, 
  Trash2, 
  RefreshCw, 
  Key, 
  Calendar, 
  Filter, 
  UserCheck, 
  ShieldAlert, 
  FileText 
} from "lucide-react";
import ProtectedRoute from "@/components/rbac/ProtectedRoute";

const ACTION_COLORS: Record<string, string> = {
  CREATE: "bg-status-success-bg text-status-success border-status-success/20",
  UPDATE: "bg-status-info-bg text-status-info border-status-info/20",
  DELETE: "bg-status-danger-bg text-status-danger border-status-danger/20",
  LOGIN: "bg-brand-muted text-brand-primary border-brand-primary/20",
  PERMISSION_CHANGE: "bg-status-warning-bg text-status-warning border-status-warning/20",
  STATUS_CHANGE: "bg-status-warning-bg text-status-warning border-status-warning/20",
};

const ACTION_ICONS: Record<string, React.ReactNode> = {
  CREATE: <Plus className="h-4 w-4" />,
  DELETE: <Trash2 className="h-4 w-4" />,
  LOGIN: <Key className="h-4 w-4" />,
  PERMISSION_CHANGE: <ShieldAlert className="h-4 w-4" />,
  STATUS_CHANGE: <RefreshCw className="h-4 w-4" />,
  UPDATE: <RefreshCw className="h-4 w-4" />,
};

export default function ActivityCenterPage() {
  const { t, isRtl } = useTranslation();
  const { auditLogs } = useDBStore();

  const [searchQuery, setSearchQuery] = useState("");
  const [actionFilter, setActionFilter] = useState("ALL");
  const [performerFilter, setPerformerFilter] = useState("ALL");
  const [dateFilter, setDateFilter] = useState("");

  // Unique performers list for select filter dropdown
  const uniquePerformers = useMemo(() => {
    const names = new Set(auditLogs.map((log) => log.performedBy));
    return Array.from(names).sort();
  }, [auditLogs]);

  // Derived filter logic
  const filteredLogs = useMemo(() => {
    return auditLogs.filter((log) => {
      const matchesSearch =
        searchQuery.trim() === "" ||
        log.details.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.performedBy.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.entity.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesAction = actionFilter === "ALL" || log.action === actionFilter;

      const matchesPerformer =
        performerFilter === "ALL" || log.performedBy === performerFilter;

      const matchesDate =
        !dateFilter ||
        new Date(log.createdAt).toDateString() === new Date(dateFilter).toDateString();

      return matchesSearch && matchesAction && matchesPerformer && matchesDate;
    });
  }, [auditLogs, searchQuery, actionFilter, performerFilter, dateFilter]);

  // Count summaries for metrics
  const creations = useMemo(() => auditLogs.filter((l) => l.action === "CREATE").length, [auditLogs]);
  const updates = useMemo(() => auditLogs.filter((l) => l.action === "UPDATE" || l.action === "STATUS_CHANGE").length, [auditLogs]);
  const deletions = useMemo(() => auditLogs.filter((l) => l.action === "DELETE").length, [auditLogs]);

  return (
    <ProtectedRoute permission="audit_logs:view">
      <div className="space-y-6 font-poppins animate-slide-up">
        
        {/* Header */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-text-primary uppercase flex items-center gap-2">
              <Activity className="h-6 w-6 text-brand-primary" />
              <span>{isRtl ? "مركز الأنشطة المركزي" : "Centralized Activity Center"}</span>
            </h1>
            <p className="text-xs text-text-secondary font-medium mt-0.5">
              {isRtl 
                ? "تتبع أنشطة عمليات المهام والموظفين عبر أقسام المؤسسة بشكل مباشر." 
                : "Monitor live operations, task changes, and employee registrations across the workspace."}
            </p>
          </div>
        </div>

        {/* Action KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="rounded-2xl border border-border-clean bg-bg-primary p-4 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-[10px] font-black text-text-muted uppercase tracking-widest block">Creations</span>
              <span className="text-2xl font-black text-status-success mt-1 block">{creations}</span>
            </div>
            <div className="rounded-xl p-2.5 bg-status-success-bg text-status-success border border-status-success/20">
              <Plus className="h-5 w-5" />
            </div>
          </div>
          <div className="rounded-2xl border border-border-clean bg-bg-primary p-4 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-[10px] font-black text-text-muted uppercase tracking-widest block">Updates & status</span>
              <span className="text-2xl font-black text-status-info mt-1 block">{updates}</span>
            </div>
            <div className="rounded-xl p-2.5 bg-status-info-bg text-status-info border border-status-info/20">
              <RefreshCw className="h-5 w-5" />
            </div>
          </div>
          <div className="rounded-2xl border border-border-clean bg-bg-primary p-4 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-[10px] font-black text-text-muted uppercase tracking-widest block">Deletions</span>
              <span className="text-2xl font-black text-status-danger mt-1 block">{deletions}</span>
            </div>
            <div className="rounded-xl p-2.5 bg-status-danger-bg text-status-danger border border-status-danger/20">
              <Trash2 className="h-5 w-5" />
            </div>
          </div>
        </div>

        {/* Filter Panel */}
        <div className="rounded-2xl border border-border-clean bg-bg-primary p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-xs font-black text-text-primary uppercase tracking-wider">
            <Filter className="h-4 w-4 text-brand-primary" />
            <span>Search & Filter Operations</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search Details */}
            <div className="space-y-1">
              <label className="block text-[10px] font-black text-text-muted uppercase tracking-wider">Search Keyword</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
                <input
                  type="text"
                  placeholder={isRtl ? "البحث عن كلمة مفتاحية..." : "Filter details, entity..."}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-xl border border-border-clean bg-bg-secondary py-2 pl-9 pr-3 text-xs text-text-primary outline-none focus:border-brand-primary transition-all"
                />
              </div>
            </div>

            {/* Action filter */}
            <div className="space-y-1">
              <label className="block text-[10px] font-black text-text-muted uppercase tracking-wider">Action Type</label>
              <select
                value={actionFilter}
                onChange={(e) => setActionFilter(e.target.value)}
                className="w-full rounded-xl border border-border-clean bg-bg-secondary py-2 px-3 text-xs text-text-primary outline-none focus:border-brand-primary cursor-pointer transition-all"
              >
                <option value="ALL">{isRtl ? "جميع الإجراءات" : "All Actions"}</option>
                <option value="CREATE">CREATE</option>
                <option value="UPDATE">UPDATE</option>
                <option value="DELETE">DELETE</option>
                <option value="STATUS_CHANGE">STATUS_CHANGE</option>
                <option value="PERMISSION_CHANGE">PERMISSION_CHANGE</option>
              </select>
            </div>

            {/* User filter */}
            <div className="space-y-1">
              <label className="block text-[10px] font-black text-text-muted uppercase tracking-wider">Performed By</label>
              <select
                value={performerFilter}
                onChange={(e) => setPerformerFilter(e.target.value)}
                className="w-full rounded-xl border border-border-clean bg-bg-secondary py-2 px-3 text-xs text-text-primary outline-none focus:border-brand-primary cursor-pointer transition-all"
              >
                <option value="ALL">{isRtl ? "جميع المستخدمين" : "All Performers"}</option>
                {uniquePerformers.map((perf) => (
                  <option key={perf} value={perf}>{perf}</option>
                ))}
              </select>
            </div>

            {/* Date filter */}
            <div className="space-y-1">
              <label className="block text-[10px] font-black text-text-muted uppercase tracking-wider">Date</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted pointer-events-none" />
                <input
                  type="date"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="w-full rounded-xl border border-border-clean bg-bg-secondary py-2 pl-9 pr-3 text-xs text-text-primary outline-none focus:border-brand-primary transition-all"
                />
              </div>
            </div>
          </div>

          {/* Reset Filters Option */}
          {(searchQuery || actionFilter !== "ALL" || performerFilter !== "ALL" || dateFilter) && (
            <div className="flex justify-end pt-2">
              <button
                onClick={() => {
                  setSearchQuery("");
                  setActionFilter("ALL");
                  setPerformerFilter("ALL");
                  setDateFilter("");
                }}
                className="text-[10px] font-bold text-brand-primary hover:underline uppercase"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>

        {/* Timeline Feed */}
        <div className="rounded-2xl border border-border-clean bg-bg-primary p-6 shadow-sm">
          <h3 className="text-xs font-black text-text-primary uppercase tracking-widest mb-6 flex items-center gap-2">
            <Activity className="h-4 w-4 text-brand-secondary" />
            <span>Operational Log Feed</span>
          </h3>

          <div className="relative border-l border-border-clean/80 pl-6 space-y-6 ml-3">
            {filteredLogs.length === 0 ? (
              <div className="text-center py-12 space-y-2 text-text-muted">
                <FileText className="h-8 w-8 mx-auto opacity-40" />
                <p className="text-xs font-black uppercase tracking-wider">{t.noData}</p>
                <p className="text-[10px] font-semibold">{isRtl ? "لم نعثر على أي أنشطة تطابق الفلتر الحالي." : "No operations match the selected filters."}</p>
              </div>
            ) : (
              filteredLogs.map((log) => (
                <div key={log.id} className="relative group">
                  {/* Timeline icon */}
                  <span className={`absolute -left-[35px] top-0 flex h-7 w-7 items-center justify-center rounded-full border shadow-sm transition-transform group-hover:scale-110 ${ACTION_COLORS[log.action] || "bg-bg-tertiary text-text-secondary border-border-clean"}`}>
                    {ACTION_ICONS[log.action] || <FileText className="h-4 w-4" />}
                  </span>

                  {/* Feed Card */}
                  <div className="bg-bg-secondary/40 border border-border-clean/60 rounded-xl p-4 hover:border-brand-primary/10 transition-all hover:bg-bg-secondary/70">
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border-clean/40 pb-2 mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-text-primary">{log.performedBy}</span>
                        <span className="text-[9px] font-bold text-brand-primary bg-brand-muted/55 border border-brand-primary/15 rounded-md px-1.5 py-0.5 uppercase tracking-wider">
                          {log.action.replace("_", " ")}
                        </span>
                      </div>
                      <span className="text-[10px] text-text-muted font-bold">
                        {new Date(log.createdAt).toLocaleString([], {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit"
                        })}
                      </span>
                    </div>

                    <p className="text-xs font-semibold text-text-secondary leading-relaxed">{log.details}</p>

                    {/* Diffs Visualizer */}
                    {log.previousValue && log.newValue && (
                      <div className="mt-3 bg-bg-primary border border-border-clean rounded-lg p-2.5 space-y-2">
                        <div className="text-[9px] font-black text-text-muted uppercase tracking-widest">Diff Details</div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-[10px] font-mono leading-tight">
                          <div className="bg-status-danger-bg/25 border border-status-danger/10 text-status-danger p-2 rounded-md overflow-x-auto">
                            <span className="font-bold block text-[9px] uppercase tracking-wider mb-1 text-status-danger/70">Previous Value</span>
                            <pre className="whitespace-pre-wrap">{JSON.stringify(JSON.parse(log.previousValue), null, 2)}</pre>
                          </div>
                          <div className="bg-status-success-bg/25 border border-status-success/10 text-status-success p-2 rounded-md overflow-x-auto">
                            <span className="font-bold block text-[9px] uppercase tracking-wider mb-1 text-status-success/70">New Value</span>
                            <pre className="whitespace-pre-wrap">{JSON.stringify(JSON.parse(log.newValue), null, 2)}</pre>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </ProtectedRoute>
  );
}
