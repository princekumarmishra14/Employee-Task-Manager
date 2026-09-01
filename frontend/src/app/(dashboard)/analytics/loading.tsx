"use client";

import React from "react";

export default function AnalyticsLoading() {
  return (
    <div className="space-y-6 font-poppins animate-pulse">
      {/* Header Skeleton */}
      <div className="space-y-2">
        <div className="h-8 w-48 rounded-lg bg-bg-tertiary" />
        <div className="h-4 w-72 rounded-lg bg-bg-tertiary" />
      </div>

      {/* KPI Cards Grid Skeleton */}
      <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="rounded-2xl border border-border-clean bg-bg-primary p-4 shadow-sm space-y-3">
            <div className="flex justify-between items-center">
              <div className="h-3.5 w-20 rounded bg-bg-tertiary" />
              <div className="h-4.5 w-4.5 rounded bg-bg-tertiary" />
            </div>
            <div className="h-7 w-12 rounded bg-bg-tertiary" />
          </div>
        ))}
      </div>

      {/* Charts Grid Skeleton */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="rounded-2xl border border-border-clean bg-bg-primary p-5 shadow-sm space-y-4">
            <div className="flex justify-between items-center">
              <div className="h-4 w-36 rounded bg-bg-tertiary" />
              <div className="h-3 w-8 rounded bg-bg-tertiary" />
            </div>
            <div className="h-44 w-full rounded-xl bg-bg-tertiary" />
          </div>
        ))}
      </div>
    </div>
  );
}
