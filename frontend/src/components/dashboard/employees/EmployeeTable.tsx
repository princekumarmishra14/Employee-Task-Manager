"use client";

import React from "react";
import { Edit2, Trash2, ChevronLeft, ChevronRight, ExternalLink } from "lucide-react";
import Link from "next/link";
import { useTranslation } from "@/hooks/useTranslation";
import { useDBStore } from "@/store/dbStore";
import { hasPermission } from "@/config/rbac";
import { Employee } from "@/types/employee.types";
import { Department } from "@/data/seedData";

interface EmployeeTableProps {
  employees: Employee[];
  departments: Department[];
  onView?: (emp: Employee) => void;
  onEdit?: (emp: Employee) => void;
  onDelete?: (id: string, name: string) => void;
  currentPage: number;
  totalPages: number;
  totalCount: number;
  filteredCount: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
}

export default function EmployeeTable({
  employees,
  departments,
  onEdit,
  onDelete,
  currentPage,
  totalPages,
  filteredCount,
  itemsPerPage,
  onPageChange,
}: EmployeeTableProps) {
  const { t, isRtl } = useTranslation();
  const { activeRole } = useDBStore();

  const startIndex = (currentPage - 1) * itemsPerPage;

  return (
    <div className="overflow-hidden rounded-2xl border border-border-clean bg-bg-primary shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse dir-ltr min-w-[700px]">
          <thead>
            <tr className="border-b border-border-clean bg-bg-secondary text-[10px] font-black text-text-muted uppercase tracking-widest">
              <th className="py-3.5 px-5">{t.empName}</th>
              <th className="py-3.5 px-5">{t.empJobTitle}</th>
              <th className="py-3.5 px-5">{t.empRole}</th>
              <th className="py-3.5 px-5">{t.empStatus}</th>
              <th className="py-3.5 px-5">{t.empHireDate}</th>
              <th className="py-3.5 px-5 text-center">{t.actions}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-clean text-sm font-poppins">
            {employees.map((emp) => {
              const canEdit = hasPermission(activeRole, "employees:update");
              const canDelete = hasPermission(activeRole, "employees:delete");
              const deptName = departments.find((d) => d.id === emp.departmentId)?.name || "—";

              return (
                <tr key={emp.id} className="hover:bg-bg-secondary transition-colors group">

                  {/* Name + Avatar */}
                  <td className="py-3.5 px-5">
                    <div className="flex items-center gap-3">
                      <img
                        src={emp.avatarUrl}
                        alt={emp.fullName}
                        className="h-9 w-9 rounded-full object-cover border border-border-clean shadow-sm"
                      />
                      <div className="min-w-0">
                        <Link
                          href={`/employees/${emp.id}`}
                          className="font-black text-text-primary group-hover:text-brand-primary transition-colors text-sm block truncate hover:underline"
                        >
                          {emp.fullName}
                        </Link>
                        <span className="text-[10px] text-text-muted font-medium block truncate">
                          {emp.email}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Job Title + Dept */}
                  <td className="py-3.5 px-5">
                    <span className="font-semibold text-text-primary block text-xs">{emp.title}</span>
                    <span className="text-[10px] text-brand-primary font-bold uppercase tracking-wide">{deptName}</span>
                  </td>

                  {/* Role */}
                  <td className="py-3.5 px-5">
                    <span className="rounded-md bg-brand-muted border border-brand-primary/20 px-2 py-0.5 text-[10px] font-black text-brand-primary uppercase tracking-wide">
                      {emp.role}
                    </span>
                  </td>

                  {/* Status */}
                  <td className="py-3.5 px-5">
                    <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-black border ${
                      emp.isActive
                        ? "bg-status-success-bg border-status-success/30 text-status-success"
                        : "bg-status-danger-bg border-status-danger/30 text-status-danger"
                    }`}>
                      {emp.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>

                  {/* Hire Date */}
                  <td className="py-3.5 px-5 text-text-muted text-xs font-semibold">
                    {new Date(emp.createdAt).toLocaleDateString()}
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 px-5 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Link
                        href={`/employees/${emp.id}`}
                        title="View Profile"
                        className="rounded-lg p-1.5 text-text-muted hover:bg-brand-muted hover:text-brand-primary transition-all focus:outline-none"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Link>
                      {canEdit && (
                        <button
                          onClick={() => onEdit?.(emp)}
                          title="Edit Employee"
                          className="rounded-lg p-1.5 text-text-muted hover:bg-status-info-bg hover:text-status-info transition-all focus:outline-none cursor-pointer"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                      )}
                      {canDelete && emp.isActive && (
                        <button
                          onClick={() => onDelete?.(emp.id, emp.fullName)}
                          title="Deactivate Employee"
                          className="rounded-lg p-1.5 text-text-muted hover:bg-status-danger-bg hover:text-status-danger transition-all focus:outline-none cursor-pointer"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
            {employees.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center py-12 text-text-muted font-semibold text-sm">
                  {t.noData}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-border-clean px-6 py-4 bg-bg-secondary">
          <span className="text-xs text-text-muted font-semibold">
            {isRtl
              ? `عرض ${startIndex + 1} إلى ${Math.min(startIndex + itemsPerPage, filteredCount)} من أصل ${filteredCount} موظف`
              : `Showing ${startIndex + 1} – ${Math.min(startIndex + itemsPerPage, filteredCount)} of ${filteredCount} employees`}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border-clean bg-bg-primary text-text-secondary hover:bg-bg-tertiary disabled:opacity-40 cursor-pointer focus:outline-none"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="text-xs font-black text-text-primary tabular-nums">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border-clean bg-bg-primary text-text-secondary hover:bg-bg-tertiary disabled:opacity-40 cursor-pointer focus:outline-none"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
