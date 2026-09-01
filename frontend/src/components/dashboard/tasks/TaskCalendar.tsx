"use client";

import React, { useState } from "react";
import { ChevronLeft, ChevronRight, AlertCircle, Clock } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import { Task } from "@/types/task.types";

interface TaskCalendarProps {
  tasks: Task[];
  onView?: (task: Task) => void;
}

export default function TaskCalendar({ tasks, onView }: TaskCalendarProps) {
  const { t, isRtl } = useTranslation();
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Navigation handlers
  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  // Monthly grid configurations
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const totalDaysInMonth = new Date(year, month + 1, 0).getDate();

  // Days array
  const dayNames = isRtl
    ? ["الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"]
    : ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const monthNamesEn = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const monthNamesAr = [
    "يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو",
    "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"
  ];

  const monthName = isRtl ? monthNamesAr[month] : monthNamesEn[month];

  // Grid cells generator
  const cells: (Date | null)[] = [];
  
  // Fill blank cells for previous month offsets
  for (let i = 0; i < firstDayOfMonth; i++) {
    cells.push(null);
  }

  // Fill actual month dates
  for (let day = 1; day <= totalDaysInMonth; day++) {
    cells.push(new Date(year, month, day));
  }

  // Filter tasks due on a specific calendar date
  const getTasksForDate = (date: Date) => {
    return tasks.filter((task) => {
      if (task.isDeleted) return false;
      const taskDate = new Date(task.dueDate);
      return (
        taskDate.getDate() === date.getDate() &&
        taskDate.getMonth() === date.getMonth() &&
        taskDate.getFullYear() === date.getFullYear()
      );
    });
  };

  const getPriorityColor = (prio: string) => {
    switch (prio) {
      case "LOW": return "bg-bg-tertiary text-text-secondary border-border-clean";
      case "MEDIUM": return "bg-status-info-bg text-status-info border-status-info/10";
      case "HIGH": return "bg-status-warning-bg text-status-warning border-status-warning/10";
      case "ESCALATED": return "bg-status-danger-bg text-status-danger border-status-danger/10";
      default: return "bg-bg-secondary text-text-secondary border-border-clean";
    }
  };

  return (
    <div className="rounded-2xl border border-border-clean bg-bg-primary p-5 shadow-sm font-poppins transition-colors duration-300">
      
      {/* Calendar Controller Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5 border-b border-border-clean/50 pb-4">
        <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider flex items-center gap-2">
          <Clock className="h-4.5 w-4.5 text-brand-primary" />
          <span>{monthName} {year}</span>
        </h3>
        
        <div className="flex items-center gap-2">
          <button
            onClick={handleToday}
            className="rounded-xl border border-border-clean bg-bg-secondary px-3 py-1.5 text-xs font-bold text-text-secondary hover:bg-bg-tertiary transition-all focus:outline-none"
          >
            {isRtl ? "اليوم" : "Today"}
          </button>
          <div className="flex items-center gap-1 rounded-xl border border-border-clean bg-bg-primary p-1">
            <button
              onClick={handlePrevMonth}
              className="rounded-lg p-1.5 text-text-secondary hover:bg-bg-tertiary transition-all focus:outline-none"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={handleNextMonth}
              className="rounded-lg p-1.5 text-text-secondary hover:bg-bg-tertiary transition-all focus:outline-none"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Monthly grid */}
      <div className="grid grid-cols-7 gap-1 border-collapse text-center">
        {/* Day titles */}
        {dayNames.map((name) => (
          <div key={name} className="py-2 text-[10px] font-bold text-text-muted uppercase tracking-wider">
            {name}
          </div>
        ))}

        {/* Date cells */}
        {cells.map((date, idx) => {
          if (!date) {
            return (
              <div key={`empty-${idx}`} className="h-28 bg-bg-secondary/40 border border-border-clean/30 rounded-xl opacity-30" />
            );
          }

          const dateTasks = getTasksForDate(date);
          const isToday = new Date().toDateString() === date.toDateString();

          return (
            <div
              key={date.toISOString()}
              className={`h-28 border border-border-clean/50 p-2 bg-bg-primary flex flex-col justify-between overflow-hidden rounded-xl group hover:border-brand-primary/40 transition-all ${
                isToday ? "ring-1 ring-brand-primary bg-brand-muted/20" : ""
              }`}
            >
              {/* Date Number Label */}
              <div className="flex justify-between items-center">
                <span className={`text-[10px] font-extrabold w-5 h-5 flex items-center justify-center rounded-full ${
                  isToday ? "bg-brand-primary text-bg-primary" : "text-text-secondary"
                }`}>
                  {date.getDate()}
                </span>
                {dateTasks.length > 0 && (
                  <span className="text-[9px] font-bold text-brand-primary">
                    {dateTasks.length} {isRtl ? "مهام" : "Tasks"}
                  </span>
                )}
              </div>

              {/* Tasks List */}
              <div className="flex-1 overflow-y-auto space-y-1 mt-2 pr-0.5">
                {dateTasks.map((task) => (
                  <div
                    key={task.id}
                    onClick={() => onView?.(task)}
                    title={task.title}
                    className={`rounded p-1 text-[9px] font-bold truncate cursor-pointer transition-all border ${getPriorityColor(task.priority)} hover:scale-[1.02]`}
                  >
                    {task.title}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
