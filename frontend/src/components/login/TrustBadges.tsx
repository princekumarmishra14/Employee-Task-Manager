"use client";

import React from "react";
import { useTranslation } from "@/hooks/useTranslation";
import { Award, ShieldCheck, Globe, Key, Lock } from "lucide-react";

export default function TrustBadges() {
  const { isRtl } = useTranslation();

  const badges = [
    {
      icon: <Award className="h-3.5 w-3.5 text-indigo-500 dark:text-indigo-400" />,
      title: "SOC 2",
      desc: isRtl ? "فئة ٢" : "Type II",
      bgClass: "bg-indigo-500/[0.04] dark:bg-indigo-500/[0.08] border-indigo-500/10",
      glowClass: "shadow-[0_0_8px_rgba(99,102,241,0.05)]"
    },
    {
      icon: <ShieldCheck className="h-3.5 w-3.5 text-emerald-500 dark:text-emerald-400" />,
      title: "ISO 27001",
      desc: isRtl ? "مصدق" : "Certified",
      bgClass: "bg-emerald-500/[0.04] dark:bg-emerald-500/[0.08] border-emerald-500/10",
      glowClass: "shadow-[0_0_8px_rgba(16,185,129,0.05)]"
    },
    {
      icon: <Globe className="h-3.5 w-3.5 text-cyan-500 dark:text-cyan-400" />,
      title: "GDPR",
      desc: isRtl ? "مطابق" : "Compliant",
      bgClass: "bg-cyan-500/[0.04] dark:bg-cyan-500/[0.08] border-cyan-500/10",
      glowClass: "shadow-[0_0_8px_rgba(6,182,212,0.05)]"
    },
    {
      icon: <Key className="h-3.5 w-3.5 text-amber-500 dark:text-amber-400" />,
      title: "SSO",
      desc: isRtl ? "نشط" : "Enabled",
      bgClass: "bg-amber-500/[0.04] dark:bg-amber-500/[0.08] border-amber-500/10",
      glowClass: "shadow-[0_0_8px_rgba(245,158,11,0.05)]"
    },
    {
      icon: <Lock className="h-3.5 w-3.5 text-purple-500 dark:text-purple-400" />,
      title: "AES-256",
      desc: isRtl ? "مشفر" : "Encrypted",
      bgClass: "bg-purple-500/[0.04] dark:bg-purple-500/[0.08] border-purple-500/10",
      glowClass: "shadow-[0_0_8px_rgba(168,85,247,0.05)]"
    },
  ];

  return (
    <div className="space-y-2 select-none text-center md:text-left">
      <p className="text-[8px] font-black text-text-muted uppercase tracking-widest text-center">
        {isRtl ? "موثوق وآمن" : "TRUSTED & SECURE"}
      </p>

      <div className="grid grid-cols-5 gap-1.5">
        {badges.map((badge, idx) => (
          <div 
            key={idx} 
            className={`flex flex-col items-center justify-center p-1.5 rounded-xl border backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 ${badge.bgClass} ${badge.glowClass}`}
          >
            {badge.icon}
            <span className="text-[8px] font-black text-text-primary mt-1 leading-none text-center">
              {badge.title}
            </span>
            <span className="text-[6.5px] font-bold text-text-muted mt-0.5 leading-none text-center">
              {badge.desc}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
