"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { ChevronLeft, ChevronRight, CalendarDays, X } from "lucide-react";

interface CalendarPickerProps {
  value: string; // ISO date string or ""
  onChange: (isoDate: string) => void;
  placeholder?: string;
  hasError?: boolean;
  disabled?: boolean;
  minDate?: Date; // Defaults to today (past dates disabled)
}

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const DAYS_OF_WEEK = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number): number {
  return new Date(year, month, 1).getDay();
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function formatDisplay(isoDate: string): string {
  if (!isoDate) return "";
  const d = new Date(isoDate);
  return d.toLocaleDateString("en-US", {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function CalendarPicker({
  value,
  onChange,
  placeholder = "Select due date...",
  hasError = false,
  disabled = false,
  minDate,
}: CalendarPickerProps) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const effectiveMin = minDate ?? today;

  const selectedDate = value ? new Date(value) : null;

  const [isOpen, setIsOpen] = useState(false);
  const [viewYear, setViewYear] = useState(
    selectedDate?.getFullYear() ?? today.getFullYear()
  );
  const [viewMonth, setViewMonth] = useState(
    selectedDate?.getMonth() ?? today.getMonth()
  );

  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [isOpen]);

  // Keyboard: Escape closes
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [isOpen]);

  // Sync viewMonth/Year when value changes externally
  useEffect(() => {
    if (selectedDate) {
      setViewYear(selectedDate.getFullYear());
      setViewMonth(selectedDate.getMonth());
    }
  }, [value]);

  const prevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const nextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  const handleSelectDate = useCallback(
    (day: number) => {
      const picked = new Date(viewYear, viewMonth, day);
      picked.setHours(12, 0, 0, 0); // noon UTC-safe
      if (picked < effectiveMin) return;
      onChange(picked.toISOString());
      setIsOpen(false);
    },
    [viewYear, viewMonth, effectiveMin, onChange]
  );

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange("");
  };

  // Build days grid
  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDay = getFirstDayOfMonth(viewYear, viewMonth);
  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  // Pad to complete last row
  while (cells.length % 7 !== 0) cells.push(null);

  const displayText = value ? formatDisplay(value) : "";

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Trigger Button */}
      <button
        ref={triggerRef}
        type="button"
        onClick={() => !disabled && setIsOpen((o) => !o)}
        disabled={disabled}
        className={`w-full flex items-center justify-between gap-2 h-[42px] rounded-xl border px-4 text-sm transition-all outline-none shadow-sm
          ${hasError
            ? "border-red-500 bg-red-50/10 focus:border-red-500 focus:ring-2 focus:ring-red-500/15"
            : isOpen
            ? "border-indigo-500 bg-white dark:bg-slate-900 ring-2 ring-indigo-500/10"
            : "border-slate-200 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-950/20 hover:border-indigo-500/50 hover:bg-white dark:hover:bg-slate-900"
          }
          ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
        `}
      >
        <div className="flex items-center gap-2 min-w-0">
          <CalendarDays className={`h-4 w-4 shrink-0 ${displayText ? "text-indigo-500" : "text-slate-400"}`} />
          <span className={`truncate font-semibold text-left ${displayText ? "text-slate-800 dark:text-slate-100" : "text-slate-400 dark:text-slate-500"} text-sm`}>
            {displayText || placeholder}
          </span>
        </div>
        <div className="flex items-center gap-1">
          {value && (
            <span
              onClick={handleClear}
              role="button"
              aria-label="Clear date"
              className="p-0.5 rounded-full text-text-muted hover:text-status-danger hover:bg-status-danger-bg transition-all"
            >
              <X className="h-3 w-3" />
            </span>
          )}
        </div>
      </button>

      {/* Dropdown Calendar Panel */}
      {isOpen && (
        <div
          className="absolute top-full left-0 mt-1 z-50 w-[280px] rounded-2xl border border-border-clean bg-bg-primary shadow-2xl p-4 animate-in fade-in duration-150"
          role="dialog"
          aria-label="Calendar date picker"
        >
          {/* Month + Year Navigation */}
          <div className="flex items-center justify-between mb-3 gap-2">
            <button
              type="button"
              onClick={prevMonth}
              className="h-7 w-7 flex items-center justify-center rounded-lg text-text-secondary hover:bg-bg-tertiary transition-all focus:outline-none"
              aria-label="Previous month"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            <div className="flex items-center gap-1 flex-1 justify-center">
              <select
                value={viewMonth}
                onChange={(e) => setViewMonth(parseInt(e.target.value, 10))}
                className="text-xs font-black text-text-primary bg-transparent outline-none cursor-pointer border-none p-0 focus:ring-0 text-center uppercase tracking-wide"
              >
                {MONTHS.map((m, idx) => (
                  <option key={m} value={idx} className="bg-bg-primary text-text-primary text-xs">
                    {m}
                  </option>
                ))}
              </select>

              <select
                value={viewYear}
                onChange={(e) => setViewYear(parseInt(e.target.value, 10))}
                className="text-xs font-black text-brand-primary bg-transparent outline-none cursor-pointer border-none p-0 focus:ring-0 text-center"
              >
                {Array.from({ length: 20 }, (_, i) => today.getFullYear() + i).map((y) => (
                  <option key={y} value={y} className="bg-bg-primary text-text-primary text-xs">
                    {y}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              onClick={nextMonth}
              className="h-7 w-7 flex items-center justify-center rounded-lg text-text-secondary hover:bg-bg-tertiary transition-all focus:outline-none"
              aria-label="Next month"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          {/* Days of Week Headers */}
          <div className="grid grid-cols-7 mb-1">
            {DAYS_OF_WEEK.map((d) => (
              <div
                key={d}
                className="text-center text-[9px] font-black text-text-muted uppercase py-1"
              >
                {d}
              </div>
            ))}
          </div>

          {/* Date Grid */}
          <div className="grid grid-cols-7 gap-0.5">
            {cells.map((day, idx) => {
              if (!day) {
                return <div key={`empty-${idx}`} />;
              }

              const cellDate = new Date(viewYear, viewMonth, day);
              cellDate.setHours(0, 0, 0, 0);
              const isPast = cellDate < effectiveMin;
              const isSelected = selectedDate ? isSameDay(cellDate, selectedDate) : false;
              const isToday = isSameDay(cellDate, today);

              return (
                <button
                  key={day}
                  type="button"
                  disabled={isPast}
                  onClick={() => !isPast && handleSelectDate(day)}
                  aria-label={`${day} ${MONTHS[viewMonth]} ${viewYear}`}
                  aria-pressed={isSelected}
                  className={`
                    h-8 w-full flex items-center justify-center rounded-lg text-xs font-bold transition-all focus:outline-none
                    ${isPast
                      ? "text-text-muted opacity-30 cursor-not-allowed"
                      : isSelected
                      ? "bg-brand-primary text-white shadow-sm scale-105"
                      : isToday
                      ? "border border-brand-primary text-brand-primary bg-brand-muted font-black"
                      : "text-text-primary hover:bg-brand-muted hover:text-brand-primary cursor-pointer"
                    }
                  `}
                >
                  {day}
                </button>
              );
            })}
          </div>

          {/* Footer — Today shortcut */}
          <div className="mt-3 pt-3 border-t border-border-clean flex justify-between items-center">
            <button
              type="button"
              onClick={() => {
                setViewYear(today.getFullYear());
                setViewMonth(today.getMonth());
              }}
              className="text-[10px] font-bold text-text-muted hover:text-brand-primary transition-colors focus:outline-none uppercase tracking-wide"
            >
              Today
            </button>
            {selectedDate && (
              <span className="text-[10px] font-bold text-brand-primary">
                {formatDisplay(value)}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
