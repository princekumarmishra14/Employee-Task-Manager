"use client";

import React, { useEffect, useMemo, useState, useCallback } from "react";
import { AlertCircle, CheckCircle2, Tag, X, Clock } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import { useDBStore } from "@/store/dbStore";
import { TaskValidationInput } from "@/validators/task.schema";
import CalendarPicker from "./CalendarPicker";
import { useEmployeeApi } from "@/hooks/useEmployeeApi";
import { countWords } from "@/utils/wordHelper";

interface TaskFormFieldsProps {
  formData: Partial<TaskValidationInput>;
  onChangeField: (field: keyof TaskValidationInput, value: unknown) => void;
  errors: Record<string, string>;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

// Title: 3–10 characters
const TITLE_MIN = 3;
const TITLE_MAX = 10;

// Description: 20–60 characters
const DESC_CHAR_MIN = 20;
const DESC_CHAR_MAX = 60;

// ─── Sub-components ───────────────────────────────────────────────────────────

/**
 * Label with inline Valid / Invalid badge (only for title and description).
 */
function FieldLabel({
  label,
  required,
  error,
  isValid,
  showStatus = false,
}: {
  label: string;
  required?: boolean;
  error?: string;
  isValid?: boolean;
  showStatus?: boolean;
}) {
  return (
    <label className="flex items-center justify-between text-xs font-bold text-slate-600 dark:text-slate-400 mb-2 tracking-wider uppercase select-none">
      <span className="flex items-center gap-1">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </span>
      {showStatus && (
        <>
          {error ? (
            <span className="inline-flex items-center gap-1 text-[10px] font-black text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 px-2 py-0.5 rounded-full">
              <AlertCircle className="h-3 w-3" />
              Invalid
            </span>
          ) : isValid ? (
            <span className="inline-flex items-center gap-1 text-[10px] font-black text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 px-2 py-0.5 rounded-full">
              <CheckCircle2 className="h-3 w-3" />
              Valid
            </span>
          ) : null}
        </>
      )}
    </label>
  );
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p className="text-[11px] text-red-500 font-semibold mt-1 flex items-center gap-1">
      <AlertCircle className="h-3 w-3 shrink-0" />
      {message}
    </p>
  );
}

/** Medium border-2 for Task Title */
function titleInputClass(hasError: boolean) {
  return `w-full h-[42px] rounded-xl border-2 bg-slate-50 dark:bg-slate-950/20 px-4 text-sm text-slate-800 dark:text-slate-100 outline-none transition-all duration-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 shadow-sm font-medium
    ${hasError
      ? "border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-500/10"
      : "border-slate-300 dark:border-slate-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 focus:bg-white dark:focus:bg-slate-900"
    }`;
}

/** border-2 for Description — paragraph height */
function descriptionClass(hasError: boolean) {
  return `w-full h-[72px] rounded-xl border-2 bg-slate-50 dark:bg-slate-950/20 px-4 py-3 text-sm text-slate-800 dark:text-slate-100 outline-none transition-all duration-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 shadow-sm resize-none leading-relaxed
    ${hasError
      ? "border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-500/10"
      : "border-slate-300 dark:border-slate-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 focus:bg-white dark:focus:bg-slate-900"
    }`;
}

/** Standard border for all other fields */
function inputClass(hasError: boolean, extra = "") {
  return `w-full h-[42px] rounded-xl border bg-slate-50 dark:bg-slate-950/20 px-4 text-sm text-slate-800 dark:text-slate-100 outline-none transition-all duration-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 shadow-sm
    ${hasError
      ? "border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-500/10"
      : "border-slate-200 dark:border-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 focus:bg-white dark:focus:bg-slate-900"
    } ${extra}`;
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function TaskFormFields({
  formData,
  onChangeField,
  errors,
}: TaskFormFieldsProps) {
  const { isRtl } = useTranslation();
  const { departments } = useDBStore();
  const { data: apiEmployees } = useEmployeeApi();

  const activeEmployees = useMemo(
    () =>
      apiEmployees
        .filter((e) => e.isActive)
        .sort((a, b) => (a.fullName || "").localeCompare(b.fullName || "")),
    [apiEmployees]
  );

  const [tagInput, setTagInput] = useState("");

  const titleLength = (formData.title ?? "").length;
  const descLength = (formData.description ?? "").length;

  // Title validation state
  const titleIsValid = titleLength >= TITLE_MIN && titleLength <= TITLE_MAX && !errors.title;
  const titleHasValue = titleLength > 0;

  // Description validation state (character-based)
  const descIsValid = descLength >= DESC_CHAR_MIN && descLength <= DESC_CHAR_MAX && !errors.description;
  const descHasValue = descLength > 0;

  // Auto-fill department/team from assignee
  useEffect(() => {
    if (formData.assigneeId) {
      const emp = apiEmployees.find((e) => e.id === formData.assigneeId);
      if (emp) {
        const dept = departments.find((d) => d.id === emp.departmentId);
        onChangeField("department", dept?.name ?? emp.departmentId ?? null);
        onChangeField("team", emp.teamId ?? null);
      }
    }
  }, [formData.assigneeId, apiEmployees, departments, onChangeField]);

  const addTag = useCallback(() => {
    const trimmed = tagInput.trim();
    if (!trimmed) return;
    const existing = formData.tags ?? [];
    if (!existing.includes(trimmed) && existing.length < 10) {
      onChangeField("tags", [...existing, trimmed]);
    }
    setTagInput("");
  }, [tagInput, formData.tags, onChangeField]);

  const removeTag = (tag: string) => {
    onChangeField("tags", (formData.tags ?? []).filter((t: string) => t !== tag));
  };

  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag();
    }
    if (e.key === "Backspace" && tagInput === "" && formData.tags?.length) {
      removeTag(formData.tags[formData.tags.length - 1]);
    }
  };

  return (
    <div className="grid gap-5 grid-cols-1 md:grid-cols-2 text-sm font-poppins">

      {/* ── 1. Task Title — medium border-2, char counter, live badge ── */}
      <div className="md:col-span-2 flex flex-col">
        <FieldLabel
          label={isRtl ? "عنوان المهمة" : "Task Title"}
          required
          showStatus={titleHasValue}
          error={errors.title}
          isValid={titleIsValid}
        />
        <input
          type="text"
          value={formData.title ?? ""}
          onChange={(e) => onChangeField("title", e.target.value)}
          maxLength={TITLE_MAX}
          placeholder={isRtl ? "أدخل عنوان المهمة" : "Enter task title (3–10 characters)"}
          className={titleInputClass(!!errors.title)}
        />
        <div className="flex items-center justify-between mt-1.5">
          <FieldError message={errors.title} />
          <span className={`text-[10px] font-bold ml-auto tabular-nums select-none ${
            titleLength === 0
              ? "text-slate-400"
              : titleLength < TITLE_MIN || titleLength > TITLE_MAX
              ? "text-red-500"
              : "text-emerald-600"
          }`}>
            {titleLength} / {TITLE_MAX}
          </span>
        </div>
      </div>

      {/* ── 2. Description — medium border-2, 2-row height, char counter, live badge ── */}
      <div className="md:col-span-2 flex flex-col">
        <FieldLabel
          label={isRtl ? "التفاصيل" : "Description"}
          showStatus={descHasValue}
          error={errors.description}
          isValid={descIsValid}
        />
        <textarea
          rows={3}
          value={formData.description ?? ""}
          onChange={(e) => onChangeField("description", e.target.value)}
          maxLength={60}
          placeholder={isRtl ? "اكتب وصفاً (20 إلى 60 حرفاً)" : "Write a description (20 to 60 characters)"}
          className={descriptionClass(!!errors.description)}
        />
        <div className="flex items-center justify-between mt-1.5">
          <FieldError message={errors.description} />
          <span className={`text-[10px] font-bold ml-auto tabular-nums select-none ${
            descLength === 0
              ? "text-slate-400"
              : descLength < DESC_CHAR_MIN || descLength > DESC_CHAR_MAX
              ? "text-red-500"
              : "text-emerald-600"
          }`}>
            {descLength} / {DESC_CHAR_MAX}
          </span>
        </div>
      </div>

      {/* ── 3. Assigned Employee ── */}
      <div className="flex flex-col">
        <FieldLabel
          label={isRtl ? "الموظف المكلف" : "Assigned Employee"}
          required
        />
        <div className="relative">
          <select
            value={formData.assigneeId ?? ""}
            onChange={(e) => onChangeField("assigneeId", e.target.value || null)}
            className={inputClass(!!errors.assigneeId, "appearance-none cursor-pointer pr-10")}
          >
            <option value="">{isRtl ? "اختر موظفاً" : "Choose employee"}</option>
            {activeEmployees.map((emp) => (
              <option key={emp.id} value={emp.id}>
                {emp.fullName} — {emp.title}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center">
            <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
        <FieldError message={errors.assigneeId} />
      </div>

      {/* ── 4. Due Date ── */}
      <div className="flex flex-col">
        <FieldLabel
          label={isRtl ? "تاريخ الاستحقاق" : "Due Date"}
          required
        />
        <CalendarPicker
          value={formData.dueDate ?? ""}
          onChange={(iso) => onChangeField("dueDate", iso)}
          placeholder={isRtl ? "اختر تاريخ الاستحقاق" : "Select due date"}
          hasError={!!errors.dueDate}
          minDate={new Date()}
        />
        <FieldError message={errors.dueDate} />
      </div>

      {/* ── 5. Estimated Hours ── */}
      <div className="flex flex-col">
        <FieldLabel
          label={isRtl ? "الساعات المقدرة" : "Estimated Hours"}
        />
        <div className="relative">
          <Clock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
          <input
            type="number"
            min={1}
            max={500}
            step={1}
            onKeyDown={(e) => {
              if (['e', 'E', '+', '-', '.', ','].includes(e.key)) e.preventDefault();
            }}
            value={formData.estimatedHours ?? ""}
            onChange={(e) => {
              const val = e.target.value;
              if (val === "") {
                onChangeField("estimatedHours", null);
              } else {
                const parsed = parseInt(val, 10);
                if (!isNaN(parsed)) onChangeField("estimatedHours", parsed);
              }
            }}
            placeholder={isRtl ? "عدد الساعات" : "e.g. 8"}
            className={inputClass(!!errors.estimatedHours, "pl-11")}
          />
        </div>
        <FieldError message={errors.estimatedHours} />
      </div>

      {/* ── 6. Status (Segmented Pill Control) ── */}
      <div className="flex flex-col">
        <FieldLabel
          label={isRtl ? "الحالة" : "Status"}
          required
        />
        <div className="flex gap-1.5 bg-slate-100 dark:bg-slate-950/40 p-1 rounded-xl border border-slate-200 dark:border-slate-800 h-[42px] items-center">
          {[
            { value: "UNASSIGNED",  label: "Pending",     labelAr: "معلقة"   },
            { value: "IN_PROGRESS", label: "In Progress", labelAr: "قيد التنفيذ" },
            { value: "COMPLETED",   label: "Completed",   labelAr: "مكتملة"   },
          ].map((s) => {
            const isActive =
              formData.status === s.value ||
              (s.value === "UNASSIGNED" && formData.status === "ASSIGNED");
            return (
              <button
                key={s.value}
                type="button"
                onClick={() => onChangeField("status", s.value)}
                className={`flex-1 h-[34px] flex items-center justify-center rounded-[9px] text-xs font-bold transition-all focus:outline-none cursor-pointer
                  ${isActive
                    ? "bg-indigo-500 text-white shadow-sm"
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-white dark:hover:bg-slate-800"
                  }`}
              >
                {isRtl ? s.labelAr : s.label}
              </button>
            );
          })}
        </div>
        <FieldError message={errors.status} />
      </div>

      {/* ── 7. Tags (Full Width) ── */}
      <div className="md:col-span-2 flex flex-col">
        <FieldLabel
          label={isRtl ? "الوسوم" : "Tags"}
        />
        {(formData.tags?.length ?? 0) > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-2">
            {formData.tags?.map((tag: string) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 rounded-full bg-indigo-50 text-indigo-700 dark:bg-indigo-950/30 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-700 px-3 py-0.5 text-xs font-bold"
              >
                <Tag className="h-3 w-3" />
                {tag}
                <button
                  type="button"
                  onClick={() => removeTag(tag)}
                  className="hover:text-red-500 transition-colors ml-0.5 focus:outline-none cursor-pointer"
                  aria-label={`Remove tag ${tag}`}
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </span>
            ))}
          </div>
        )}
        <input
          type="text"
          value={tagInput}
          onChange={(e) => setTagInput(e.target.value)}
          onKeyDown={handleTagKeyDown}
          onBlur={addTag}
          placeholder={isRtl ? "أضف وسوماً (Enter أو فاصلة)" : "Add tags — press Enter or comma"}
          className={inputClass(false)}
        />
      </div>

      {/* ── Auto-mapped Department & Team ── */}
      {formData.department && (
        <div className="md:col-span-2 rounded-2xl bg-slate-50 dark:bg-slate-950/10 border border-slate-200 dark:border-slate-800 px-4 py-3 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <div className="h-1.5 w-1.5 rounded-full bg-indigo-500 shrink-0" />
            <span className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">
              {isRtl ? "القسم:" : "Department:"}
            </span>
            <span className="font-black text-slate-700 dark:text-slate-200">{formData.department}</span>
          </div>
          {formData.team && (
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">
                {isRtl ? "الفريق:" : "Team:"}
              </span>
              <span className="font-black text-slate-700 dark:text-slate-200">{formData.team}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
