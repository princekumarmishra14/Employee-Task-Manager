"use client";

import React from "react";
import { Users, TrendingUp, Sparkles, MessageSquare } from "lucide-react";

interface TeamSegmentControlProps {
  activeTab: "all" | "sales" | "marketing" | "cs";
  onTabChange: (tab: "all" | "sales" | "marketing" | "cs") => void;
  isRtl: boolean;
}

export default function TeamSegmentControl({
  activeTab,
  onTabChange,
  isRtl,
}: TeamSegmentControlProps) {
  const tabs = [
    {
      id: "all" as const,
      label: isRtl ? "كل الفرق" : "All Teams",
      icon: <Users className="h-3.5 w-3.5" />,
    },
    {
      id: "sales" as const,
      label: isRtl ? "المبيعات" : "Sales",
      icon: <TrendingUp className="h-3.5 w-3.5" />,
    },
    {
      id: "marketing" as const,
      label: isRtl ? "التسويق" : "Marketing",
      icon: <Sparkles className="h-3.5 w-3.5" />,
    },
    {
      id: "cs" as const,
      label: isRtl ? "نجاح العملاء" : "Customer Success",
      icon: <MessageSquare className="h-3.5 w-3.5" />,
    },
  ];

  const getActiveIndex = () => {
    switch (activeTab) {
      case "all": return 0;
      case "sales": return 1;
      case "marketing": return 2;
      case "cs": return 3;
      default: return 0;
    }
  };

  const activeIndex = getActiveIndex();

  return (
    <div className="overflow-x-auto scrollbar-none max-w-full rounded-[16px] p-0.5">
      <div className="relative flex items-center bg-bg-secondary p-1 rounded-[16px] border border-border-clean bg-bg-primary shadow-sm w-fit select-none font-poppins">
        {/* Sliding Pill Active Backdrop */}
        <div
          className="absolute top-1 bottom-1 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 shadow-md transition-all duration-200 ease-out"
          style={{
            width: "calc(25% - 4px)",
            transform: `translateX(${
              activeIndex === 0
                ? "0%"
                : activeIndex === 1
                ? isRtl ? "-100%" : "100%"
                : activeIndex === 2
                ? isRtl ? "-200%" : "200%"
                : isRtl ? "-300%" : "300%"
            })`,
            left: isRtl ? "auto" : "2px",
            right: isRtl ? "2px" : "auto",
          }}
        />

        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`relative z-10 flex h-9 w-32 items-center justify-center gap-2 rounded-xl text-xs font-bold transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 ${
                isActive
                  ? "text-white"
                  : "text-text-secondary hover:text-text-primary hover:bg-bg-secondary/40"
              }`}
            >
              <span className={`transition-transform duration-200 ${isActive ? "scale-110" : "opacity-80"}`}>
                {tab.icon}
              </span>
              <span className="whitespace-nowrap">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
