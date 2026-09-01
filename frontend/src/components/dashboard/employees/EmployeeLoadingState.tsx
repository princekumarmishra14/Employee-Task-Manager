"use client";

import React from "react";
import { useTranslation } from "@/hooks/useTranslation";

export default function EmployeeLoadingState() {
  const { isRtl } = useTranslation();
  const skeletonRows = Array.from({ length: 5 });

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-250 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900 animate-pulse">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[800px] dir-ltr">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-900/80 text-xs font-semibold text-gray-400 uppercase tracking-wider">
              <th className="py-3.5 px-6">{isRtl ? "الموظف" : "Employee"}</th>
              <th className="py-3.5 px-6">{isRtl ? "المسمى الوظيفي" : "Job Title"}</th>
              <th className="py-3.5 px-6">{isRtl ? "الصلاحية" : "Role"}</th>
              <th className="py-3.5 px-6">{isRtl ? "الحالة" : "Status"}</th>
              <th className="py-3.5 px-6">{isRtl ? "تاريخ التعيين" : "Hire Date"}</th>
              <th className="py-3.5 px-6 text-center">{isRtl ? "الإجراءات" : "Actions"}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-150 dark:divide-gray-800">
            {skeletonRows.map((_, idx) => (
              <tr key={idx} className="bg-white dark:bg-gray-900">
                {/* Employee Name & Avatar */}
                <td className="py-3.5 px-6">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-800 shrink-0" />
                    <div className="space-y-1.5">
                      <div className="h-3.5 w-32 bg-gray-200 dark:bg-gray-800 rounded-md" />
                      <div className="h-3 w-40 bg-gray-150 dark:bg-gray-850 rounded-md" />
                    </div>
                  </div>
                </td>
                {/* Job Title */}
                <td className="py-3.5 px-6">
                  <div className="space-y-1.5">
                    <div className="h-3.5 w-28 bg-gray-250 dark:bg-gray-800 rounded-md" />
                    <div className="h-3 w-16 bg-indigo-100 dark:bg-indigo-950/40 rounded-md" />
                  </div>
                </td>
                {/* Role */}
                <td className="py-3.5 px-6">
                  <div className="h-5 w-16 bg-gray-200 dark:bg-gray-800 rounded-md" />
                </td>
                {/* Status */}
                <td className="py-3.5 px-6">
                  <div className="h-5 w-14 bg-gray-200 dark:bg-gray-800 rounded-full" />
                </td>
                {/* Hire Date */}
                <td className="py-3.5 px-6">
                  <div className="h-3.5 w-20 bg-gray-200 dark:bg-gray-800 rounded-md" />
                </td>
                {/* Actions */}
                <td className="py-3.5 px-6 text-center">
                  <div className="h-7 w-16 bg-gray-200 dark:bg-gray-800 rounded-md mx-auto" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
