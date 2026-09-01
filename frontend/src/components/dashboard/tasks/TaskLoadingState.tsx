"use client";

import React from "react";
import { useTranslation } from "@/hooks/useTranslation";

export default function TaskLoadingState() {
  const { isRtl } = useTranslation();
  
  // Render a skeleton table with 5 rows and headers matching TaskTable
  const skeletonRows = Array.from({ length: 5 });

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-250 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900 animate-pulse">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[950px] dir-ltr">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-900/60 text-xs font-bold text-gray-400 uppercase tracking-widest">
              <th className="py-4 px-6">{isRtl ? "المهمة" : "Task"}</th>
              <th className="py-4 px-6">{isRtl ? "الوصف" : "Description"}</th>
              <th className="py-4 px-6">{isRtl ? "القسم" : "Department"}</th>
              <th className="py-4 px-6">{isRtl ? "المسؤول" : "Assigned To"}</th>
              <th className="py-4 px-6">{isRtl ? "الأولوية" : "Priority"}</th>
              <th className="py-4 px-6">{isRtl ? "الحالة" : "Status"}</th>
              <th className="py-4 px-6">{isRtl ? "تاريخ الاستحقاق" : "Due Date"}</th>
              <th className="py-4 px-6">{isRtl ? "تاريخ الإنشاء" : "Created Date"}</th>
              <th className="py-4 px-6 text-center">{isRtl ? "الإجراءات" : "Actions"}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-150 dark:divide-gray-800">
            {skeletonRows.map((_, idx) => (
              <tr key={idx} className="bg-white dark:bg-gray-900">
                {/* Title */}
                <td className="py-4 px-6">
                  <div className="h-4 w-28 bg-gray-200 dark:bg-gray-800 rounded-md" />
                </td>
                {/* Description */}
                <td className="py-4 px-6">
                  <div className="h-3 w-40 bg-gray-150 dark:bg-gray-800 rounded-md" />
                </td>
                {/* Department */}
                <td className="py-4 px-6">
                  <div className="h-3 w-16 bg-indigo-100 dark:bg-indigo-950/40 rounded-md" />
                </td>
                {/* Assigned To */}
                <td className="py-4 px-6">
                  <div className="flex items-center gap-2">
                    <div className="h-6 w-6 rounded-full bg-gray-200 dark:bg-gray-850" />
                    <div className="h-3 w-20 bg-gray-200 dark:bg-gray-800 rounded-md" />
                  </div>
                </td>
                {/* Priority */}
                <td className="py-4 px-6">
                  <div className="h-5 w-16 bg-gray-250 dark:bg-gray-800 rounded-full" />
                </td>
                {/* Status */}
                <td className="py-4 px-6">
                  <div className="h-5 w-20 bg-gray-250 dark:bg-gray-800 rounded-full" />
                </td>
                {/* Due Date */}
                <td className="py-4 px-6">
                  <div className="h-3 w-16 bg-gray-200 dark:bg-gray-800 rounded-md" />
                </td>
                {/* Created Date */}
                <td className="py-4 px-6">
                  <div className="h-3 w-16 bg-gray-200 dark:bg-gray-800 rounded-md" />
                </td>
                {/* Actions */}
                <td className="py-4 px-6 text-center">
                  <div className="h-6 w-6 bg-gray-200 dark:bg-gray-800 rounded-md mx-auto" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
