"use client";

import React from "react";
import { useTranslation } from "@/hooks/useTranslation";
import { RefreshCw, ShieldCheck, BarChart3, LineChart, Shield, Activity } from "lucide-react";

export default function FeatureList() {
  const { isRtl } = useTranslation();

  const items = [
    {
      id: "01",
      icon: <RefreshCw className="h-3.5 w-3.5" />,
      miniChart: <Activity className="h-3.5 w-3.5 text-emerald-500/60 ml-auto" />,
      title: isRtl ? "عمليات فورية متزامنة" : "Real-Time Operations",
      description: isRtl 
        ? "مزامنة لحظية للمهام والجدولة بين لوحة التحكم وساحة العمل." 
        : "Live dashboards and activity feeds keep your teams aligned and productive.",
      accentClass: "border-l-4 border-l-emerald-500",
      badgeClass: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
      hoverClass: "hover:border-emerald-500/30 hover:shadow-[0_8px_30px_rgba(16,185,129,0.06)] dark:hover:shadow-[0_8px_30px_rgba(16,185,129,0.15)]",
      iconColor: "text-emerald-500"
    },
    {
      id: "02",
      icon: <ShieldCheck className="h-3.5 w-3.5" />,
      miniChart: <Shield className="h-3.5 w-3.5 text-blue-500/60 ml-auto" />,
      title: isRtl ? "أمن وحماية البيانات" : "Enterprise Security",
      description: isRtl 
        ? "حماية البيانات بتطبيق نظام أمان صارم وتشفير كامل للمعلومات." 
        : "Granular permissions, secure SSO bounds, and full ledger audits active.",
      accentClass: "border-l-4 border-l-blue-500",
      badgeClass: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
      hoverClass: "hover:border-blue-500/30 hover:shadow-[0_8px_30px_rgba(59,130,246,0.06)] dark:hover:shadow-[0_8px_30px_rgba(59,130,246,0.15)]",
      iconColor: "text-blue-500"
    },
    {
      id: "03",
      icon: <BarChart3 className="h-3.5 w-3.5" />,
      miniChart: <LineChart className="h-3.5 w-3.5 text-cyan-500/60 ml-auto" />,
      title: isRtl ? "تحليلات وإحصاءات تنفيذيّة" : "Executive Analytics",
      description: isRtl 
        ? "متابعة كفاءة إنجاز المهام والأقسام عبر مخططات بيانية تفاعلية." 
        : "Powerful reporting and insights to drive strategic business outcomes.",
      accentClass: "border-l-4 border-l-cyan-500",
      badgeClass: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400",
      hoverClass: "hover:border-cyan-500/30 hover:shadow-[0_8px_30px_rgba(6,182,212,0.06)] dark:hover:shadow-[0_8px_30px_rgba(6,182,212,0.15)]",
      iconColor: "text-cyan-500"
    },
  ];

  return (
    <div className="space-y-3 select-none text-left">
      {items.map((item, idx) => (
        <div 
          key={idx} 
          className={`flex items-center gap-3.5 p-3 rounded-[22px] border border-white/45 dark:border-white/10 bg-white/75 dark:bg-slate-900/40 backdrop-blur-[20px] transition-all duration-300 hover:-translate-y-1 ${item.accentClass} ${item.hoverClass}`}
        >
          {/* Number index badge */}
          <span className={`h-7 w-7 shrink-0 rounded-xl flex items-center justify-center text-xs font-black ${item.badgeClass}`}>
            {item.id}
          </span>

          {/* Icon and Description */}
          <div className="flex-1 min-w-0">
            <h4 className="text-xs font-bold text-text-primary leading-tight flex items-center gap-1.5">
              <span className={item.iconColor}>{item.icon}</span>
              <span>{item.title}</span>
            </h4>
            <p className="text-[10px] text-text-muted mt-1 leading-normal font-semibold">
              {item.description}
            </p>
          </div>

          {/* Right mini indicator icon */}
          {item.miniChart}
        </div>
      ))}
    </div>
  );
}
