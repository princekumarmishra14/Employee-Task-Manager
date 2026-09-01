"use client";

import React, { useEffect, useState, createContext, useContext, useCallback } from "react";
import { CheckCircle2, XCircle, Info, X, AlertTriangle } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────
type ToastVariant = "success" | "error" | "info" | "warning";

interface Toast {
  id: string;
  message: string;
  variant: ToastVariant;
}

interface ToastContextValue {
  toast: (message: string, variant?: ToastVariant) => void;
}

// ─── Context ──────────────────────────────────────────────────────────────────
const ToastContext = createContext<ToastContextValue | null>(null);

// ─── Hook ─────────────────────────────────────────────────────────────────────
export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within <ToastProvider>");
  return ctx;
}

// ─── Individual Toast Item ────────────────────────────────────────────────────
function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: (id: string) => void }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Animate in
    requestAnimationFrame(() => setVisible(true));
    // Auto dismiss
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(() => onDismiss(toast.id), 300);
    }, 3500);
    return () => clearTimeout(timer);
  }, [toast.id, onDismiss]);

  const config = {
    success: {
      icon: <CheckCircle2 className="h-4 w-4 shrink-0" />,
      bg: "bg-status-success-bg border-status-success/30 text-status-success",
      bar: "bg-status-success",
    },
    error: {
      icon: <XCircle className="h-4 w-4 shrink-0" />,
      bg: "bg-status-danger-bg border-status-danger/30 text-status-danger",
      bar: "bg-status-danger",
    },
    warning: {
      icon: <AlertTriangle className="h-4 w-4 shrink-0" />,
      bg: "bg-status-warning-bg border-status-warning/30 text-status-warning",
      bar: "bg-status-warning",
    },
    info: {
      icon: <Info className="h-4 w-4 shrink-0" />,
      bg: "bg-status-info-bg border-status-info/30 text-status-info",
      bar: "bg-status-info",
    },
  };

  const c = config[toast.variant];

  return (
    <div
      role="alert"
      aria-live="assertive"
      className={`relative w-full max-w-sm overflow-hidden rounded-xl border shadow-lg backdrop-blur-sm transition-all duration-300 ${c.bg} ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
      }`}
    >
      {/* Progress bar */}
      <div className={`absolute bottom-0 left-0 h-0.5 w-full ${c.bar} opacity-40 animate-shrink-progress`} />

      <div className="flex items-start gap-3 p-3.5 pr-4">
        <span className="mt-0.5">{c.icon}</span>
        <p className="flex-1 text-sm font-semibold leading-snug">{toast.message}</p>
        <button
          onClick={() => {
            setVisible(false);
            setTimeout(() => onDismiss(toast.id), 300);
          }}
          aria-label="Dismiss notification"
          className="ml-auto rounded-md p-0.5 opacity-70 hover:opacity-100 transition-opacity focus:outline-none"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}

// ─── Provider ─────────────────────────────────────────────────────────────────
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback((message: string, variant: ToastVariant = "success") => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, message, variant }]);
  }, []);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      {/* Toast portal — fixed bottom-right */}
      <div
        aria-label="Notifications"
        className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-2.5 items-end pointer-events-none"
      >
        {toasts.map((t) => (
          <div key={t.id} className="pointer-events-auto w-full">
            <ToastItem toast={t} onDismiss={dismiss} />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
