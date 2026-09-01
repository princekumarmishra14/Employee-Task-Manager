"use client";

import React, { useState, useEffect } from "react";
import { useTranslation } from "@/hooks/useTranslation";
import { FolderLock, Mail, ArrowLeft, CheckCircle, KeyRound, ShieldCheck, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AuthService } from "@/services/auth.service";

export default function ForgotPasswordPage() {
  const { t, isRtl } = useTranslation();
  const router = useRouter();

  // Steps: "EMAIL" | "OTP" | "RESET" | "SUCCESS"
  const [step, setStep] = useState<"EMAIL" | "OTP" | "RESET" | "SUCCESS">("EMAIL");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Resend cooldown timer
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown((prev) => prev - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError(t.required || "Required field");
      return;
    }

    setIsPending(true);
    setError("");

    try {
      const res = await AuthService.forgotPassword(email);
      if (res.success) {
        setStep("OTP");
        setCooldown(60); // 60s cooldown
      } else {
        setError(res.message || "Failed to request OTP. Please try again.");
      }
    } catch (err: any) {
      const errorMsg = err?.response?.data?.message || err?.message || String(err);
      setError(errorMsg);
    } finally {
      setIsPending(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) {
      setError("Please enter a valid 6-digit OTP code.");
      return;
    }

    setIsPending(true);
    setError("");

    try {
      const res = await AuthService.verifyOtp(email, otp);
      if (res.success) {
        setStep("RESET");
      } else {
        setError(res.message || "Invalid OTP code.");
      }
    } catch (err: any) {
      const errorMsg = err?.response?.data?.message || err?.message || String(err);
      setError(errorMsg);
    } finally {
      setIsPending(false);
    }
  };

  const handleResendOtp = async () => {
    if (cooldown > 0) return;
    setIsPending(true);
    setError("");

    try {
      const res = await AuthService.resendOtp(email);
      if (res.success) {
        setCooldown(60);
        setSuccessMsg("A new 6-digit OTP code has been successfully sent.");
        setTimeout(() => setSuccessMsg(""), 4000);
      } else {
        setError(res.message || "Failed to resend OTP.");
      }
    } catch (err: any) {
      const errorMsg = err?.response?.data?.message || err?.message || String(err);
      setError(errorMsg);
    } finally {
      setIsPending(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsPending(true);
    setError("");

    try {
      const res = await AuthService.resetPassword({
        email,
        otp,
        password,
        confirmPassword,
      });
      if (res.success) {
        setStep("SUCCESS");
        setTimeout(() => router.push("/login"), 5000);
      } else {
        setError(res.message || "Failed to reset password.");
      }
    } catch (err: any) {
      const errorMsg = err?.response?.data?.message || err?.message || String(err);
      setError(errorMsg);
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center text-brand-primary">
          <FolderLock className="h-12 w-12 text-brand-primary animate-pulse" />
        </div>
        <h2 className="mt-6 text-center text-3xl font-black tracking-tight text-text-primary uppercase">
          {t.resetPasswordTitle}
        </h2>
        <p className="mt-2 text-center text-xs font-semibold text-text-secondary uppercase tracking-wider">
          {isRtl ? "إعادة تعيين كلمة المرور باستخدام رمز OTP" : "Secure OTP Password Reset"}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="glass-panel py-8 px-6 sm:px-10 shadow-xl rounded-2xl border border-border-clean dark:border-border-clean/50 hover:shadow-2xl transition-all duration-300">
          {step === "EMAIL" && (
            <form className="space-y-6" onSubmit={handleRequestOtp}>
              <p className="text-xs text-text-secondary font-semibold">
                {isRtl
                  ? "أدخل بريدك الإلكتروني وسنرسل لك رمز OTP مكونًا من 6 أرقام لإعادة تعيين كلمة المرور."
                  : "Enter your registered email and we will dispatch a secure 6-digit OTP code to authorize password resetting."}
              </p>

              <div>
                <label htmlFor="email" className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-1">
                  {t.empEmail}
                </label>
                <div className="relative rounded-xl shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Mail className="h-4 w-4 text-text-muted" />
                  </div>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setError("");
                    }}
                    disabled={isPending}
                    placeholder="Enter your registered email"
                    className="block w-full pl-10 pr-3 py-2.5 border border-border-clean rounded-xl bg-bg-secondary text-text-primary placeholder:text-text-muted/60 focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent dark:bg-bg-tertiary sm:text-sm font-semibold transition-all disabled:opacity-60"
                  />
                </div>
                {error && <span className="text-xs text-status-danger mt-1.5 block font-bold">{error}</span>}
              </div>

              <div>
                <button
                  type="submit"
                  disabled={isPending}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 border border-transparent rounded-xl shadow-md text-xs font-bold uppercase tracking-wider text-white bg-brand-primary hover:bg-brand-secondary focus:outline-none focus:ring-2 focus:ring-brand-primary transition-all active:scale-95 cursor-pointer shadow-glow-primary disabled:opacity-60"
                >
                  {isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <span>{isRtl ? "إرسال رمز OTP" : "Request OTP Code"}</span>
                  )}
                </button>
              </div>

              <div className="text-center pt-2 border-t border-border-clean">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-text-muted hover:text-brand-primary transition-colors"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  <span>{isRtl ? "العودة لتسجيل الدخول" : "Back to login"}</span>
                </Link>
              </div>
            </form>
          )}

          {step === "OTP" && (
            <form className="space-y-6" onSubmit={handleVerifyOtp}>
              <p className="text-xs text-text-secondary font-semibold">
                {isRtl
                  ? `أدخل رمز OTP المكون من 6 أرقام المرسل إلى ${email}`
                  : `Please enter the 6-digit OTP code sent to your email address: ${email}`}
              </p>

              <div>
                <label htmlFor="otp" className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-1">
                  {isRtl ? "رمز التحقق OTP" : "OTP Code"}
                </label>
                <div className="relative rounded-xl shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <ShieldCheck className="h-4 w-4 text-text-muted" />
                  </div>
                  <input
                    id="otp"
                    type="text"
                    maxLength={6}
                    value={otp}
                    onChange={(e) => {
                      setOtp(e.target.value.replace(/\D/g, ""));
                      setError("");
                    }}
                    disabled={isPending}
                    placeholder="123456"
                    className="block w-full pl-10 pr-3 py-2.5 border border-border-clean rounded-xl bg-bg-secondary text-text-primary placeholder:text-text-muted/60 focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent dark:bg-bg-tertiary sm:text-sm font-semibold transition-all tracking-widest text-center text-lg disabled:opacity-60"
                  />
                </div>
                {error && <span className="text-xs text-status-danger mt-1.5 block font-bold">{error}</span>}
                {successMsg && <span className="text-xs text-status-success mt-1.5 block font-bold">{successMsg}</span>}
              </div>

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={isPending || cooldown > 0}
                  className="w-1/2 flex items-center justify-center py-2.5 px-4 border border-border-clean rounded-xl text-xs font-bold uppercase tracking-wider text-text-secondary bg-bg-secondary hover:bg-bg-tertiary disabled:opacity-50 transition-all cursor-pointer"
                >
                  {cooldown > 0 ? `${cooldown}s` : isRtl ? "إعادة إرسال" : "Resend OTP"}
                </button>
                <button
                  type="submit"
                  disabled={isPending || otp.length !== 6}
                  className="w-1/2 flex items-center justify-center gap-2 py-2.5 px-4 border border-transparent rounded-xl shadow-md text-xs font-bold uppercase tracking-wider text-white bg-brand-primary hover:bg-brand-secondary disabled:opacity-60 transition-all cursor-pointer"
                >
                  {isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <span>{isRtl ? "تحقق" : "Verify Code"}</span>
                  )}
                </button>
              </div>

              <div className="text-center pt-2 border-t border-border-clean">
                <button
                  type="button"
                  onClick={() => {
                    setStep("EMAIL");
                    setError("");
                  }}
                  className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-text-muted hover:text-brand-primary transition-colors"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  <span>{isRtl ? "تغيير البريد الإلكتروني" : "Change email"}</span>
                </button>
              </div>
            </form>
          )}

          {step === "RESET" && (
            <form className="space-y-6" onSubmit={handleResetPassword}>
              <p className="text-xs text-text-secondary font-semibold">
                {isRtl ? "أدخل كلمة المرور الجديدة الخاصة بك." : "Create and confirm your new account password."}
              </p>

              <div>
                <label htmlFor="pass" className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-1">
                  {isRtl ? "كلمة المرور الجديدة" : "New Password"}
                </label>
                <div className="relative rounded-xl shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <KeyRound className="h-4 w-4 text-text-muted" />
                  </div>
                  <input
                    id="pass"
                    type="password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setError("");
                    }}
                    disabled={isPending}
                    placeholder="••••••••"
                    className="block w-full pl-10 pr-3 py-2.5 border border-border-clean rounded-xl bg-bg-secondary text-text-primary placeholder:text-text-muted/60 focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent dark:bg-bg-tertiary sm:text-sm font-semibold transition-all disabled:opacity-60"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="confirmPass" className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-1">
                  {isRtl ? "تأكيد كلمة المرور" : "Confirm Password"}
                </label>
                <div className="relative rounded-xl shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <KeyRound className="h-4 w-4 text-text-muted" />
                  </div>
                  <input
                    id="confirmPass"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      setError("");
                    }}
                    disabled={isPending}
                    placeholder="••••••••"
                    className="block w-full pl-10 pr-3 py-2.5 border border-border-clean rounded-xl bg-bg-secondary text-text-primary placeholder:text-text-muted/60 focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent dark:bg-bg-tertiary sm:text-sm font-semibold transition-all disabled:opacity-60"
                  />
                </div>
                {error && <span className="text-xs text-status-danger mt-1.5 block font-bold">{error}</span>}
              </div>

              <div>
                <button
                  type="submit"
                  disabled={isPending || !password || password !== confirmPassword}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 border border-transparent rounded-xl shadow-md text-xs font-bold uppercase tracking-wider text-white bg-brand-primary hover:bg-brand-secondary disabled:opacity-60 transition-all cursor-pointer shadow-glow-primary"
                >
                  {isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <span>{isRtl ? "تغيير كلمة المرور" : "Reset Password"}</span>
                  )}
                </button>
              </div>
            </form>
          )}

          {step === "SUCCESS" && (
            <div className="space-y-6 text-center">
              <div className="flex justify-center text-status-success">
                <CheckCircle className="h-14 w-14 animate-bounce" />
              </div>
              <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider">
                {isRtl ? "تم تغيير كلمة المرور بنجاح!" : "Password Reset Successfully!"}
              </h3>
              <p className="text-xs font-semibold text-text-secondary leading-relaxed">
                {isRtl
                  ? "تم تحديث كلمة المرور الخاصة بك بنجاح. سيتم تحويلك إلى صفحة تسجيل الدخول في غضون ثوانٍ."
                  : "Your password has been updated. You will be redirected to the login screen shortly."}
              </p>
              <div className="pt-4 border-t border-border-clean">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-brand-primary hover:text-brand-secondary transition-all"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>{isRtl ? "الذهاب لتسجيل الدخول" : "Go to login"}</span>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
