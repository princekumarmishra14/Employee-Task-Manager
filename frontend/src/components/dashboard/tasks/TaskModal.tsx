"use client";

import React, { useEffect } from "react";
import { X } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import TaskForm from "./TaskForm";

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  mode?: "create" | "edit";
  initialData?: any;
}

export default function TaskModal({
  isOpen,
  onClose,
  onSubmit,
  mode = "create",
  initialData,
}: TaskModalProps) {
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

  // Handle ESC key press to close modal
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

  const titleText = mode === "create" 
    ? (isRtl ? "إنشاء مهمة جديدة" : "Create New Task")
    : (isRtl ? "تعديل بيانات المهمة" : "Edit Task");

  const submitLabelText = mode === "create"
    ? (isRtl ? "إنشاء مهمة" : "Create Task")
    : (isRtl ? "حفظ التغييرات" : "Save Changes");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/35 backdrop-blur-[20px] animate-fade-in font-poppins">
      {/* Backdrop clickable */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Modal Dialog Box */}
      <div className="relative w-full max-w-xl rounded-2xl bg-white p-5 shadow-2xl dark:bg-slate-900 border border-slate-100 dark:border-slate-800 transition-all scale-100 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4 mb-4 shrink-0">
          <div>
            <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight leading-none">
              {titleText}
            </h3>
            <p className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 mt-1">
              {isRtl ? "إسناد مهمة جديدة لفريق العمل." : "Assign work to your team member."}
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label={isRtl ? "إغلاق" : "Close modal"}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-white transition-colors focus:outline-none cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Form Body */}
        <div className="flex-1 overflow-y-auto max-h-[64vh] px-1 py-1">
          <TaskForm
            initialData={initialData}
            onSubmit={onSubmit}
            onCancel={onClose}
            submitLabel={submitLabelText}
          />
        </div>
      </div>
    </div>
  );
}
