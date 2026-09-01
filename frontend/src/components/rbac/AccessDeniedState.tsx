"use client";

import React from "react";
import { ShieldAlert } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import Link from "next/link";

export default function AccessDeniedState() {
  const { t } = useTranslation();

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <div className="mb-6 rounded-full bg-red-100 p-4 dark:bg-red-950/50">
        <ShieldAlert className="h-16 w-16 text-red-600 dark:text-red-400 animate-pulse" />
      </div>
      <h1 className="mb-3 text-3xl font-extrabold tracking-tight text-gray-900 dark:text-gray-100 sm:text-4xl">
        {t.accessDeniedTitle}
      </h1>
      <p className="mb-8 max-w-md text-base text-gray-500 dark:text-gray-400">
        {t.accessDeniedDesc}
      </p>
      <div>
        <Link
          href="/dashboard"
          className="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-md transition-all hover:bg-indigo-700 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 active:scale-95 dark:bg-indigo-500 dark:hover:bg-indigo-600"
        >
          {t.accessDeniedBack}
        </Link>
      </div>
    </div>
  );
}
