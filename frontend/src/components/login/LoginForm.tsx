"use client";

import React, { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Mail, Lock, Eye, EyeOff, Loader2, ShieldAlert, ArrowRight } from "lucide-react";
import { loginAction } from "@/app/actions/auth";
import { useTranslation } from "@/hooks/useTranslation";
import { AuthService } from "@/services/auth.service";
import PasswordChecklist from "./PasswordChecklist";
import GoogleButton from "./GoogleButton";
import RoleQuickLogin, { DemoRole } from "./RoleQuickLogin";
import { useGoogleLogin } from "@/hooks/useGoogleLogin";

const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required.")
    .email("Please enter a valid email address."),
  password: z.string().min(1, "Password is required."),
});

type LoginFormData = z.infer<typeof loginSchema>;

interface LoginFormProps {
  isRtl?: boolean;
}

export default function LoginForm({ isRtl = false }: LoginFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";
  const { t } = useTranslation();

  const [serverError, setServerError] = useState("");
  const [isPending, startTransition] = useTransition();
  const [showPassword, setShowPassword] = useState(false);
  const [verificationResent, setVerificationResent] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isValid },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: "onChange",
  });

  const emailVal = watch("email") || "";
  const passwordVal = watch("password") || "";

  // Password Policy Checks (live feedback)
  const passwordValidation = React.useMemo(() => {
    const minLength = passwordVal.length >= 8;
    const uppercase = /[A-Z]/.test(passwordVal);
    const lowercase = /[a-z]/.test(passwordVal);
    const number = /[0-9]/.test(passwordVal);
    const special = /[!@#$%^&*()_+\-={}[\]:;"'<>,.?]/.test(passwordVal);
    const noSpaces = passwordVal.length > 0 && !/\s/.test(passwordVal);
    return minLength && uppercase && lowercase && number && special && noSpaces;
  }, [passwordVal]);

  const {
    handleGoogleSuccess,
    isPending: isGooglePending,
    error: googleError,
  } = useGoogleLogin(callbackUrl);

  // Sync Google auth error with local form state
  React.useEffect(() => {
    if (googleError) {
      setServerError(googleError);
    }
  }, [googleError]);

  const handleResendVerification = async () => {
    if (!emailVal) return;
    setResendLoading(true);
    setServerError("");
    try {
      const res = await AuthService.resendVerification(emailVal);
      if (res.success) {
        setVerificationResent(true);
      } else {
        setServerError(res.message);
      }
    } catch (err: any) {
      setServerError(err.message || "Failed to resend verification email.");
    } finally {
      setResendLoading(false);
    }
  };

  const onSubmit = (data: LoginFormData) => {
    if (!passwordValidation) return;
    setServerError("");

    const formData = new FormData();
    formData.append("email", data.email.toLowerCase().trim());
    formData.append("password", data.password);

    startTransition(async () => {
      setVerificationResent(false);
      const result = await loginAction(formData);
      if (result?.error) {
        setServerError(result.error);
      } else {
        router.push(callbackUrl);
        router.refresh();
      }
    });
  };

  const handleQuickLogin = (role: DemoRole) => {
    const creds: Record<DemoRole, { email: string; password: string }> = {
      SUPER_ADMIN: { email: "superadmin@etm.com", password: "SuperAdmin@123" },
      ADMIN:       { email: "admin@etm.com", password: "Admin@123" },
      MANAGER:     { email: "sofia.reyes@enterprise.com", password: "Manager@123" },
      EMPLOYEE:    { email: "sarah.jenkins@enterprise.com", password: "Employee@123" },
      VIEWER:      { email: "robert.hayes@enterprise.com", password: "Viewer@123" },
    };

    const targetCreds = creds[role];
    if (!targetCreds) return;

    setServerError("");
    setValue("email", targetCreds.email, { shouldValidate: true });
    setValue("password", targetCreds.password, { shouldValidate: true });

    const formData = new FormData();
    formData.append("email", targetCreds.email);
    formData.append("password", targetCreds.password);

    startTransition(async () => {
      const result = await loginAction(formData);
      if (result?.error) {
        setServerError(result.error);
      } else {
        router.push(callbackUrl);
        router.refresh();
      }
    });
  };

  const isFormValid = isValid && passwordValidation && !isGooglePending && !isPending;

  return (
    <form className="space-y-4 select-none text-left" onSubmit={handleSubmit(onSubmit)} id="login-form" noValidate>
      {serverError && (
        <div
          role="alert"
          aria-live="assertive"
          className="flex flex-col gap-1.5 rounded-xl bg-status-danger/10 border border-status-danger/20 p-2.5 text-xs font-bold text-status-danger animate-slide-up"
        >
          <div className="flex items-center gap-2">
            <ShieldAlert className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span className="truncate">
              {serverError === "EMAIL_UNVERIFIED"
                ? (isRtl ? "يرجى تأكيد بريدك الإلكتروني قبل تسجيل الدخول." : "Please verify your email address before signing in.")
                : serverError}
            </span>
          </div>
          {serverError === "EMAIL_UNVERIFIED" && !verificationResent && (
            <button
              type="button"
              onClick={handleResendVerification}
              disabled={resendLoading}
              className="mt-0.5 self-start inline-flex items-center gap-1 font-black underline hover:text-brand-secondary cursor-pointer disabled:opacity-50"
            >
              {resendLoading ? (
                <>
                  <Loader2 className="h-3 w-3 animate-spin" />
                  <span>{isRtl ? "جاري الإرسال..." : "Sending..."}</span>
                </>
              ) : (
                <span>{isRtl ? "إعادة إرسال رابط التفعيل" : "Resend Verification Link"}</span>
              )}
            </button>
          )}
          {verificationResent && (
            <span className="mt-0.5 text-[10px] text-status-success font-black">
              {isRtl ? "تم إرسال رابط تفعيل جديد إلى بريدك." : "A new activation link has been sent to your email."}
            </span>
          )}
        </div>
      )}

      {/* Email Input Field */}
      <div className="relative mt-6 mb-5">
        <label
          htmlFor="email-input"
          className="absolute -top-2 left-3 px-1.5 text-[12px] font-bold text-text-secondary dark:text-slate-400 bg-white dark:bg-slate-900 select-none z-10 transition-colors"
        >
          {isRtl ? "البريد الإلكتروني" : "Email"}
        </label>
        <input
          id="email-input"
          type="email"
          autoComplete="email"
          placeholder={isRtl ? "أدخل البريد الإلكتروني" : "Enter the email"}
          disabled={isPending || isGooglePending}
          aria-invalid={!!errors.email}
          className={`block w-full h-12 px-4 rounded-[12px] text-text-primary text-sm font-semibold bg-slate-50/20 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-700/80 hover:border-slate-300 dark:hover:border-slate-600 focus:border-[#3B42E3] dark:focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/10 outline-none placeholder-slate-400 dark:placeholder-slate-500 transition-all duration-200 ${
            errors.email ? "border-status-danger focus:ring-status-danger" : ""
          }`}
          {...register("email")}
        />
        {errors.email && (
          <p id="email-error" className="text-[10px] font-bold text-status-danger mt-1.5 pl-1">
            {errors.email.message}
          </p>
        )}
      </div>

      {/* Password Input Field */}
      <div className="relative mb-2">
        <label
          htmlFor="password-input"
          className="absolute -top-2 left-3 px-1.5 text-[12px] font-bold text-text-secondary dark:text-slate-400 bg-white dark:bg-slate-900 select-none z-10 transition-colors"
        >
          {isRtl ? "كلمة المرور" : "Password"}
        </label>
        <div className="relative">
          <input
            id="password-input"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            placeholder={isRtl ? "أدخل كلمة المرور" : "Enter the Password"}
            disabled={isPending || isGooglePending}
            className="block w-full h-12 px-4 pr-10 rounded-[12px] text-text-primary text-sm font-semibold bg-slate-50/20 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-700/80 hover:border-slate-300 dark:hover:border-slate-600 focus:border-[#3B42E3] dark:focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/10 outline-none placeholder-slate-400 dark:placeholder-slate-500 transition-all duration-200"
            {...register("password")}
          />
          <button
            type="button"
            tabIndex={-1}
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 z-10 text-text-muted/50 hover:text-text-primary transition-all duration-200 active:scale-90 cursor-pointer"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Forgot Password Link */}
      <div className="flex justify-end mb-5">
        <a
          href="/forgot-password"
          className="text-xs font-bold text-text-secondary dark:text-slate-400 hover:text-[#3B42E3] dark:hover:text-brand-primary transition-colors"
        >
          {isRtl ? "هل نسيت كلمة المرور؟" : "Forgot password?"}
        </a>
      </div>

      {/* Password requirements list checklist (retained for user safety, styled compactly) */}
      {passwordVal.length > 0 && (
        <div className="mb-5">
          <PasswordChecklist value={passwordVal} isRtl={isRtl} />
        </div>
      )}

      {/* Sign In submit button */}
      <div>
        <button
          id="login-submit-btn"
          type="submit"
          disabled={!isFormValid}
          aria-busy={isPending}
          className={`w-full h-12 flex justify-center items-center gap-2 px-4 rounded-[12px] text-sm font-bold text-white transition-all duration-300
            ${
              !isFormValid
                ? "bg-slate-200 dark:bg-slate-800/60 text-slate-400 dark:text-slate-500 cursor-not-allowed pointer-events-none"
                : "bg-[#3B42E3] hover:bg-[#2A31C8] dark:bg-[#4F46E5] dark:hover:bg-[#4338CA] active:scale-[0.98] cursor-pointer dark:shadow-[0_0_20px_rgba(79,70,229,0.25)]"
            }`}
        >
          {isPending ? (
            <>
              <Loader2 className="h-4.5 w-4.5 animate-spin" aria-hidden="true" />
              <span>{isRtl ? "جارٍ التحقق..." : "Signing in..."}</span>
            </>
          ) : (
            <span>{isRtl ? "تسجيل الدخول" : "Sign in"}</span>
          )}
        </button>
      </div>

      {/* OR separator */}
      <div className="flex items-center gap-3 py-2.5 select-none">
        <div className="h-px bg-slate-200 dark:bg-slate-800 flex-1" />
        <span className="text-[10px] font-bold text-text-muted/60 tracking-wider">
          {isRtl ? "أو تابع باستخدام" : "Or continue"}
        </span>
        <div className="h-px bg-slate-200 dark:bg-slate-800 flex-1" />
      </div>

      {/* Google SSO button */}
      <div className="flex justify-center w-full min-h-[44px]">
        <GoogleButton
          onSuccess={handleGoogleSuccess}
          onError={(err) => setServerError(err)}
          isLoading={isGooglePending || isPending}
          disabled={isPending || isGooglePending}
        />
      </div>

      {/* Don't have an account link */}
      <div className="text-center text-xs font-medium text-text-secondary select-none pt-1">
        {isRtl ? "ليس لديك حساب؟" : "Don't have an account?"}{" "}
        <Link
          href="/signup"
          className="font-bold text-[#3B42E3] hover:underline"
        >
          {isRtl ? "إنشاء حساب" : "Sign Up"}
        </Link>
      </div>

      {/* Collapsible Demo Quick Login section at the bottom */}
      <div className="border-t border-slate-100 dark:border-slate-800/50 mt-4 pt-2">
        <details className="cursor-pointer group">
          <summary className="text-[10px] font-bold text-text-muted/65 hover:text-text-primary transition-colors list-none flex items-center justify-between">
            <span>{isRtl ? "تسجيل دخول سريع للتجربة (المطورين)" : "Developer Quick Login Roles"}</span>
            <span className="transition-transform group-open:rotate-180">▼</span>
          </summary>
          <div className="pt-2">
            <RoleQuickLogin
              onSelect={handleQuickLogin}
              isPending={isPending || isGooglePending}
              isRtl={isRtl}
            />
          </div>
        </details>
      </div>
    </form>
  );
}
