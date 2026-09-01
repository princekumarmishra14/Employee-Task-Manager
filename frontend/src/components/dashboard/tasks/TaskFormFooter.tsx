"use client";

import React from "react";
import { useTranslation } from "@/hooks/useTranslation";
import { Loader2 } from "lucide-react";

interface TaskFormFooterProps {
  onCancel: () => void;
  submitLabel?: string;
  isSubmitting?: boolean;
  isDisabled?: boolean;
}

export default function TaskFormFooter({
  onCancel,
  submitLabel,
  isSubmitting = false,
  isDisabled = false,
}: TaskFormFooterProps) {
  const { isRtl } = useTranslation();

  const label = submitLabel || (isRtl ? "حفظ التغييرات" : "Save Changes");
  const isCreate = label.toLowerCase().includes("create") || label.includes("إنشاء");

  return (
    <div className="flex items-center justify-end gap-2 border-t border-slate-100 dark:border-slate-800 pt-4 mt-4 shrink-0 font-poppins">
      <button
        type="button"
        onClick={onCancel}
        disabled={isSubmitting}
        className="h-9 px-5 text-xs font-semibold rounded-xl text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/50 disabled:opacity-50 transition-all cursor-pointer focus:outline-none active:scale-95 border border-slate-200 dark:border-slate-800"
      >
        {isRtl ? "إلغاء" : "Cancel"}
      </button>

      <button
        type="submit"
        disabled={isSubmitting || isDisabled}
        className={`inline-flex items-center justify-center gap-2 h-9 w-[132px] rounded-xl text-xs font-bold text-white shadow-md shadow-indigo-500/10 transition-all focus:outline-none active:scale-95
          ${(isSubmitting || isDisabled)
            ? "bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed shadow-none"
            : "bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 hover:shadow-lg hover:-translate-y-0.5 cursor-pointer"
          }`}
      >
        {isSubmitting ? (
          <>
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            <span>{isRtl ? "جاري الحفظ..." : "Saving..."}</span>
          </>
        ) : (
          <span>{label}</span>
        )}
      </button>
    </div>
  );
}
