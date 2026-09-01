"use client";

import React from "react";
import { useTranslation } from "@/hooks/useTranslation";
import { Activity, Users, Building2, Zap } from "lucide-react";

export default function Metrics() {
  const { isRtl } = useTranslation();

  const data = [
    { 
      value: "99.99%", 
      label: isRtl ? "جاهزية النظام" : "Uptime", 
      icon: <Activity className="h-3 w-3 text-emerald-500" />,
      bgClass: "bg-emerald-500/[0.06] dark:bg-emerald-500/[0.12] border-emerald-500/15",
      textClass: "text-emerald-700 dark:text-emerald-400"
    },
    { 
      value: "100K+", 
      label: isRtl ? "مهام منجزة" : "Tasks Managed", 
      icon: <Users className="h-3 w-3 text-blue-500" />,
      bgClass: "bg-blue-500/[0.06] dark:bg-blue-500/[0.12] border-blue-500/15",
      textClass: "text-blue-700 dark:text-blue-400"
    },
    { 
      value: "250+", 
      label: isRtl ? "المؤسسات" : "Organizations", 
      icon: <Building2 className="h-3 w-3 text-purple-500" />,
      bgClass: "bg-purple-500/[0.06] dark:bg-purple-500/[0.12] border-purple-500/15",
      textClass: "text-purple-700 dark:text-purple-400"
    },
    { 
      value: "5M+", 
      label: isRtl ? "الأنشطة" : "Activities", 
      icon: <Zap className="h-3 w-3 text-amber-500" />,
      bgClass: "bg-amber-500/[0.06] dark:bg-amber-500/[0.12] border-amber-500/15",
      textClass: "text-amber-700 dark:text-amber-400"
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 select-none text-left">
      {data.map((item, idx) => (
        <div 
          key={idx} 
          className={`flex flex-col justify-between p-2.5 rounded-xl border backdrop-blur-md transition-all duration-300 hover:-translate-y-0.5 ${item.bgClass}`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-black text-text-muted uppercase tracking-wider">
              {item.label}
            </span>
            {item.icon}
          </div>
          <span className={`text-base lg:text-lg font-black tracking-tight leading-none mt-2 ${item.textClass}`}>
            {item.value}
          </span>
        </div>
      ))}
    </div>
  );
}
