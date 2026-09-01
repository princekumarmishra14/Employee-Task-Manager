"use client";

import React from "react";
import Link from "next/link";
import { useTranslation } from "@/hooks/useTranslation";
import LoginCard from "./LoginCard";
import LoginForm from "./LoginForm";

export default function AuthPanel() {
  const { isRtl } = useTranslation();

  return (
    <div className="w-full flex flex-col justify-center items-center h-full min-w-0">
      <LoginCard>
        {/* Title Header inside the Card */}
        <div className="text-center space-y-1 select-none mb-6">
          <h2 className="text-lg sm:text-xl font-black text-text-primary tracking-tight uppercase leading-none">
            {isRtl ? "مرحباً بك مجدداً 👋" : "Welcome Back! 👋"}
          </h2>
          <p className="text-[9px] font-black text-text-muted uppercase tracking-widest leading-none mt-1.5">
            {isRtl ? "سجل الدخول للوصول إلى حسابك المؤسسي" : "Sign in to access your enterprise account"}
          </p>
        </div>

        {/* Credentials form */}
        <LoginForm isRtl={isRtl} />

        {/* Alternative Sign up links */}
        <div className="text-center pt-3.5 border-t border-[rgba(148,163,184,0.12)] select-none mt-3.5">
          <p className="text-[10px] font-bold text-text-secondary leading-none">
            {isRtl ? "ليس لديك حساب؟" : "Don't have an account?"}{" "}
            <Link
              href="/signup"
              className="font-black text-brand-primary hover:text-brand-secondary transition-colors"
            >
              {isRtl ? "إنشاء حساب جديد" : "Create Account"}
            </Link>
          </p>
        </div>
      </LoginCard>
    </div>
  );
}
