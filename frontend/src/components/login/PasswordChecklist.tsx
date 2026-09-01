"use client";

import React, { useMemo } from "react";
import { CheckCircle2, Circle } from "lucide-react";

interface PasswordChecklistProps {
  value: string;
  isRtl?: boolean;
}

export default function PasswordChecklist({ value, isRtl = false }: PasswordChecklistProps) {
  const criteria = useMemo(() => {
    const minLength = value.length >= 8;
    const uppercase = /[A-Z]/.test(value);
    const lowercase = /[a-z]/.test(value);
    const number = /[0-9]/.test(value);
    const special = /[!@#$%^&*()_+\-={}[\]:;"'<>,.?]/.test(value);
    const noSpaces = value.length > 0 && !/\s/.test(value);

    let score = 0;
    if (minLength) score += 1;
    if (uppercase) score += 1;
    if (lowercase) score += 1;
    if (number) score += 1;
    if (special) score += 1;
    if (noSpaces) score += 1;

    return {
      minLength,
      uppercase,
      lowercase,
      number,
      special,
      noSpaces,
      score,
    };
  }, [value]);

  const strengthText = useMemo(() => {
    if (!value) return isRtl ? "فارغ" : "Empty";
    if (criteria.score <= 2) return isRtl ? "ضعيف جداً" : "Very Weak";
    if (criteria.score <= 4) return isRtl ? "متوسط القوة" : "Moderate";
    if (criteria.score === 5) return isRtl ? "قوي" : "Strong";
    return isRtl ? "آمن جداً" : "Highly Secure";
  }, [criteria.score, value, isRtl]);

  const strengthColor = useMemo(() => {
    if (!value) return "bg-slate-300 dark:bg-slate-800";
    if (criteria.score <= 2) return "bg-status-danger";
    if (criteria.score <= 4) return "bg-status-warning";
    return "bg-status-success";
  }, [criteria.score, value]);

  const items = [
    { key: "minLength", label: isRtl ? "8 أحرف على الأقل" : "At least 8 characters" },
    { key: "number", label: isRtl ? "رقم واحد (0-9)" : "One number (0-9)" },
    { key: "uppercase", label: isRtl ? "حرف كبير واحد (A-Z)" : "One uppercase letter (A-Z)" },
    { key: "special", label: isRtl ? "رمز خاص واحد" : "One special character" },
    { key: "lowercase", label: isRtl ? "حرف صغير واحد (a-z)" : "One lowercase letter (a-z)" },
    { key: "noSpaces", label: isRtl ? "بدون مسافات" : "No spaces allowed" },
  ];

  return (
    <div className="space-y-3.5 mt-2.5 p-3.5 rounded-2xl border border-slate-400/10 bg-white/40 dark:bg-slate-900/30 backdrop-blur-md">
      {/* Inline Password Strength and Header */}
      <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-wider select-none leading-none">
        <span className="text-text-secondary">{isRtl ? "متطلبات كلمة المرور" : "Password requirements"}</span>
        <div className="flex items-center gap-2">
          <span className={value ? (criteria.score >= 5 ? "text-status-success" : criteria.score >= 3 ? "text-status-warning" : "text-status-danger") : "text-text-muted"}>
            {strengthText}
          </span>
          <div className="w-8 h-1 bg-slate-400/18 dark:bg-slate-800 rounded-full overflow-hidden shrink-0">
            <div
              className={`h-full ${strengthColor} transition-all duration-500`}
              style={{ width: `${value ? (criteria.score / 6) * 100 : 0}%` }}
            />
          </div>
        </div>
      </div>

      {/* 2-Column Checklist Grid */}
      <div className="grid grid-cols-2 gap-x-3 gap-y-2" role="list">
        {items.map((item) => {
          const isSatisfied = criteria[item.key as keyof typeof criteria] as boolean;
          return (
            <div key={item.key} role="listitem" className="flex items-center gap-2 text-[10px] font-semibold transition-all">
              <div className="h-4 w-4 rounded-full flex items-center justify-center shrink-0">
                {isSatisfied ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 animate-check-bounce" />
                ) : (
                  <Circle className="h-4 w-4 text-text-muted/40 dark:text-text-muted/20 shrink-0" />
                )}
              </div>
              <span className={`transition-colors duration-200 truncate ${isSatisfied ? "text-emerald-600 dark:text-emerald-400" : "text-text-muted/70"}`}>
                {item.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
