"use client";

import React, { useState, useEffect } from "react";
import {
  X, Upload, Loader2, Eye, EyeOff,
  User, ShieldCheck, CheckCircle2, ChevronRight, ChevronLeft,
} from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import { Department } from "@/data/seedData";
import { Employee, EmployeeRole } from "@/types/employee.types";
import { employeeValidationSchema, EmployeeValidationInput } from "@/validators/employee.schema";
import { formatZodErrors } from "@/utils/taskValidationUtils";
import { axiosClient } from "@/lib/axios";

interface EmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: EmployeeValidationInput) => void;
  initialData?: Employee | null;
  departments: Department[];
}

// ─── Shared input class ───────────────────────────────────────────────────────
function inputCls(hasError = false, extra = "") {
  return `w-full h-[42px] rounded-xl border bg-slate-50 dark:bg-slate-950/20 px-4 text-sm
    text-slate-800 dark:text-slate-100 outline-none transition-all duration-200
    placeholder:text-slate-400 dark:placeholder:text-slate-500 shadow-sm
    ${hasError
      ? "border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-500/10"
      : "border-slate-200 dark:border-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 focus:bg-white dark:focus:bg-slate-900"
    } ${extra}`;
}

function FieldLabel({ label, required }: { label: string; required?: boolean }) {
  return (
    <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-2 uppercase tracking-wider select-none">
      {label}{required && <span className="text-red-500 ml-0.5">*</span>}
    </label>
  );
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-[11px] text-red-500 font-semibold mt-1">{message}</p>;
}

// ─── Step indicator ───────────────────────────────────────────────────────────
function StepIndicator({ step, isCreate }: { step: number; isCreate: boolean }) {
  const steps = [
    { icon: User,        label: "Personal Info" },
    { icon: ShieldCheck, label: isCreate ? "Role & Security" : "Role & Dept" },
  ];
  return (
    <div className="flex items-center gap-0 mb-5">
      {steps.map((s, idx) => {
        const Icon = s.icon;
        const active   = step === idx + 1;
        const complete = step > idx + 1;
        return (
          <React.Fragment key={idx}>
            <div className="flex items-center gap-2">
              <div className={`h-7 w-7 rounded-full flex items-center justify-center shrink-0 transition-all
                ${complete ? "bg-indigo-500" : active ? "bg-indigo-500" : "bg-slate-100 dark:bg-slate-800"}`}>
                {complete
                  ? <CheckCircle2 className="h-4 w-4 text-white" />
                  : <Icon className={`h-3.5 w-3.5 ${active ? "text-white" : "text-slate-400"}`} />}
              </div>
              <span className={`text-xs font-bold hidden sm:block ${active ? "text-indigo-600 dark:text-indigo-400" : complete ? "text-slate-500" : "text-slate-400"}`}>
                {s.label}
              </span>
            </div>
            {idx < steps.length - 1 && (
              <div className={`flex-1 h-px mx-3 transition-all ${complete ? "bg-indigo-400" : "bg-slate-200 dark:bg-slate-800"}`} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function EmployeeModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  departments,
}: EmployeeModalProps) {
  const { t, isRtl } = useTranslation();
  const isCreate = !initialData;

  // ── Step state ──
  const [step, setStep] = useState(1);

  // ── Field states ──
  const [fullName,        setFullName]        = useState("");
  const [email,           setEmail]           = useState("");
  const [phone,           setPhone]           = useState("");
  const [role,            setRole]            = useState<EmployeeRole>("EMPLOYEE");
  const [title,           setTitle]           = useState("");
  const [departmentId,    setDepartmentId]    = useState("");
  const [avatarUrl,       setAvatarUrl]       = useState("");
  const [isUploading,     setIsUploading]     = useState(false);
  const [password,        setPassword]        = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword,    setShowPassword]    = useState(false);
  const [showConfirm,     setShowConfirm]     = useState(false);
  const [errors,          setErrors]          = useState<Record<string, string>>({});

  // ── Sync / reset ──
  useEffect(() => {
    if (initialData) {
      setFullName(initialData.fullName);
      setEmail(initialData.email);
      setPhone(initialData.phone || "");
      setRole(initialData.role);
      setTitle(initialData.title);
      setDepartmentId(initialData.departmentId || "");
      setAvatarUrl(initialData.avatarUrl);
    } else {
      setFullName(""); setEmail(""); setPhone("");
      setRole("EMPLOYEE"); setTitle(""); setDepartmentId(""); setAvatarUrl("");
    }
    setPassword(""); setConfirmPassword("");
    setShowPassword(false); setShowConfirm(false);
    setErrors({}); setStep(1);
  }, [initialData, isOpen]);

  if (!isOpen && !initialData) return null;

  // ── Password rules ──
  const hasLength      = password.length >= 8 && password.length <= 32;
  const hasUppercase   = /[A-Z]/.test(password);
  const hasLowercase   = /[a-z]/.test(password);
  const hasNumber      = /[0-9]/.test(password);
  const hasSpecial     = /[^A-Za-z0-9]/.test(password);
  const isPasswordValid = hasLength && hasUppercase && hasLowercase && hasNumber && hasSpecial;
  const passwordsMatch  = password === confirmPassword;

  // ── Upload ──
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setIsUploading(true);
      const fd = new FormData();
      fd.append("file", file);
      const res = await axiosClient.post("/upload", fd, { headers: { "Content-Type": "multipart/form-data" } });
      if (res.data?.success && res.data?.url) setAvatarUrl(res.data.url);
    } catch { /* silent */ } finally { setIsUploading(false); }
  };

  // ── Step 1 validation ──
  const step1Valid = fullName.trim().length > 0 && email.trim().length > 0;

  // ── Step 2 validation ──
  const step2Valid = title.trim().length > 0 && (!isCreate || (isPasswordValid && passwordsMatch));

  // ── Final submit ──
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    const fd: Record<string, unknown> = {
      fullName, email, phone: phone || null, role, title,
      departmentId: departmentId || null, avatarUrl: avatarUrl || null,
    };
    if (isCreate) { fd.password = password; fd.confirmPassword = confirmPassword; }
    const result = employeeValidationSchema.safeParse(fd);
    if (!result.success) { setErrors(formatZodErrors(result.error)); return; }
    onSubmit(result.data);
  };

  // ── Shared rule row ──
  const RuleRow = ({ met, text }: { met: boolean; text: string }) => (
    <div className="flex items-center gap-2">
      <span className={met ? "text-emerald-500 font-bold text-xs" : "text-slate-300 dark:text-slate-600 text-xs"}>
        {met ? "✔" : "✗"}
      </span>
      <span className={`text-xs ${met ? "text-slate-700 dark:text-white font-medium" : "text-slate-400"}`}>{text}</span>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-[18px] font-poppins">
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-2xl p-5 flex flex-col max-h-[92vh]">

        {/* ── Header ── */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4 mb-4 shrink-0">
          <div>
            <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight leading-none">
              {initialData ? t.empEditTitle : (isRtl ? "إضافة موظف جديد" : "Add New Employee")}
            </h3>
            <p className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 mt-1">
              {isRtl ? `الخطوة ${step} من 2` : `Step ${step} of 2`}
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-600 dark:hover:text-white transition-colors focus:outline-none cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* ── Step Indicator ── */}
        <StepIndicator step={step} isCreate={isCreate} />

        {/* ── Form Body ── */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
          <div className="grid gap-4">

            {/* ════════ STEP 1: Personal Info ════════ */}
            {step === 1 && (
              <>
                {/* Full Name */}
                <div>
                  <FieldLabel label={t.empName} required />
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder={isRtl ? "الاسم الكامل" : "Full name"}
                    className={inputCls(!!errors.fullName)}
                  />
                  <FieldError message={errors.fullName} />
                </div>

                {/* Email */}
                <div>
                  <FieldLabel label={t.empEmail} required />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={isRtl ? "البريد الإلكتروني" : "Email address"}
                    className={inputCls(!!errors.email)}
                  />
                  <FieldError message={errors.email} />
                </div>

                {/* Phone */}
                <div>
                  <FieldLabel label={isRtl ? "رقم الهاتف" : "Phone Number"} />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder={isRtl ? "+966 5xx xxxxxx" : "+1 (555) 000-0000"}
                    className={inputCls(!!errors.phone)}
                  />
                  <FieldError message={errors.phone} />
                </div>

                {/* Profile Photo */}
                <div>
                  <FieldLabel label={isRtl ? "صورة الملف الشخصي" : "Profile Photo"} />
                  <div className="flex items-center gap-3">
                    {avatarUrl
                      ? /* eslint-disable-next-line @next/next/no-img-element */
                        <img src={avatarUrl} alt="Avatar" className="h-9 w-9 rounded-full object-cover border-2 border-indigo-200 shrink-0" />
                      : <div className="h-9 w-9 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                          <User className="h-4 w-4 text-slate-400" />
                        </div>
                    }
                    <div className="flex-1 relative">
                      <input
                        type="url"
                        placeholder="https://example.com/photo.jpg"
                        value={avatarUrl}
                        onChange={(e) => setAvatarUrl(e.target.value)}
                        className={inputCls(false, "pr-10")}
                      />
                      <label className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-slate-400 hover:text-indigo-600 transition-colors">
                        {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                        <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} disabled={isUploading} />
                      </label>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* ════════ STEP 2: Role & Security ════════ */}
            {step === 2 && (
              <>
                {/* Job Title */}
                <div>
                  <FieldLabel label={t.empJobTitle} required />
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder={isRtl ? "المسمى الوظيفي" : "e.g. Software Engineer"}
                    className={inputCls(!!errors.title)}
                  />
                  <FieldError message={errors.title} />
                </div>

                {/* Role + Department (2-col) */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <FieldLabel label={t.empRole} />
                    <div className="relative">
                      <select
                        value={role}
                        onChange={(e) => setRole(e.target.value as EmployeeRole)}
                        className={inputCls(false, "appearance-none cursor-pointer pr-8")}
                      >
                        <option value="SUPER_ADMIN">Super Admin</option>
                        <option value="ADMIN">Admin</option>
                        <option value="MANAGER">Manager</option>
                        <option value="EMPLOYEE">Employee</option>
                        <option value="VIEWER">Viewer</option>
                      </select>
                      <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
                        <svg className="h-3.5 w-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  <div>
                    <FieldLabel label={t.empDepartment} />
                    <div className="relative">
                      <select
                        value={departmentId}
                        onChange={(e) => setDepartmentId(e.target.value)}
                        className={inputCls(false, "appearance-none cursor-pointer pr-8")}
                      >
                        <option value="">None</option>
                        {departments.map((d) => (
                          <option key={d.id} value={d.id}>{d.name}</option>
                        ))}
                      </select>
                      <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
                        <svg className="h-3.5 w-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Password (create only) */}
                {isCreate && (
                  <>
                    {/* Password */}
                    <div>
                      <FieldLabel label={isRtl ? "كلمة المرور" : "Password"} required />
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="••••••••"
                          className={inputCls(!!errors.password, "pr-10")}
                        />
                        <button type="button" onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600 transition-colors cursor-pointer">
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                      {/* Strength mini checklist */}
                      {password.length > 0 && (
                        <div className="mt-2 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/20 grid grid-cols-2 gap-1">
                          <RuleRow met={hasLength}    text={isRtl ? "٨–٣٢ حرفاً" : "8–32 chars"} />
                          <RuleRow met={hasUppercase} text={isRtl ? "حرف كبير" : "Uppercase"} />
                          <RuleRow met={hasLowercase} text={isRtl ? "حرف صغير" : "Lowercase"} />
                          <RuleRow met={hasNumber}    text={isRtl ? "رقم" : "Number"} />
                          <RuleRow met={hasSpecial}   text={isRtl ? "رمز خاص" : "Special char"} />
                        </div>
                      )}
                      <FieldError message={errors.password} />
                    </div>

                    {/* Confirm Password */}
                    <div>
                      <FieldLabel label={isRtl ? "تأكيد كلمة المرور" : "Confirm Password"} required />
                      <div className="relative">
                        <input
                          type={showConfirm ? "text" : "password"}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="••••••••"
                          className={inputCls(confirmPassword.length > 0 && !passwordsMatch, "pr-10")}
                        />
                        <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600 transition-colors cursor-pointer">
                          {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                      {confirmPassword.length > 0 && !passwordsMatch && (
                        <p className="text-[11px] text-red-500 font-semibold mt-1">
                          {isRtl ? "كلمتا المرور غير متطابقتين." : "Passwords do not match."}
                        </p>
                      )}
                    </div>
                  </>
                )}
              </>
            )}
          </div>

          {/* ── Footer ── */}
          <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-4 mt-5">
            {step === 2 ? (
              <button
                type="button"
                onClick={() => setStep(1)}
                className="inline-flex items-center gap-1.5 h-9 px-4 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all cursor-pointer focus:outline-none"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
                {isRtl ? "السابق" : "Back"}
              </button>
            ) : (
              <button
                type="button"
                onClick={onClose}
                className="h-9 px-4 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all cursor-pointer focus:outline-none"
              >
                {t.cancel}
              </button>
            )}

            {step === 1 ? (
              <button
                type="button"
                disabled={!step1Valid}
                onClick={() => setStep(2)}
                className="inline-flex items-center gap-1.5 h-9 px-5 text-xs font-bold rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 text-white shadow-md shadow-indigo-500/10 hover:from-indigo-600 hover:to-violet-700 hover:-translate-y-0.5 hover:shadow-lg transition-all active:scale-95 cursor-pointer focus:outline-none disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none disabled:translate-y-0"
              >
                {isRtl ? "التالي" : "Next"}
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={!step2Valid}
                className="inline-flex items-center justify-center gap-1.5 h-9 px-5 text-xs font-bold rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 text-white shadow-md shadow-indigo-500/10 hover:from-indigo-600 hover:to-violet-700 hover:-translate-y-0.5 hover:shadow-lg transition-all active:scale-95 cursor-pointer focus:outline-none disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none disabled:translate-y-0"
              >
                {initialData
                  ? (isRtl ? "حفظ التغييرات" : "Save Changes")
                  : (isRtl ? "إنشاء موظف" : "Create Employee")}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
