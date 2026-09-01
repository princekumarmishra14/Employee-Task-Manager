"use client";

import React from "react";
import { Search, X } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";

interface SearchInputProps {
  value: string;
  onChange: (val: string) => void;
  error?: string | null;
  placeholder?: string;
  className?: string;
}

export default function SearchInput({
  value,
  onChange,
  error,
  placeholder,
  className = "",
}: SearchInputProps) {
  const { t, isRtl } = useTranslation();

  return (
    <div className={`flex flex-col gap-1 w-full ${className}`}>
      <div className="relative w-full">
        {/* Search Icon */}
        <div className={`absolute top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 pointer-events-none ${
          isRtl ? "right-3" : "left-3"
        }`}>
          <Search className="h-4.5 w-4.5 shrink-0" />
        </div>

        {/* Input Field */}
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder || (isRtl ? "البحث عن المهام..." : "Search tasks...")}
          className={`w-full rounded-xl border bg-gray-50 py-2.5 text-sm text-gray-900 outline-none transition-all dark:bg-gray-800 dark:text-white font-poppins ${
            isRtl ? "pl-10 pr-10" : "pl-10 pr-10"
          } ${
            error
              ? "border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500"
              : "border-gray-200 focus:border-indigo-500 focus:bg-white dark:border-gray-700 dark:focus:border-indigo-500"
          }`}
        />

        {/* Clear Button */}
        {value && (
          <button
            type="button"
            onClick={() => onChange("")}
            className={`absolute top-1/2 -translate-y-1/2 rounded-full p-0.5 text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-gray-600 dark:hover:text-gray-300 transition-colors ${
              isRtl ? "left-3" : "right-3"
            }`}
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Validation Error Message */}
      {error && (
        <span className="text-xs text-red-500 font-medium px-1 mt-0.5">
          {error}
        </span>
      )}
    </div>
  );
}
