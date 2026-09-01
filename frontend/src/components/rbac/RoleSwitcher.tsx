"use client";

import React from "react";
import { useDBStore } from "@/store/dbStore";
import { ROLES, UserRole } from "@/constants/roles";
import { Shield } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";

export default function RoleSwitcher() {
  const { activeRole, setActiveRole } = useDBStore();
  const { t, currentLanguage } = useTranslation();

  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setActiveRole(e.target.value as UserRole);
  };

  return (
    <div className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-1.5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
      <Shield className="h-4 w-4 text-indigo-500" />
      <span className="hidden text-xs font-semibold text-gray-500 dark:text-gray-400 sm:inline">
        {t.roleLabel}:
      </span>
      <select
        value={activeRole}
        onChange={handleRoleChange}
        className="bg-transparent text-sm font-semibold text-gray-850 outline-none cursor-pointer dark:text-gray-100 focus:ring-0"
      >
        {Object.values(ROLES).map((role) => (
          <option key={role.id} value={role.id} className="dark:bg-gray-800">
            {currentLanguage === "ar" ? role.arName : role.name}
          </option>
        ))}
      </select>
    </div>
  );
}
