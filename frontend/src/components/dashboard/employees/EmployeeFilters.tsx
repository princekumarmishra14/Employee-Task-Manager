"use client";

import React from "react";
import { Search } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import { Department, Team } from "@/data/seedData";

interface EmployeeFiltersProps {
  searchQuery: string;
  onSearchChange: (val: string) => void;
  deptFilter: string;
  onDeptChange: (val: string) => void;
  teamFilter: string;
  onTeamChange: (val: string) => void;
  statusFilter: string;
  onStatusChange: (val: string) => void;
  designationFilter: string;
  onDesignationChange: (val: string) => void;
  departments: Department[];
  teams: Team[];
  designations: string[];
}

export default function EmployeeFilters({
  searchQuery,
  onSearchChange,
  deptFilter,
  onDeptChange,
  teamFilter,
  onTeamChange,
  statusFilter,
  onStatusChange,
  designationFilter,
  onDesignationChange,
  departments,
  teams,
  designations,
}: EmployeeFiltersProps) {
  const { t, isRtl } = useTranslation();

  return (
    <div className="grid gap-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 font-poppins">
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-2.5 h-4.5 w-4.5 text-gray-450 dark:text-gray-500" />
        <input
          type="text"
          placeholder={t.empSearchPlaceholder}
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full rounded-xl border border-gray-250 bg-gray-55 py-2 pl-10 pr-4 text-sm text-gray-800 outline-none focus:border-indigo-500 focus:bg-white dark:border-gray-700 dark:bg-gray-800 dark:text-white"
        />
      </div>

      {/* Department Dropdown Filter */}
      <select
        value={deptFilter}
        onChange={(e) => onDeptChange(e.target.value)}
        className="rounded-xl border border-gray-250 bg-gray-55 py-2 px-3 text-sm text-gray-850 outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white cursor-pointer"
      >
        <option value="ALL">{isRtl ? "كل الأقسام" : "All Departments"}</option>
        {departments.map((d) => (
          <option key={d.id} value={d.id}>
            {d.name}
          </option>
        ))}
      </select>

      {/* Team Dropdown Filter */}
      <select
        value={teamFilter}
        onChange={(e) => onTeamChange(e.target.value)}
        className="rounded-xl border border-gray-250 bg-gray-55 py-2 px-3 text-sm text-gray-850 outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white cursor-pointer"
      >
        <option value="ALL">{isRtl ? "كل الفرق" : "All Teams"}</option>
        {teams.map((tm) => (
          <option key={tm.id} value={tm.id}>
            {tm.name}
          </option>
        ))}
      </select>

      {/* Designation Dropdown Filter */}
      <select
        value={designationFilter}
        onChange={(e) => onDesignationChange(e.target.value)}
        className="rounded-xl border border-gray-250 bg-gray-55 py-2 px-3 text-sm text-gray-850 outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white cursor-pointer"
      >
        <option value="ALL">{isRtl ? "كل المسميات" : "All Designations"}</option>
        {designations.map((title) => (
          <option key={title} value={title}>
            {title}
          </option>
        ))}
      </select>

      {/* Status Dropdown Filter */}
      <select
        value={statusFilter}
        onChange={(e) => onStatusChange(e.target.value)}
        className="rounded-xl border border-gray-250 bg-gray-55 py-2 px-3 text-sm text-gray-850 outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white cursor-pointer"
      >
        <option value="ALL">{isRtl ? "كل الحالات" : "All Statuses"}</option>
        <option value="ACTIVE">{t.active}</option>
        <option value="INACTIVE">{t.inactive}</option>
      </select>
    </div>
  );
}
