"use client";

import React, { useState } from "react";
import { MoreHorizontal, Eye, Edit2, Copy, Trash2 } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";

interface TaskActionMenuProps {
  taskId: string;
  onView?: (id: string) => void;
  onEdit?: (id: string) => void;
  onDuplicate?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export default function TaskActionMenu({
  taskId,
  onView,
  onEdit,
  onDuplicate,
  onDelete,
}: TaskActionMenuProps) {
  const { t, isRtl } = useTranslation();
  const [open, setOpen] = useState(false);

  const handleAction = (callback?: (id: string) => void) => {
    if (callback) callback(taskId);
    setOpen(false);
  };

  return (
    <div className="relative inline-block font-poppins">
      <button
        onClick={() => setOpen(!open)}
        aria-label="Toggle actions menu"
        aria-haspopup="true"
        aria-expanded={open}
        className="rounded-lg p-1.5 text-gray-450 hover:bg-gray-150 hover:text-gray-700 dark:hover:bg-gray-800 dark:hover:text-gray-300 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
      >
        <MoreHorizontal className="h-4 w-4" />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div
            className={`absolute z-20 mt-1 w-36 rounded-xl border border-gray-200 bg-white p-1.5 shadow-lg dark:border-gray-800 dark:bg-gray-900 ${
              isRtl ? "left-0 origin-top-left" : "right-0 origin-top-right"
            }`}
          >
            {onView && (
              <button
                onClick={() => handleAction(onView)}
                className={`flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-850 transition-all font-poppins ${
                  isRtl ? "justify-start text-right" : "justify-start text-left"
                }`}
              >
                <Eye className="h-3.5 w-3.5" />
                <span>{isRtl ? "عرض" : "View"}</span>
              </button>
            )}
            
            {onEdit && (
              <button
                onClick={() => handleAction(onEdit)}
                className={`flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-850 transition-all font-poppins ${
                  isRtl ? "justify-start text-right" : "justify-start text-left"
                }`}
              >
                <Edit2 className="h-3.5 w-3.5" />
                <span>{isRtl ? "تعديل" : "Edit"}</span>
              </button>
            )}

            {onDuplicate && (
              <button
                onClick={() => handleAction(onDuplicate)}
                className={`flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-855 transition-all font-poppins ${
                  isRtl ? "justify-start text-right" : "justify-start text-left"
                }`}
              >
                <Copy className="h-3.5 w-3.5" />
                <span>{isRtl ? "تكرار" : "Duplicate"}</span>
              </button>
            )}

            {onDelete && (
              <button
                onClick={() => handleAction(onDelete)}
                className={`flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-bold text-red-650 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/20 transition-all font-poppins ${
                  isRtl ? "justify-start text-right" : "justify-start text-left"
                }`}
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>{isRtl ? "حذف" : "Delete"}</span>
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}
