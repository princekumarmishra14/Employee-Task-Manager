"use client";

import React, { useState, useTransition, useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { signupAction } from "@/app/actions/auth";
import GoogleButton from "@/components/login/GoogleButton";
import { useGoogleLogin } from "@/hooks/useGoogleLogin";
import Link from "next/link";
import {
  User,
  Mail,
  Phone,
  Building2,
  Briefcase,
  KeyRound,
  Eye,
  EyeOff,
  Check,
  X,
  Loader2,
  ShieldAlert,
  CheckCircle2,
  IdCard,
  ArrowRight,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import LoginLayout from "@/components/login/LoginLayout";
import LoginPromoPanel from "@/components/login/LoginPromoPanel";
import TopToolbar from "@/components/login/TopToolbar";
import Footer from "@/components/login/Footer";

// ─── Departments ────────────────────────────────────────────────────────────
const DEPARTMENTS = [
  "Engineering",
  "Product",
  "Design",
  "Marketing",
  "Sales",
  "Human Resources",
  "Finance",
  "Operations",
  "Legal",
  "Customer Success",
];

// ─── Zod Schema ─────────────────────────────────────────────────────────────
const signupSchema = z
  .object({
    firstName: z
      .string()
      .min(2, "First name must be at least 2 characters.")
      .max(100, "Too long.")
      .trim(),
    lastName: z
      .string()
      .min(2, "Last name must be at least 2 characters.")
      .max(100, "Too long.")
      .trim(),
    email: z
      .string()
      .min(1, "Email is required.")
      .email("Please enter a valid company email."),
    mobile: z
      .string()
      .regex(/^\+?[\d\s\-().]{7,25}$/, "Please enter a valid mobile number.")
      .optional()
      .or(z.literal("")),
    employeeId: z.string().max(50).optional().or(z.literal("")),
    department: z.string().min(1, "Please select your department."),
    designation: z
      .string()
      .min(2, "Designation is required.")
      .max(150, "Too long.")
      .trim(),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters.")
      .max(32, "Password must be at most 32 characters.")
      .regex(/[A-Z]/, "Must include an uppercase letter.")
      .regex(/[a-z]/, "Must include a lowercase letter.")
      .regex(/[0-9]/, "Must include a number.")
      .regex(/[^a-zA-Z0-9]/, "Must include a special character.")
      .regex(/^\S+$/, "Password must not contain spaces."),
    confirmPassword: z.string().min(1, "Please confirm your password."),
    acceptTerms: z
      .boolean()
      .refine((v) => v === true, "You must accept the Terms & Conditions."),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

type SignupFormData = z.infer<typeof signupSchema>;

// ─── Password Rule Checker ───────────────────────────────────────────────────
interface PasswordRule {
  label: string;
  test: (pwd: string) => boolean;
}

const PASSWORD_RULES: PasswordRule[] = [
  { label: "8+ chars", test: (p) => p.length >= 8 && p.length <= 32 },
  { label: "A–Z", test: (p) => /[A-Z]/.test(p) },
  { label: "a–z", test: (p) => /[a-z]/.test(p) },
  { label: "0–9", test: (p) => /[0-9]/.test(p) },
  { label: "Special", test: (p) => /[^a-zA-Z0-9]/.test(p) },
  { label: "No spaces", test: (p) => p.length > 0 && !/\s/.test(p) },
];

// ─── Success Screen ──────────────────────────────────────────────────────────
function SuccessScreen({ name }: { name: string }) {
  return (
    <div className="flex flex-col items-center justify-center space-y-4 py-4 text-center animate-slide-up select-none">
      <div className="relative">
        <div className="h-16 w-16 rounded-full bg-status-success/10 border border-status-success/30 flex items-center justify-center animate-success-scale">
          <CheckCircle2 className="h-8 w-8 text-status-success" />
        </div>
        <div className="absolute inset-0 rounded-full bg-status-success/5 blur-xl" />
      </div>
      <div className="space-y-1">
        <h3 className="text-lg font-black text-text-primary uppercase tracking-tight">
          Registration Successful!
        </h3>
        <p className="text-xs font-semibold text-text-secondary max-w-xs leading-relaxed">
          Welcome aboard, <span className="text-brand-primary font-black">{name}</span>! Please check your email to verify and activate your account.
        </p>
      </div>
      <div className="w-full rounded-xl bg-indigo-500/[0.03] dark:bg-slate-950/20 border border-slate-200/50 dark:border-slate-800/50 p-3.5 text-left space-y-1.5">
        <p className="text-[9px] font-black text-brand-primary uppercase tracking-widest">
          Verification Instructions:
        </p>
        <ul className="text-[11px] font-semibold text-text-secondary space-y-1">
          <li className="flex items-center gap-2">
            <Check className="h-3 w-3 text-status-success shrink-0" />
            We sent an activation link to your email address
          </li>
          <li className="flex items-center gap-2">
            <Check className="h-3 w-3 text-status-success shrink-0" />
            Click the verification link within 24 hours
          </li>
          <li className="flex items-center gap-2">
            <Check className="h-3 w-3 text-status-success shrink-0" />
            Once verified, return to login to access ETM
          </li>
        </ul>
      </div>
      <Link
        href="/login"
        className="w-full h-12 flex items-center justify-center gap-2 rounded-xl bg-[#3B42E3] hover:bg-[#2A31C8] text-white text-sm font-bold uppercase tracking-wider transition-all active:scale-98 shadow-md hover:shadow-lg"
      >
        <span>Proceed to Login</span>
        <ArrowRight className="h-3.5 w-3.5" />
      </Link>
    </div>
  );
}

// ─── Signup Page Content ──────────────────────────────────────────────────────
function SignupPageContent() {
  const router = useRouter();
  const { isRtl } = useTranslation();
  const [isPending, startTransition] = useTransition();
  const [serverError, setServerError] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [successName, setSuccessName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [step, setStep] = useState(1);

  const {
    handleGoogleSuccess,
    isPending: isGooglePending,
    error: googleError,
  } = useGoogleLogin("/dashboard");

  // Sync Google hook error with form serverError state
  useEffect(() => {
    if (googleError) {
      setServerError(googleError);
    }
  }, [googleError]);

  const {
    register,
    handleSubmit,
    watch,
    trigger,
    formState: { errors, isValid },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    mode: "onChange",
  });

  // Watch password for live checklist
  const passwordValue = watch("password", "");

  // Redirect to login after success animation
  useEffect(() => {
    if (showSuccess) {
      const timer = setTimeout(() => router.push("/login"), 6000);
      return () => clearTimeout(timer);
    }
  }, [showSuccess, router]);

  const onSubmit = (data: SignupFormData) => {
    setServerError("");

    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      formData.append(key, String(value));
    });

    startTransition(async () => {
      const result = await signupAction(formData);
      if (result.error) {
        setServerError(result.error);
      } else if (result.success) {
        setSuccessName(`${data.firstName} ${data.lastName}`);
        setShowSuccess(true);
      }
    });
  };

  return (
    <LoginLayout>
      {/* ── Header Floating Toolbar ── */}
      <header className="w-full max-w-none px-6 sm:px-10 lg:px-16 py-3 flex justify-between items-center relative z-20 select-none shrink-0 h-16">
        {/* Left: Brand logo details */}
        <div className="flex items-center gap-2 select-none">
          <div className="h-7 w-7 rounded-lg bg-[#3B42E3] flex items-center justify-center shadow-md">
            <svg className="h-4.5 w-4.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 11l3 3L22 4" />
              <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
            </svg>
          </div>
          <span className="text-lg font-black tracking-tight text-[#3B42E3] uppercase">
            Employee Task Manager
          </span>
        </div>

        {/* Right: Consolidated toolbar utilities */}
        <TopToolbar />
      </header>

      {/* ── Center Unified Signup Portal Card ── */}
      <main className="flex-1 w-full max-w-none px-4 sm:px-6 lg:px-16 py-6 flex items-center justify-center relative z-10">
        <div className="w-full max-w-[1024px] bg-white dark:bg-slate-900 rounded-[28px] shadow-[0_24px_60px_rgba(99,102,241,0.08)] border border-slate-200/50 dark:border-slate-800/50 p-4 sm:p-5 grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-6 items-stretch min-h-[640px] transition-all duration-300">
          
          {/* LEFT COLUMN: Stepper Wizard Form */}
          <div className="flex flex-col justify-between p-6 sm:p-10 lg:p-12">
            {/* Logo and Wizard Header */}
            <div className="flex items-center justify-between select-none mb-6 lg:mb-0">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-lg bg-[#3B42E3] flex items-center justify-center shadow-md">
                  <svg className="h-5 w-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 11l3 3L22 4" />
                    <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
                  </svg>
                </div>
                <span className="text-2xl font-extrabold tracking-tight text-slate-850 dark:text-white">
                  Employee Task Manager
                </span>
              </div>

              {!showSuccess && (
                <span className="text-[10px] font-bold text-text-muted bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-full uppercase tracking-wider">
                  Step {step} of 3
                </span>
              )}
            </div>

            {/* Form Section */}
            <div className="my-auto py-6">
              {showSuccess ? (
                <SuccessScreen name={successName} />
              ) : (
                <form
                  id="signup-form"
                  onSubmit={handleSubmit(onSubmit)}
                  noValidate
                >
                  {/* Stepper Progress Bar */}
                  <div className="flex items-center gap-2 mb-6 select-none">
                    {[1, 2, 3].map((num) => (
                      <React.Fragment key={num}>
                        <div className={`h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-black transition-all duration-300 ${
                          step === num 
                            ? "bg-[#3B42E3] text-white shadow-md shadow-[#3B42E3]/25" 
                            : step > num 
                              ? "bg-emerald-500 text-white" 
                              : "bg-slate-100 dark:bg-slate-800 text-text-muted"
                        }`}>
                          {step > num ? "✓" : num}
                        </div>
                        {num < 3 && (
                          <div className={`h-0.5 flex-1 transition-all duration-500 ${
                            step > num ? "bg-emerald-500" : "bg-slate-200 dark:bg-slate-800"
                          }`} />
                        )}
                      </React.Fragment>
                    ))}
                  </div>

                  {/* Header Title inside card */}
                  <div className="space-y-1.5 select-none mb-6">
                    <h2 className="text-2xl font-black text-text-primary tracking-tight">
                      {step === 1 && (isRtl ? "الملف الشخصي" : "Profile Details")}
                      {step === 2 && (isRtl ? "تفاصيل العمل" : "Work Information")}
                      {step === 3 && (isRtl ? "الأمان والحساب" : "Security & Credentials")}
                    </h2>
                    <p className="text-sm font-semibold text-text-muted">
                      {step === 1 && (isRtl ? "يرجى إدخال اسمك وتفاصيل الاتصال" : "Please enter your name and contact details")}
                      {step === 2 && (isRtl ? "اختر القسم والمسمى الوظيفي الخاص بك" : "Select your department and work role details")}
                      {step === 3 && (isRtl ? "قم بتعيين كلمة المرور وتفعيل الحساب" : "Choose a secure password and agree to policies")}
                    </p>
                  </div>

                  {/* Server Error Banner */}
                  {serverError && (
                    <div
                      role="alert"
                      aria-live="assertive"
                      className="flex items-center gap-2 rounded-xl bg-status-danger/10 border border-status-danger/20 p-2.5 text-xs font-bold text-status-danger mb-4 animate-slide-up"
                    >
                      <ShieldAlert className="h-4.5 w-4.5 shrink-0" aria-hidden="true" />
                      <span>{serverError}</span>
                    </div>
                  )}

                  {/* STEP 1: Profile Details */}
                  {step === 1 && (
                    <div className="space-y-5 animate-slide-up">
                      <div className="relative mt-5">
                        <label
                          htmlFor="firstName"
                          className="absolute -top-2 left-3.5 px-1.5 text-[12px] font-bold text-text-secondary bg-white dark:bg-slate-900 select-none z-10 transition-colors"
                        >
                          {isRtl ? "الاسم الأول *" : "First Name *"}
                        </label>
                        <input
                          id="firstName"
                          type="text"
                          autoComplete="given-name"
                          placeholder={isRtl ? "أدخل الاسم الأول" : "Enter first name"}
                          disabled={isPending}
                          aria-invalid={!!errors.firstName}
                          className={`block w-full h-12 px-4 rounded-[12px] text-text-primary text-sm font-semibold bg-transparent border border-slate-300 dark:border-slate-700 dark:border-slate-800 focus:border-brand-primary focus:ring-1 focus:ring-brand-primary/20 outline-none placeholder-text-muted/40 transition-all duration-200 ${
                            errors.firstName ? "border-status-danger focus:ring-status-danger" : ""
                          }`}
                          {...register("firstName")}
                        />
                        {errors.firstName && (
                          <p className="text-[10px] font-bold text-status-danger mt-1.5 pl-1">
                            {errors.firstName.message}
                          </p>
                        )}
                      </div>

                      <div className="relative mt-5">
                        <label
                          htmlFor="lastName"
                          className="absolute -top-2 left-3.5 px-1.5 text-[12px] font-bold text-text-secondary bg-white dark:bg-slate-900 select-none z-10 transition-colors"
                        >
                          {isRtl ? "اسم العائلة *" : "Last Name *"}
                        </label>
                        <input
                          id="lastName"
                          type="text"
                          autoComplete="family-name"
                          placeholder={isRtl ? "أدخل اسم العائلة" : "Enter last name"}
                          disabled={isPending}
                          aria-invalid={!!errors.lastName}
                          className={`block w-full h-12 px-4 rounded-[12px] text-text-primary text-sm font-semibold bg-transparent border border-slate-300 dark:border-slate-700 dark:border-slate-800 focus:border-brand-primary focus:ring-1 focus:ring-brand-primary/20 outline-none placeholder-text-muted/40 transition-all duration-200 ${
                            errors.lastName ? "border-status-danger focus:ring-status-danger" : ""
                          }`}
                          {...register("lastName")}
                        />
                        {errors.lastName && (
                          <p className="text-[10px] font-bold text-status-danger mt-1.5 pl-1">
                            {errors.lastName.message}
                          </p>
                        )}
                      </div>

                      <div className="relative mt-5">
                        <label
                          htmlFor="mobile"
                          className="absolute -top-2 left-3.5 px-1.5 text-[12px] font-bold text-text-secondary bg-white dark:bg-slate-900 select-none z-10 transition-colors"
                        >
                          {isRtl ? "رقم الهاتف" : "Mobile Number"}
                        </label>
                        <input
                          id="mobile"
                          type="tel"
                          autoComplete="tel"
                          placeholder="+1 (555) 000-0000"
                          disabled={isPending}
                          aria-invalid={!!errors.mobile}
                          className={`block w-full h-12 px-4 rounded-[12px] text-text-primary text-sm font-semibold bg-transparent border border-slate-300 dark:border-slate-700 dark:border-slate-800 focus:border-brand-primary focus:ring-1 focus:ring-brand-primary/20 outline-none placeholder-text-muted/40 transition-all duration-200 ${
                            errors.mobile ? "border-status-danger focus:ring-status-danger" : ""
                          }`}
                          {...register("mobile")}
                        />
                        {errors.mobile && (
                          <p className="text-[10px] font-bold text-status-danger mt-1.5 pl-1">
                            {errors.mobile.message}
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* STEP 2: Work Details */}
                  {step === 2 && (
                    <div className="space-y-5 animate-slide-up">
                      <div className="relative mt-5">
                        <label
                          htmlFor="department"
                          className="absolute -top-2 left-3.5 px-1.5 text-[12px] font-bold text-text-secondary bg-white dark:bg-slate-900 select-none z-10 transition-colors"
                        >
                          {isRtl ? "القسم *" : "Department *"}
                        </label>
                        <select
                          id="department"
                          disabled={isPending}
                          className={`block w-full h-12 px-4 rounded-[12px] text-text-primary text-sm font-semibold bg-transparent border border-slate-300 dark:border-slate-700 dark:border-slate-800 focus:border-brand-primary focus:ring-1 focus:ring-brand-primary/20 outline-none cursor-pointer appearance-none bg-no-repeat ${
                            errors.department ? "border-status-danger focus:ring-status-danger" : ""
                          }`}
                          style={{
                            backgroundPosition: isRtl ? "left 0.75rem center" : "right 0.75rem center",
                            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%252394A3B8' stroke-width='2.5'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='M19.5 8.25l-7.5 7.5-7.5-7.5'%3E%3C/path%3E%3C/svg%3E")`,
                            backgroundSize: "0.9rem"
                          }}
                          {...register("department")}
                        >
                          <option value="" className="dark:bg-slate-900">Select Department...</option>
                          {DEPARTMENTS.map((dept) => (
                            <option key={dept} value={dept} className="dark:bg-slate-900">
                              {dept}
                            </option>
                          ))}
                        </select>
                        {errors.department && (
                          <p className="text-[10px] font-bold text-status-danger mt-1.5 pl-1">
                            {errors.department.message}
                          </p>
                        )}
                      </div>

                      <div className="relative mt-5">
                        <label
                          htmlFor="designation"
                          className="absolute -top-2 left-3.5 px-1.5 text-[12px] font-bold text-text-secondary bg-white dark:bg-slate-900 select-none z-10 transition-colors"
                        >
                          {isRtl ? "المسمى الوظيفي *" : "Designation *"}
                        </label>
                        <input
                          id="designation"
                          type="text"
                          placeholder={isRtl ? "مثال: مهندس برمجيات" : "e.g. Senior Software Engineer"}
                          disabled={isPending}
                          aria-invalid={!!errors.designation}
                          className={`block w-full h-12 px-4 rounded-[12px] text-text-primary text-sm font-semibold bg-transparent border border-slate-300 dark:border-slate-700 dark:border-slate-800 focus:border-brand-primary focus:ring-1 focus:ring-brand-primary/20 outline-none placeholder-text-muted/40 transition-all duration-200 ${
                            errors.designation ? "border-status-danger focus:ring-status-danger" : ""
                          }`}
                          {...register("designation")}
                        />
                        {errors.designation && (
                          <p className="text-[10px] font-bold text-status-danger mt-1.5 pl-1">
                            {errors.designation.message}
                          </p>
                        )}
                      </div>

                      <div className="relative mt-5">
                        <label
                          htmlFor="employeeId"
                          className="absolute -top-2 left-3.5 px-1.5 text-[12px] font-bold text-text-secondary bg-white dark:bg-slate-900 select-none z-10 transition-colors"
                        >
                          {isRtl ? "الرقم الوظيفي" : "Employee ID (Optional)"}
                        </label>
                        <input
                          id="employeeId"
                          type="text"
                          placeholder="EMP-XXXX"
                          disabled={isPending}
                          className="block w-full h-12 px-4 rounded-[12px] text-text-primary text-sm font-semibold bg-transparent border border-slate-300 dark:border-slate-700 dark:border-slate-800 focus:border-brand-primary focus:ring-1 focus:ring-brand-primary/20 outline-none placeholder-text-muted/40 transition-all duration-200"
                          {...register("employeeId")}
                        />
                      </div>
                    </div>
                  )}

                  {/* STEP 3: Account Credentials */}
                  {step === 3 && (
                    <div className="space-y-5 animate-slide-up">
                      <div className="relative mt-5">
                        <label
                          htmlFor="email"
                          className="absolute -top-2 left-3.5 px-1.5 text-[12px] font-bold text-text-secondary bg-white dark:bg-slate-900 select-none z-10 transition-colors"
                        >
                          {isRtl ? "البريد الإلكتروني للشركة *" : "Company Email *"}
                        </label>
                        <input
                          id="email"
                          type="email"
                          autoComplete="email"
                          placeholder="name@company.com"
                          disabled={isPending}
                          aria-invalid={!!errors.email}
                          className={`block w-full h-12 px-4 rounded-[12px] text-text-primary text-sm font-semibold bg-transparent border border-slate-300 dark:border-slate-700 dark:border-slate-800 focus:border-brand-primary focus:ring-1 focus:ring-brand-primary/20 outline-none placeholder-text-muted/40 transition-all duration-200 ${
                            errors.email ? "border-status-danger focus:ring-status-danger" : ""
                          }`}
                          {...register("email")}
                        />
                        {errors.email && (
                          <p className="text-[10px] font-bold text-status-danger mt-1.5 pl-1">
                            {errors.email.message}
                          </p>
                        )}
                      </div>

                      <div className="relative mt-5">
                        <label
                          htmlFor="password"
                          className="absolute -top-2 left-3.5 px-1.5 text-[12px] font-bold text-text-secondary bg-white dark:bg-slate-900 select-none z-10 transition-colors"
                        >
                          {isRtl ? "كلمة المرور *" : "Password *"}
                        </label>
                        <div className="relative">
                          <input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            autoComplete="new-password"
                            placeholder={isRtl ? "أدخل كلمة المرور" : "Enter password"}
                            disabled={isPending}
                            aria-invalid={!!errors.password}
                            className={`block w-full h-12 px-4 pr-10 rounded-[12px] text-text-primary text-sm font-semibold bg-transparent border border-slate-300 dark:border-slate-700 dark:border-slate-800 focus:border-brand-primary focus:ring-1 focus:ring-brand-primary/20 outline-none placeholder-text-muted/40 transition-all duration-200 ${
                              errors.password ? "border-status-danger focus:ring-status-danger" : ""
                            }`}
                            {...register("password")}
                          />
                          <button
                            type="button"
                            tabIndex={-1}
                            onClick={() => setShowPassword((v) => !v)}
                            className="absolute inset-y-0 right-3 flex items-center text-text-muted/50 hover:text-text-primary transition-colors focus:outline-none"
                            aria-label={showPassword ? "Hide password" : "Show password"}
                          >
                            {showPassword ? (
                              <EyeOff className="h-5 w-5" />
                            ) : (
                              <Eye className="h-5 w-5" />
                            )}
                          </button>
                        </div>
                        {errors.password && (
                          <p className="text-[10px] font-bold text-status-danger mt-1.5 pl-1">
                            {errors.password.message}
                          </p>
                        )}
                      </div>

                      <div className="relative mt-5">
                        <label
                          htmlFor="confirmPassword"
                          className="absolute -top-2 left-3.5 px-1.5 text-[12px] font-bold text-text-secondary bg-white dark:bg-slate-900 select-none z-10 transition-colors"
                        >
                          {isRtl ? "تأكيد كلمة المرور *" : "Confirm Password *"}
                        </label>
                        <div className="relative">
                          <input
                            id="confirmPassword"
                            type={showConfirmPassword ? "text" : "password"}
                            autoComplete="new-password"
                            placeholder={isRtl ? "تأكيد كلمة المرور" : "Confirm password"}
                            disabled={isPending}
                            aria-invalid={!!errors.confirmPassword}
                            className={`block w-full h-12 px-4 pr-10 rounded-[12px] text-text-primary text-sm font-semibold bg-transparent border border-slate-300 dark:border-slate-700 dark:border-slate-800 focus:border-brand-primary focus:ring-1 focus:ring-brand-primary/20 outline-none placeholder-text-muted/40 transition-all duration-200 ${
                              errors.confirmPassword ? "border-status-danger focus:ring-status-danger" : ""
                            }`}
                            {...register("confirmPassword")}
                          />
                          <button
                            type="button"
                            tabIndex={-1}
                            onClick={() => setShowConfirmPassword((v) => !v)}
                            className="absolute inset-y-0 right-3 flex items-center text-text-muted/50 hover:text-text-primary transition-colors focus:outline-none"
                            aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                          >
                            {showConfirmPassword ? (
                              <EyeOff className="h-5 w-5" />
                            ) : (
                              <Eye className="h-5 w-5" />
                            )}
                          </button>
                        </div>
                        {errors.confirmPassword && (
                          <p className="text-[10px] font-bold text-status-danger mt-1.5 pl-1">
                            {errors.confirmPassword.message}
                          </p>
                        )}
                      </div>

                      {/* Compact Password Checklist */}
                      <div className="rounded-xl border border-slate-150 dark:border-slate-800/80 bg-slate-50/20 dark:bg-slate-900/5 p-3.5 space-y-1.5 select-none">
                        <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-1 leading-none">
                          Password Requirements
                        </p>
                        <div className="grid grid-cols-2 gap-x-3 gap-y-1.5">
                          {PASSWORD_RULES.map((rule) => {
                            const passed = rule.test(passwordValue);
                            return (
                              <div
                                key={rule.label}
                                className={`flex items-center gap-1.5 text-[10.5px] font-semibold transition-all duration-300 ${
                                  passed
                                    ? "text-status-success"
                                    : passwordValue.length > 0
                                      ? "text-status-danger"
                                      : "text-text-muted"
                                }`}
                              >
                                <div
                                  className={`h-3.5 w-3.5 rounded-full flex items-center justify-center shrink-0 transition-all duration-300 ${
                                    passed
                                      ? "bg-status-success/15 border border-status-success/40"
                                      : passwordValue.length > 0
                                        ? "bg-status-danger/10 border border-status-danger/30"
                                        : "bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-800"
                                  }`}
                                >
                                  {passed ? (
                                    <Check className="h-2 w-2 text-status-success font-bold animate-check-bounce" />
                                  ) : passwordValue.length > 0 ? (
                                    <X className="h-2 w-2 text-status-danger font-bold" />
                                  ) : (
                                    <div className="h-1 w-1 rounded-full bg-text-muted/40" />
                                  )}
                                </div>
                                <span className="truncate leading-none">{rule.label}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Terms & Conditions Checkbox */}
                      <div className="space-y-1 pl-1 mt-4">
                        <div className="flex items-start gap-2.5">
                          <input
                            id="acceptTerms"
                            type="checkbox"
                            disabled={isPending}
                            aria-invalid={!!errors.acceptTerms}
                            className="mt-0.5 h-4 w-4 text-[#3B42E3] focus:ring-[#3B42E3] border-slate-300 dark:border-slate-700 rounded cursor-pointer shrink-0"
                            {...register("acceptTerms")}
                          />
                          <label
                            htmlFor="acceptTerms"
                            className="text-[10px] font-semibold text-text-secondary cursor-pointer leading-tight"
                          >
                            I agree to the{" "}
                            <button
                              type="button"
                              className="font-bold text-[#3B42E3] hover:underline focus:outline-none"
                            >
                              Terms of Service
                            </button>{" "}
                            and{" "}
                            <button
                              type="button"
                              className="font-bold text-[#3B42E3] hover:underline focus:outline-none"
                            >
                              Privacy Policy
                            </button>
                            .<span className="text-status-danger ml-0.5">*</span>
                          </label>
                        </div>
                        {errors.acceptTerms && (
                          <p className="text-[9px] font-bold text-status-danger flex items-center gap-1 ml-6.5 mt-0.5">
                            <X className="h-2.5 w-2.5 shrink-0" />
                            {errors.acceptTerms.message}
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Stepper Actions Bar */}
                  <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800/60 mt-6 pt-4">
                    {step > 1 ? (
                      <button
                        type="button"
                        onClick={() => setStep((s) => s - 1)}
                        className="h-12 px-6 rounded-[12px] text-sm font-bold text-text-secondary hover:text-text-primary border border-slate-300 dark:border-slate-700 flex items-center gap-1.5 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                      >
                        <ChevronLeft className="h-4.5 w-4.5" />
                        <span>Back</span>
                      </button>
                    ) : (
                      <div />
                    )}

                    {step < 3 ? (
                      <button
                        type="button"
                        onClick={async () => {
                          const fields = step === 1 
                            ? ["firstName", "lastName", "mobile"] 
                            : ["department", "designation", "employeeId"];
                          const valid = await trigger(fields as any);
                          if (valid) setStep((s) => s + 1);
                        }}
                        className="h-12 px-6 rounded-[12px] text-sm font-bold text-white bg-[#3B42E3] hover:bg-[#2A31C8] flex items-center gap-1.5 cursor-pointer shadow-sm ml-auto transition-colors"
                      >
                        <span>Next</span>
                        <ChevronRight className="h-4.5 w-4.5" />
                      </button>
                    ) : (
                      <button
                        id="signup-submit-btn"
                        type="submit"
                        disabled={isPending || !isValid}
                        className={`h-12 px-6 rounded-[12px] text-sm font-bold text-white flex items-center gap-1.5 cursor-pointer shadow-sm
                          ${
                            isPending || !isValid
                              ? "bg-slate-300 dark:bg-slate-800 text-text-muted/60 cursor-not-allowed pointer-events-none"
                              : "bg-[#3B42E3] hover:bg-[#2A31C8] transition-colors"
                          }`}
                      >
                        {isPending ? (
                          <>
                            <Loader2 className="h-4.5 w-4.5 animate-spin" />
                            <span>Creating Account...</span>
                          </>
                        ) : (
                          <>
                            <ShieldCheck className="h-4.5 w-4.5" />
                            <span>Create Account</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>

                  {/* Google SSO Option (visible on Step 1) */}
                  {step === 1 && (
                    <div className="space-y-4 mt-6 pt-4 border-t border-slate-100 dark:border-slate-800/60 select-none">
                      <div className="flex items-center gap-3 select-none">
                        <div className="h-px bg-slate-200 dark:bg-slate-800 flex-1" />
                        <span className="text-[10px] font-bold text-text-muted/60 tracking-wider">
                          {isRtl ? "أو سجل باستخدام" : "Or register with"}
                        </span>
                        <div className="h-px bg-slate-200 dark:bg-slate-800 flex-1" />
                      </div>

                      <div className="flex justify-center w-full min-h-[44px]">
                        <GoogleButton
                          onSuccess={handleGoogleSuccess}
                          onError={(err) => setServerError(err)}
                          isLoading={isGooglePending || isPending}
                          disabled={isPending || isGooglePending}
                        />
                      </div>
                    </div>
                  )}

                  {/* Already have an account link */}
                  <div className="text-center text-xs font-medium text-text-secondary select-none pt-4">
                    {isRtl ? "لديك حساب بالفعل؟" : "Already have an account?"}{" "}
                    <Link
                      href="/login"
                      className="font-bold text-[#3B42E3] hover:underline"
                    >
                      {isRtl ? "تسجيل الدخول" : "Sign In"}
                    </Link>
                  </div>

                </form>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN: Interactive Feature Panel */}
          <div className="hidden lg:block bg-[#7B80FC] dark:bg-gradient-to-br dark:from-[#1E293B] dark:to-[#0F172A] dark:border dark:border-slate-800 rounded-[24px] relative overflow-hidden">
            <div className="absolute -top-12 -right-12 w-32 h-32 rounded-full bg-white/5 blur-xl" />
            <div className="absolute -bottom-16 -left-16 w-48 h-48 rounded-full bg-white/5 blur-2xl" />
            <LoginPromoPanel />
          </div>

        </div>
      </main>

      {/* ── Footer copyright strip ── */}
      <footer className="w-full max-w-none px-6 sm:px-10 lg:px-16 py-3.5 shrink-0">
        <Footer />
      </footer>
    </LoginLayout>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen w-full items-center justify-center bg-bg-primary dark:bg-[#060A17]">
        <Loader2 className="h-8 w-8 animate-spin text-brand-primary" />
      </div>
    }>
      <SignupPageContent />
    </Suspense>
  );
}
