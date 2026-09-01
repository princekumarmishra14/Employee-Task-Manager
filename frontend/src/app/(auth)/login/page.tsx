"use client";

import React, { Suspense } from "react";
import { Loader2 } from "lucide-react";

// ─── Welcome & Login Portal Redesigned Components ─────────────────────────────
import LoginLayout from "@/components/login/LoginLayout";
import LoginForm from "@/components/login/LoginForm";
import LoginPromoPanel from "@/components/login/LoginPromoPanel";
import TopToolbar from "@/components/login/TopToolbar";
import Footer from "@/components/login/Footer";
import { useTranslation } from "@/hooks/useTranslation";

function WelcomeLoginPageContent() {
  const { isRtl } = useTranslation();

  return (
    <LoginLayout>
      {/* ── Header Floating Toolbar ── */}
      <header className="w-full max-w-none px-6 sm:px-10 lg:px-16 py-3 flex justify-between items-center relative z-20 select-none shrink-0 h-16">
        {/* Left: Brand logo details (fallback for mobile/header if needed) */}
        <div className="flex items-center gap-2 select-none">
          <div className="h-7 w-7 rounded-lg bg-[#3B42E3] flex items-center justify-center shadow-md">
            <svg className="h-4.5 w-4.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 11l3 3L22 4" />
              <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
            </svg>
          </div>
          <span className="text-lg font-black tracking-tight text-[#3B42E3] uppercase">
            Employee Task Manager
          </span>
        </div>

        {/* Right: Consolidated toolbar utilities */}
        <TopToolbar />
      </header>

      {/* ── Center Unified Login Portal Card ── */}
      <main className="flex-1 w-full max-w-none px-4 sm:px-6 lg:px-16 py-6 flex items-center justify-center relative z-10">
        <div className="w-full max-w-[1024px] bg-white dark:bg-slate-900 rounded-[28px] shadow-[0_24px_60px_rgba(99,102,241,0.08)] border border-slate-200/50 dark:border-slate-800/50 p-4 sm:p-5 grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-6 items-stretch min-h-[640px] transition-all duration-300">
          
          {/* LEFT COLUMN: Input Form & Brand Logo */}
          <div className="flex flex-col justify-between p-6 sm:p-10 lg:p-12">
            {/* Logo from mockup */}
            <div className="flex items-center gap-2.5 select-none mb-6 lg:mb-0">
              <div className="h-8 w-8 rounded-lg bg-[#3B42E3] flex items-center justify-center shadow-md">
                <svg className="h-5 w-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 11l3 3L22 4" />
                  <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
                </svg>
              </div>
              <span className="text-2xl font-extrabold tracking-tight text-slate-850 dark:text-white">
                Employee Task Manager
              </span>
            </div>

            {/* Form Section */}
            <div className="my-auto py-6">
              <div className="space-y-1.5 mb-7 select-none">
                <h2 className="text-3xl font-black text-text-primary tracking-tight">
                  {isRtl ? "مرحباً بك مجدداً!" : "Welcome Back!"}
                </h2>
                <p className="text-sm font-semibold text-text-muted">
                  {isRtl ? "الرجاء إدخال تفاصيل تسجيل الدخول أدناه" : "Please enter login details below"}
                </p>
              </div>

              <LoginForm isRtl={isRtl} />
            </div>
          </div>

          {/* RIGHT COLUMN: Interactive Feature Panel */}
          <div className="hidden lg:block bg-[#7B80FC] dark:bg-gradient-to-br dark:from-[#1E293B] dark:to-[#0F172A] dark:border dark:border-slate-800 rounded-[24px] relative overflow-hidden">
            <div className="absolute -top-12 -right-12 w-32 h-32 rounded-full bg-white/5 blur-xl" />
            <div className="absolute -bottom-16 -left-16 w-48 h-48 rounded-full bg-white/5 blur-2xl" />
            <LoginPromoPanel />
          </div>

        </div>
      </main>

      {/* ── Footer copyright strip ── */}
      <footer className="w-full max-w-none px-6 sm:px-10 lg:px-16 py-3.5 shrink-0">
        <Footer />
      </footer>
    </LoginLayout>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen w-full items-center justify-center bg-bg-primary dark:bg-[#060A17]">
        <Loader2 className="h-8 w-8 animate-spin text-brand-primary" />
      </div>
    }>
      <WelcomeLoginPageContent />
    </Suspense>
  );
}
