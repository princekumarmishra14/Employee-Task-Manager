"use client";

import React, { useState } from "react";
import { Bookmark, ChevronDown } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import { SAVED_FILTERS } from "@/constants/taskFilter.constants";

interface SavedFilterDropdownProps {
  onSelectPreset: (presetId: string) => void;
  activePresetId?: string | null;
}

export default function SavedFilterDropdown({
  onSelectPreset,
  activePresetId,
}: SavedFilterDropdownProps) {
  const { isRtl } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = (id: string) => {
    onSelectPreset(id);
    setIsOpen(false);
  };

  const activePreset = SAVED_FILTERS.find((f: any) => f.id === activePresetId);

  return (
    <div className="relative font-poppins">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex w-full items-center justify-between gap-1.5 rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-750 transition-all cursor-pointer"
      >
        <div className="flex items-center gap-1.5 min-w-0">
          <Bookmark className="h-4 w-4 shrink-0 text-indigo-500" />
          <span className="truncate">
            {activePreset
              ? (isRtl ? activePreset.nameAr : activePreset.name)
              : (isRtl ? "الفلاتر المحفوظة" : "Saved Filters")}
          </span>
        </div>
        <ChevronDown className="h-4 w-4 shrink-0 text-gray-400" />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className={`absolute z-20 mt-1.5 w-56 rounded-xl border border-gray-150 bg-white p-1.5 shadow-lg dark:border-gray-800 dark:bg-gray-900 ${
            isRtl ? "left-0" : "right-0"
          }`}>
            <div className="px-2.5 py-1.5 text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest border-b border-gray-100 dark:border-gray-800 mb-1">
              {isRtl ? "اختر فلتراً محفوظاً" : "Select Filter Preset"}
            </div>
            <div className="space-y-0.5">
              {SAVED_FILTERS.map((preset: any) => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => handleSelect(preset.id)}
                  className={`w-full rounded-lg px-2.5 py-2 text-left text-xs font-semibold transition-colors hover:bg-gray-50 dark:hover:bg-gray-850 ${
                    isRtl ? "text-right" : "text-left"
                  } ${
                    activePresetId === preset.id
                      ? "bg-indigo-50 text-indigo-650 dark:bg-indigo-950/45 dark:text-indigo-400"
                      : "text-gray-700 dark:text-gray-300"
                  }`}
                >
                  {isRtl ? preset.nameAr : preset.name}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
