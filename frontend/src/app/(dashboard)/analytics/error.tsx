"use client";

import React, { useEffect } from "react";
import { AlertCircle, RotateCcw } from "lucide-react";

interface AnalyticsErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function AnalyticsError({ error, reset }: AnalyticsErrorProps) {
  useEffect(() => {
    console.error("Analytics render error:", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4 font-poppins">
      <div className="rounded-2xl bg-status-danger-bg border border-status-danger/20 p-8 text-center max-w-sm shadow-sm">
        <AlertCircle className="h-10 w-10 text-status-danger mx-auto mb-3" />
        <h2 className="text-lg font-black text-text-primary">Analytics Module Error</h2>
        <p className="text-xs text-text-muted mt-1 mb-4 leading-relaxed">
          {error.message || "Failed to load corporate analytics pipelines. Please try again."}
        </p>
        <button
          onClick={reset}
          className="inline-flex items-center gap-2 rounded-xl bg-brand-primary px-4 py-2.5 text-xs font-black text-white hover:bg-brand-secondary transition-all shadow-md focus:outline-none active:scale-95 cursor-pointer"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Retry Pipeline
        </button>
      </div>
    </div>
  );
}
