"use client";

import React from "react";
import { Edit2, Trash2, Mail, Briefcase, ExternalLink } from "lucide-react";
import Link from "next/link";
import { useTranslation } from "@/hooks/useTranslation";
import { useDBStore } from "@/store/dbStore";
import { hasPermission } from "@/config/rbac";
import { Employee } from "@/types/employee.types";
import { Department } from "@/data/seedData";

interface EmployeeGridProps {
  employees: Employee[];
  departments: Department[];
  onView?: (emp: Employee) => void;
  onEdit?: (emp: Employee) => void;
  onDelete?: (id: string, name: string) => void;
}

export default function EmployeeGrid({
  employees,
  departments,
  onView,
  onEdit,
  onDelete,
}: EmployeeGridProps) {
  const { t, isRtl } = useTranslation();
  const { activeRole } = useDBStore();

  const canEdit = hasPermission(activeRole, "employees:update");
  const canDelete = hasPermission(activeRole, "employees:delete");

  return (
    <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 font-poppins">
      {employees.map((emp) => {
        const deptName = departments.find((d) => d.id === emp.departmentId)?.name || "-";

        return (
          <div
            key={emp.id}
            className="group relative flex flex-col justify-between rounded-2xl border border-border-clean bg-bg-primary p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-glow-primary hover:border-brand-primary/20"
          >
            {/* Top Row: Status & Actions */}
            <div className="flex items-center justify-between">
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                  emp.isActive
                    ? "bg-status-success-bg text-status-success border border-status-success/10"
                    : "bg-status-danger-bg text-status-danger border border-status-danger/10"
                }`}
              >
                {emp.isActive ? t.active : t.inactive}
              </span>
              
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <Link
                  href={`/employees/${emp.id}`}
                  title="View Profile"
                  className="rounded-lg p-1 text-text-secondary hover:bg-brand-muted hover:text-brand-primary transition-all focus:outline-none"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                </Link>
                {canEdit && (
                  <button
                    onClick={() => onEdit?.(emp)}
                    className="rounded-lg p-1 text-text-secondary hover:bg-bg-tertiary hover:text-text-primary transition-all focus:outline-none cursor-pointer"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                  </button>
                )}
                {canDelete && emp.isActive && (
                  <button
                    onClick={() => onDelete?.(emp.id, emp.fullName)}
                    className="rounded-lg p-1 text-status-danger hover:bg-status-danger-bg transition-all focus:outline-none cursor-pointer"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Profile Center */}
            <div className="flex flex-col items-center text-center mt-3 mb-4">
              <img
                src={emp.avatarUrl}
                alt={emp.fullName}
                className="h-16 w-16 rounded-full object-cover border-2 border-border-clean shadow-sm group-hover:border-brand-primary transition-all duration-300"
              />
              <Link
                href={`/employees/${emp.id}`}
                className="text-sm font-black text-text-primary mt-3 group-hover:text-brand-primary transition-colors hover:underline"
              >
                {emp.fullName}
              </Link>
              <p className="text-[11px] text-text-secondary font-medium leading-normal mt-0.5">
                {emp.title}
              </p>
            </div>

            {/* Bottom details card info */}
            <div className="border-t border-border-clean/50 pt-3 space-y-2 text-[10px] font-semibold text-text-secondary">
              <div className="flex items-center gap-2">
                <Briefcase className="h-3.5 w-3.5 text-brand-primary/70 shrink-0" />
                <span className="truncate">{deptName}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-3.5 w-3.5 text-brand-primary/70 shrink-0" />
                <span className="truncate">{emp.email}</span>
              </div>
            </div>

            {/* Visual bottom slide indicator */}
            <span className="absolute bottom-0 left-4 right-4 h-0.5 rounded-full bg-brand-primary scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
          </div>
        );
      })}
      {employees.length === 0 && (
        <div className="col-span-full py-12 text-center text-xs text-text-muted border border-dashed border-border-clean rounded-2xl bg-bg-primary">
          {t.noData}
        </div>
      )}
    </div>
  );
}
