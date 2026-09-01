"use client";

import React from "react";
import { AlertTriangle, X } from "lucide-react";

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "warning" | "info";
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "danger",
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!isOpen) return null;

  const variantStyles = {
    danger: {
      icon: "bg-status-danger-bg text-status-danger",
      btn: "bg-status-danger hover:bg-red-600 focus-visible:ring-status-danger",
    },
    warning: {
      icon: "bg-status-warning-bg text-status-warning",
      btn: "bg-status-warning hover:bg-amber-600 focus-visible:ring-status-warning",
    },
    info: {
      icon: "bg-brand-muted text-brand-primary",
      btn: "bg-brand-primary hover:bg-brand-secondary focus-visible:ring-brand-primary",
    },
  };

  const s = variantStyles[variant];

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") onCancel();
  };

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      onKeyDown={handleKeyDown}
      aria-modal="true"
      role="dialog"
      aria-labelledby="confirm-dialog-title"
      aria-describedby="confirm-dialog-message"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
        onClick={onCancel}
      />

      {/* Dialog Box */}
      <div className="relative z-10 w-full max-w-sm rounded-2xl border border-border-clean bg-bg-primary shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        {/* Close button */}
        <button
          onClick={onCancel}
          aria-label="Close dialog"
          className="absolute top-3 right-3 rounded-lg p-1 text-text-muted hover:bg-bg-tertiary hover:text-text-primary transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="p-6">
          {/* Icon */}
          <div className={`mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full ${s.icon}`}>
            <AlertTriangle className="h-6 w-6" />
          </div>

          {/* Content */}
          <h3
            id="confirm-dialog-title"
            className="text-center text-base font-black text-text-primary mb-2"
          >
            {title}
          </h3>
          <p
            id="confirm-dialog-message"
            className="text-center text-sm text-text-secondary leading-relaxed"
          >
            {message}
          </p>

          {/* Actions */}
          <div className="mt-6 flex gap-3">
            <button
              onClick={onCancel}
              className="flex-1 rounded-xl border border-border-clean py-2.5 text-sm font-bold text-text-primary hover:bg-bg-tertiary transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-border-clean"
            >
              {cancelLabel}
            </button>
            <button
              onClick={onConfirm}
              autoFocus
              className={`flex-1 rounded-xl py-2.5 text-sm font-bold text-white transition-all shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${s.btn}`}
            >
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
