"use client";

import React, { useEffect } from "react";
import { AlertTriangle } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  description?: string;
}

export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
}: ConfirmDialogProps) {
  const { isRtl } = useTranslation();

  // Prevent background scrolling when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Escape key support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in font-poppins">
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-gray-900 border border-gray-200 dark:border-gray-800 scale-100 transition-all">
        <div className="flex gap-4">
          <div className="rounded-full bg-red-50 p-3 text-red-550 dark:bg-red-950/20 dark:text-red-400 h-12 w-12 shrink-0 flex items-center justify-center">
            <AlertTriangle className="h-6 w-6" />
          </div>

          <div className="space-y-1.5 flex-1">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              {title || (isRtl ? "حذف المهمة" : "Delete Task")}
            </h3>
            <p className="text-xs font-semibold text-gray-550 dark:text-gray-400 leading-relaxed">
              {description ||
                (isRtl
                  ? "هل أنت متأكد أنك تريد حذف هذه المهمة؟ لا يمكن التراجع عن هذا الإجراء."
                  : "Are you sure you want to delete this task? This action cannot be undone.")}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 mt-6 border-t border-gray-100 pt-4 dark:border-gray-800">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-xs font-bold text-gray-700 shadow-sm hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-750 transition-colors cursor-pointer"
          >
            {isRtl ? "إلغاء" : "Cancel"}
          </button>
          
          <button
            type="button"
            onClick={onConfirm}
            className="rounded-xl bg-red-600 px-4 py-2.5 text-xs font-bold text-white shadow-md hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-650 transition-colors cursor-pointer"
          >
            {isRtl ? "تأكيد الحذف" : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}
