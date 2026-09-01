"use client";

import React from "react";
import { useTranslation } from "@/hooks/useTranslation";

interface Option {
  value: string;
  label: string;
  labelAr: string;
}

interface SelectFilterProps {
  value: string;
  onChange: (val: string) => void;
  options: Option[];
  placeholder?: string;
  placeholderAr?: string;
  className?: string;
  label?: string;
}

export default function SelectFilter({
  value,
  onChange,
  options,
  placeholder,
  placeholderAr,
  className = "",
  label,
}: SelectFilterProps) {
  const { isRtl } = useTranslation();

  return (
    <div className={`flex flex-col gap-1 w-full ${className}`}>
      {label && (
        <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 font-poppins">
          {label}
        </label>
      )}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 px-3 text-sm text-gray-800 outline-none transition-all dark:border-gray-700 dark:bg-gray-800 dark:text-white focus:border-indigo-500 focus:bg-white dark:focus:border-indigo-500 font-poppins cursor-pointer"
      >
        {placeholder && (
          <option value="ALL">
            {isRtl ? placeholderAr || "الكل" : placeholder}
          </option>
        )}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {isRtl ? opt.labelAr : opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
