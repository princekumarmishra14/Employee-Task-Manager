"use client";

import React, { useState } from "react";
import { useDBStore } from "@/store/dbStore";
import { useTranslation } from "@/hooks/useTranslation";
import { ScrollText, Search, Plus, RefreshCw, Trash2, Key } from "lucide-react";
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
  CREATE: <Plus className="h-3 w-3" />,
  DELETE: <Trash2 className="h-3 w-3" />,
  LOGIN: <Key className="h-3 w-3" />,
  PERMISSION_CHANGE: <Key className="h-3 w-3" />,
  STATUS_CHANGE: <RefreshCw className="h-3 w-3" />,
  UPDATE: <RefreshCw className="h-3 w-3" />,
};

export default function AuditLogsPage() {
  const { t, isRtl } = useTranslation();
  const { auditLogs } = useDBStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [actionFilter, setActionFilter] = useState("ALL");
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 15;

  const filteredLogs = auditLogs.filter((log) => {
    const matchesSearch =
      log.details.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.performedBy.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.entity.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesAction = actionFilter === "ALL" || log.action === actionFilter;
    return matchesSearch && matchesAction;
  });

  const totalPages = Math.ceil(filteredLogs.length / PAGE_SIZE);
  const pagedLogs = filteredLogs.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <ProtectedRoute permission="audit_logs:view">
      <div className="space-y-6 font-poppins">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-black tracking-tight text-text-primary uppercase flex items-center gap-2">
            <ScrollText className="h-6 w-6 text-brand-primary" />
            <span>{t.auditLogsTitle}</span>
          </h1>
          <p className="text-xs text-text-secondary font-medium mt-0.5">
            {t.auditLogsSubtitle}
          </p>
        </div>

        {/* Summary chips */}
        <div className="flex flex-wrap gap-2">
          {[
            { label: isRtl ? "الكل" : "All Events", value: auditLogs.length, active: actionFilter === "ALL", key: "ALL" },
            { label: "CREATE", value: auditLogs.filter((l) => l.action === "CREATE").length, active: actionFilter === "CREATE", key: "CREATE" },
            { label: "UPDATE", value: auditLogs.filter((l) => l.action === "UPDATE").length, active: actionFilter === "UPDATE", key: "UPDATE" },
            { label: "DELETE", value: auditLogs.filter((l) => l.action === "DELETE").length, active: actionFilter === "DELETE", key: "DELETE" },
            { label: "STATUS_CHANGE", value: auditLogs.filter((l) => l.action === "STATUS_CHANGE").length, active: actionFilter === "STATUS_CHANGE", key: "STATUS_CHANGE" },
            { label: "PERM_CHANGE", value: auditLogs.filter((l) => l.action === "PERMISSION_CHANGE").length, active: actionFilter === "PERMISSION_CHANGE", key: "PERMISSION_CHANGE" },
          ].map((chip) => (
            <button
              key={chip.key}
              onClick={() => { setActionFilter(chip.key); setPage(1); }}
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-wide border transition-all focus:outline-none ${
                chip.active
                  ? "bg-brand-primary text-white border-brand-primary shadow-sm"
                  : "bg-bg-secondary border-border-clean text-text-secondary hover:border-brand-primary/30 hover:text-text-primary"
              }`}
            >
              {chip.label}
              <span className={`rounded-full px-1 py-0.5 text-[9px] font-black ${
                chip.active ? "bg-white/20 text-white" : "bg-bg-tertiary text-text-muted"
              }`}>
                {chip.value}
              </span>
            </button>
          ))}
        </div>

        {/* Toolbar */}
        <div className="rounded-2xl border border-border-clean bg-bg-primary p-4 shadow-sm">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
            <input
              type="text"
              placeholder={isRtl ? "البحث في تفاصيل السجل..." : "Search by action, entity, or performer..."}
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
              className="w-full rounded-xl border border-border-clean bg-bg-secondary py-2.5 pl-10 pr-4 text-sm text-text-primary placeholder:text-text-muted outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 transition-all"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-hidden rounded-2xl border border-border-clean bg-bg-primary shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse dir-ltr">
              <thead>
                <tr className="border-b border-border-clean bg-bg-secondary text-[10px] font-black text-text-muted uppercase tracking-widest">
                  <th className="py-3.5 px-5">{t.auditLogAction}</th>
                  <th className="py-3.5 px-5">{t.auditLogEntity}</th>
                  <th className="py-3.5 px-5">{t.auditLogDetails}</th>
                  <th className="py-3.5 px-5">{t.auditLogPerformedBy}</th>
                  <th className="py-3.5 px-5">{t.auditLogDate}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-clean text-sm">
                {pagedLogs.map((log) => (
                  <tr
                    key={log.id}
                    className="hover:bg-bg-secondary transition-colors group"
                  >
                    <td className="py-3.5 px-5">
                      <span
                        className={`inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[10px] font-black border ${
                          ACTION_COLORS[log.action] || "bg-bg-tertiary text-text-secondary border-border-clean"
                        }`}
                      >
                        {ACTION_ICONS[log.action]}
                        {log.action.replace("_", " ")}
                      </span>
                    </td>
                    <td className="py-3.5 px-5">
                      <span className="text-xs font-black text-text-muted font-mono uppercase">
                        {log.entity}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 max-w-xs">
                      <span className="text-xs font-semibold text-text-primary block">
                        {log.details}
                      </span>
                      {log.previousValue && log.newValue && (
                        <div className="mt-2 flex flex-col gap-1 text-[9px] font-mono p-2 rounded-lg bg-bg-secondary border border-border-clean/60 max-w-xs overflow-x-auto whitespace-pre-wrap leading-relaxed">
                          <div className="text-status-danger bg-status-danger-bg/20 px-1 py-0.5 rounded border border-status-danger/10">
                            <strong>Prev:</strong> {log.previousValue}
                          </div>
                          <div className="text-status-success bg-status-success-bg/20 px-1 py-0.5 rounded border border-status-success/10">
                            <strong>New:</strong> {log.newValue}
                          </div>
                        </div>
                      )}
                    </td>
                    <td className="py-3.5 px-5">
                      <span className="text-xs font-bold text-text-primary">
                        {log.performedBy}
                      </span>
                    </td>
                    <td className="py-3.5 px-5">
                      <span className="text-xs text-text-muted font-semibold whitespace-nowrap">
                        {new Date(log.createdAt).toLocaleString([], {
                          dateStyle: "short",
                          timeStyle: "short",
                        })}
                      </span>
                    </td>
                  </tr>
                ))}
                {pagedLogs.length === 0 && (
                  <tr>
                    <td colSpan={5} className="text-center py-12">
                      <div className="flex flex-col items-center gap-2">
                        <ScrollText className="h-8 w-8 text-text-muted" />
                        <p className="text-sm font-bold text-text-muted">{t.noData}</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-border-clean px-5 py-3">
              <span className="text-xs text-text-muted font-semibold">
                {isRtl
                  ? `عرض ${(page - 1) * PAGE_SIZE + 1}–${Math.min(page * PAGE_SIZE, filteredLogs.length)} من ${filteredLogs.length}`
                  : `Showing ${(page - 1) * PAGE_SIZE + 1}–${Math.min(page * PAGE_SIZE, filteredLogs.length)} of ${filteredLogs.length}`}
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="rounded-lg px-2.5 py-1.5 text-xs font-bold border border-border-clean hover:bg-bg-tertiary disabled:opacity-40 transition-all focus:outline-none"
                >
                  {isRtl ? "السابق" : "Prev"}
                </button>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`rounded-lg px-2.5 py-1.5 text-xs font-black transition-all focus:outline-none ${
                      page === p
                        ? "bg-brand-primary text-white border-brand-primary"
                        : "border border-border-clean hover:bg-bg-tertiary text-text-secondary"
                    }`}
                  >
                    {p}
                  </button>
                ))}
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="rounded-lg px-2.5 py-1.5 text-xs font-bold border border-border-clean hover:bg-bg-tertiary disabled:opacity-40 transition-all focus:outline-none"
                >
                  {isRtl ? "التالي" : "Next"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
