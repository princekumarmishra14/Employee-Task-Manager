/**
 * src/app/docs/page.tsx
 * Production-ready API Documentation console rendering Swagger UI.
 * Integrates directly with ETM branding and includes responsive light/dark theme overrides.
 */

"use client";

import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { ArrowLeft, BookOpen, Layers, ShieldCheck } from "lucide-react";
import { OPENAPI_SPEC_PATH } from "../../lib/openapi";

// Dynamically import SwaggerUI to prevent SSR window reference crashes
const SwaggerUI = dynamic(() => import("swagger-ui-react"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[calc(100vh-80px)] w-full items-center justify-center bg-slate-50 dark:bg-[#0B0F19]">
      <div className="flex flex-col items-center gap-4">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-brand-primary border-t-transparent"></div>
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400 animate-pulse font-poppins">
          Orchestrating ETM API Console...
        </p>
      </div>
    </div>
  ),
});

import "swagger-ui-react/swagger-ui.css";

export default function SwaggerDocsPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 dark:bg-[#0B0F19] dark:text-slate-100 font-poppins transition-colors duration-300">
      {/* Dynamic Header */}
      <header className="sticky top-0 z-50 flex h-20 w-full items-center justify-between border-b border-slate-200 bg-white/80 px-6 backdrop-blur-md dark:border-slate-800 dark:bg-[#0B0F19]/80 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-brand-primary to-indigo-600 shadow-md">
            <BookOpen className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">
              Employee Task Manager
            </h1>
            <p className="text-xs font-semibold text-brand-primary flex items-center gap-1">
              <ShieldCheck className="h-3 w-3" /> API Documentation Portal <span className="rounded-full bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-[10px] text-slate-500 dark:text-slate-400">v1.0.0</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <a
            href={OPENAPI_SPEC_PATH}
            target="_blank"
            rel="noreferrer"
            className="hidden sm:flex items-center gap-2 rounded-lg border border-slate-200 px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800 transition-all cursor-pointer"
          >
            <Layers className="h-4 w-4" />
            Raw OpenAPI JSON
          </a>
          <Link
            href="/dashboard"
            className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-brand-primary to-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-md hover:opacity-90 transition-all"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>
        </div>
      </header>

      {/* Main Console Wrapper */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-slate-200 bg-white shadow-xl dark:border-slate-800 dark:bg-[#0E1526] overflow-hidden">
          <SwaggerUI url={OPENAPI_SPEC_PATH} />
        </div>
      </main>

      {/* Embedded CSS overrides to style Swagger UI to match ETM Premium Design Theme (including full dark mode support) */}
      <style jsx global>{`
        /* Reset and main container styling */
        .swagger-ui {
          font-family: var(--font-poppins), 'Inter', sans-serif !important;
          background: transparent !important;
        }

        .swagger-ui .info {
          padding: 24px !important;
          margin-bottom: 24px !important;
          border-bottom: 1px solid #e2e8f0;
        }

        .swagger-ui .info .title {
          font-size: 28px !important;
          font-weight: 800 !important;
          color: #0f172a !important;
          letter-spacing: -0.025em !important;
        }

        .swagger-ui .info p,
        .swagger-ui .info li,
        .swagger-ui .info table {
          font-size: 14px !important;
          line-height: 1.6 !important;
          color: #475569 !important;
        }

        .swagger-ui .info h3 {
          color: #1e293b !important;
          font-weight: 700 !important;
          margin-top: 16px !important;
        }

        /* Operations/Endpoint Blocks */
        .swagger-ui .opblock {
          border-radius: 12px !important;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05) !important;
          margin-bottom: 12px !important;
          border: 1px solid transparent !important;
          overflow: hidden !important;
        }

        .swagger-ui .opblock-summary {
          padding: 12px 16px !important;
        }

        .swagger-ui .opblock-summary-method {
          font-weight: 800 !important;
          border-radius: 8px !important;
          padding: 6px 12px !important;
          text-transform: uppercase !important;
          font-size: 11px !important;
        }

        .swagger-ui .opblock .opblock-summary-path {
          font-weight: 700 !important;
          color: #1e293b !important;
          font-size: 14px !important;
        }

        .swagger-ui .opblock .opblock-summary-description {
          font-size: 13px !important;
          color: #64748b !important;
        }

        /* Method specific tags (light theme defaults) */
        .swagger-ui .opblock-post { background: #ecfdf5 !important; border-color: #a7f3d0 !important; }
        .swagger-ui .opblock-post .opblock-summary-method { background: #10b981 !important; color: #fff !important; }
        .swagger-ui .opblock-get { background: #eff6ff !important; border-color: #bfdbfe !important; }
        .swagger-ui .opblock-get .opblock-summary-method { background: #3b82f6 !important; color: #fff !important; }
        .swagger-ui .opblock-patch { background: #fffbeb !important; border-color: #fde68a !important; }
        .swagger-ui .opblock-patch .opblock-summary-method { background: #f59e0b !important; color: #fff !important; }
        .swagger-ui .opblock-delete { background: #fff5f5 !important; border-color: #fed7d7 !important; }
        .swagger-ui .opblock-delete .opblock-summary-method { background: #ef4444 !important; color: #fff !important; }

        /* Scheme/Server block */
        .swagger-ui .scheme-container {
          background: #f8fafc !important;
          box-shadow: none !important;
          border-radius: 12px !important;
          border: 1px solid #e2e8f0 !important;
          margin: 24px !important;
          padding: 16px 24px !important;
        }

        /* Buttons & Authorize form */
        .swagger-ui button.btn.authorize {
          border-color: #4f46e5 !important;
          color: #4f46e5 !important;
          border-radius: 8px !important;
          padding: 8px 16px !important;
          font-weight: 700 !important;
          transition: all 0.2s;
        }
        .swagger-ui button.btn.authorize:hover {
          background: #4f46e5 !important;
          color: #ffffff !important;
        }
        .swagger-ui button.btn.authorize svg {
          fill: currentColor !important;
        }

        .swagger-ui .btn {
          border-radius: 8px !important;
          box-shadow: none !important;
          font-weight: 600 !important;
        }

        /* Inputs & Textareas */
        .swagger-ui input[type=text],
        .swagger-ui select {
          border-radius: 6px !important;
          border: 1px solid #cbd5e1 !important;
          padding: 8px 12px !important;
        }

        /* ─── DARK MODE STYLING OVERRIDES ─── */
        .dark .swagger-ui {
          color: #cbd5e1 !important;
        }

        .dark .swagger-ui .info {
          border-bottom-color: #1e293b !important;
        }

        .dark .swagger-ui .info .title {
          color: #ffffff !important;
        }

        .dark .swagger-ui .info p,
        .dark .swagger-ui .info li,
        .dark .swagger-ui .info table,
        .dark .swagger-ui .info-key {
          color: #94a3b8 !important;
        }

        .dark .swagger-ui .info h3,
        .dark .swagger-ui .info h4,
        .dark .swagger-ui .info h5 {
          color: #f1f5f9 !important;
        }

        /* Scheme/Server container in Dark Mode */
        .dark .swagger-ui .scheme-container {
          background: #111827 !important;
          border-color: #1e293b !important;
        }

        .dark .swagger-ui .servers-title {
          color: #ffffff !important;
        }

        /* Dark Mode Endpoint blocks */
        .dark .swagger-ui .opblock .opblock-summary-path {
          color: #f1f5f9 !important;
        }

        .dark .swagger-ui .opblock .opblock-summary-description {
          color: #94a3b8 !important;
        }

        .dark .swagger-ui .opblock-post { background: #064e3b/20 !important; border-color: #064e3b !important; }
        .dark .swagger-ui .opblock-get { background: #1e3a8a/20 !important; border-color: #1e3a8a !important; }
        .dark .swagger-ui .opblock-patch { background: #78350f/20 !important; border-color: #78350f !important; }
        .dark .swagger-ui .opblock-delete { background: #7f1d1d/20 !important; border-color: #7f1d1d !important; }

        /* Dark Mode Authorize Modal */
        .dark .swagger-ui .dialog-ux .modal-ux {
          background: #0e1526 !important;
          border: 1px solid #1e293b !important;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5) !important;
        }

        .dark .swagger-ui .dialog-ux .modal-ux-header h3,
        .dark .swagger-ui .dialog-ux .modal-ux-content h4 {
          color: #ffffff !important;
        }

        .dark .swagger-ui .dialog-ux .modal-ux-content {
          color: #cbd5e1 !important;
        }

        /* Parameters, Table and Headers */
        .dark .swagger-ui section.models h4,
        .dark .swagger-ui .opblock-section-header h4 {
          color: #ffffff !important;
        }

        .dark .swagger-ui .tabli button {
          color: #94a3b8 !important;
        }
        .dark .swagger-ui .tabli.active button {
          color: #ffffff !important;
        }

        .dark .swagger-ui table thead tr td,
        .dark .swagger-ui table thead tr th {
          color: #f1f5f9 !important;
          border-bottom: 2px solid #1e293b !important;
        }

        .dark .swagger-ui .parameter__name {
          color: #f1f5f9 !important;
        }

        .dark .swagger-ui .parameter__type,
        .dark .swagger-ui .parameter__in {
          color: #38bdf8 !important;
        }

        .dark .swagger-ui table tbody tr td {
          border-bottom: 1px solid #1e293b !important;
        }

        /* Response status codes */
        .dark .swagger-ui .response-col_status {
          color: #ffffff !important;
        }

        /* Model schemas / components */
        .dark .swagger-ui .model-title {
          color: #38bdf8 !important;
        }

        .dark .swagger-ui .model {
          color: #e2e8f0 !important;
        }

        .dark .swagger-ui .model-property {
          color: #e2e8f0 !important;
        }

        .dark .swagger-ui .prop-type {
          color: #a78bfa !important;
        }

        .dark .swagger-ui .prop-format {
          color: #94a3b8 !important;
        }

        .dark .swagger-ui .prop-required {
          color: #ef4444 !important;
        }

        /* Models section expansion panel */
        .dark .swagger-ui section.models {
          border-color: #1e293b !important;
          background: #0f172a !important;
        }

        .dark .swagger-ui section.models.is-open {
          border-color: #1e293b !important;
        }

        .dark .swagger-ui section.models.is-open h4 {
          border-bottom-color: #1e293b !important;
        }

        .dark .swagger-ui .model-container {
          background: #111827 !important;
          border-color: #1e293b !important;
        }

        /* Try it out Form inputs in Dark Mode */
        .dark .swagger-ui input[type=text],
        .dark .swagger-ui select,
        .dark .swagger-ui textarea {
          background: #111827 !important;
          color: #ffffff !important;
          border-color: #1e293b !important;
        }

        .dark .swagger-ui input[type=text]:focus,
        .dark .swagger-ui textarea:focus {
          border-color: #4f46e5 !important;
          outline: none;
        }

        /* Highlighting and blocks */
        .dark .swagger-ui .microlight {
          background: #111827 !important;
          color: #10b981 !important;
          border-radius: 8px !important;
          border: 1px solid #1e293b !important;
        }

        .dark .swagger-ui .highlight-code {
          background: #111827 !important;
        }
      `}</style>
    </div>
  );
}
