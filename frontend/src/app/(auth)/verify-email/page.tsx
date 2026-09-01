"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useTranslation } from "@/hooks/useTranslation";
import { FolderLock, CheckCircle, XCircle, Loader2, Mail, ArrowRight } from "lucide-react";
import Link from "next/link";
import { AuthService } from "@/services/auth.service";

function VerifyEmailContent() {
  const { t, isRtl } = useTranslation();
  const searchParams = useSearchParams();
  const router = useRouter();

  const token = searchParams.get("token") || "";

  // States: "LOADING" | "SUCCESS" | "FAILED"
  const [status, setStatus] = useState<"LOADING" | "SUCCESS" | "FAILED">("LOADING");
  const [errorMessage, setErrorMessage] = useState("");

  // Resend Verification states
  const [email, setEmail] = useState("");
  const [resendPending, setResendPending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState("");
  const [resendError, setResendError] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("FAILED");
      setErrorMessage(isRtl ? "رمز التحقق مفقود." : "Verification token is missing.");
      return;
    }

    const performVerification = async () => {
      try {
        const res = await AuthService.verifyEmail(token);
        if (res.success) {
          setStatus("SUCCESS");
          // Redirect to login after 5 seconds
          setTimeout(() => {
            router.push("/login");
          }, 5000);
        } else {
          setStatus("FAILED");
          setErrorMessage(res.message || (isRtl ? "فشل التحقق من البريد الإلكتروني." : "Verification failed."));
        }
      } catch (err: any) {
        setStatus("FAILED");
        const msg = err?.response?.data?.message || err?.message || String(err);
        setErrorMessage(msg);
      }
    };

    performVerification();
  }, [token, isRtl, router]);

  const handleResend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setResendError(t.required || "Required field");
      return;
    }

    setResendPending(true);
    setResendError("");
    setResendSuccess("");

    try {
      const res = await AuthService.resendVerification(email);
      if (res.success) {
        setResendSuccess(res.message || (isRtl ? "تم إرسال رابط التحقق بنجاح." : "Verification link sent successfully."));
      } else {
        setResendError(res.message || "Failed to resend verification.");
      }
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || String(err);
      setResendError(msg);
    } finally {
      setResendPending(false);
    }
  };

  return (
    <div className="flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center text-brand-primary">
          <FolderLock className="h-12 w-12 text-brand-primary animate-pulse" />
        </div>
        <h2 className="mt-6 text-center text-3xl font-black tracking-tight text-text-primary uppercase">
          {isRtl ? "تأكيد الحساب" : "Account Verification"}
        </h2>
        <p className="mt-2 text-center text-xs font-semibold text-text-secondary uppercase tracking-wider">
          {isRtl ? "تأكيد عنوان البريد الإلكتروني الخاص بك" : "Verify Your Email Address"}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="glass-panel py-8 px-6 sm:px-10 shadow-xl rounded-2xl border border-border-clean dark:border-border-clean/50 hover:shadow-2xl transition-all duration-300">
          {status === "LOADING" && (
            <div className="space-y-6 text-center py-4">
              <div className="flex justify-center">
                <Loader2 className="h-12 w-12 text-brand-primary animate-spin" />
              </div>
              <p className="text-sm font-semibold text-text-secondary">
                {isRtl ? "جاري التحقق من بريدك الإلكتروني، يرجى الانتظار..." : "Validating token and activating your employee profile, please wait..."}
              </p>
            </div>
          )}

          {status === "SUCCESS" && (
            <div className="space-y-6 text-center">
              <div className="flex justify-center text-status-success">
                <CheckCircle className="h-14 w-14 animate-bounce" />
              </div>
              <h3 className="text-md font-bold text-text-primary uppercase tracking-wider">
                {isRtl ? "تم التحقق من البريد بنجاح!" : "Email Verified Successfully!"}
              </h3>
              <p className="text-xs font-semibold text-text-secondary leading-relaxed">
                {isRtl
                  ? "تم تفعيل حسابك بنجاح. سيتم توجيهك تلقائياً إلى صفحة تسجيل الدخول."
                  : "Your account is activated and ready. You will be redirected to the login page within 5 seconds."}
              </p>
              <div className="pt-4 border-t border-border-clean">
                <Link
                  href="/login"
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 border border-transparent rounded-xl shadow-md text-xs font-bold uppercase tracking-wider text-white bg-brand-primary hover:bg-brand-secondary transition-all"
                >
                  <span>{isRtl ? "تسجيل الدخول الآن" : "Sign In Now"}</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          )}

          {status === "FAILED" && (
            <div className="space-y-6">
              <div className="text-center space-y-4">
                <div className="flex justify-center text-status-danger">
                  <XCircle className="h-14 w-14 animate-pulse" />
                </div>
                <h3 className="text-md font-bold text-status-danger uppercase tracking-wider">
                  {isRtl ? "فشل التحقق من البريد الإلكتروني" : "Verification Failed"}
                </h3>
                <p className="text-xs font-semibold text-status-danger leading-relaxed">
                  {errorMessage}
                </p>
              </div>

              <div className="divider"></div>

              <form className="space-y-4" onSubmit={handleResend}>
                <h4 className="text-xs font-bold text-text-primary uppercase tracking-wider">
                  {isRtl ? "طلب رابط تحقق جديد" : "Request New Verification Link"}
                </h4>
                <p className="text-[11px] text-text-secondary leading-relaxed">
                  {isRtl
                    ? "أدخل بريدك الإلكتروني أدناه لإرسال رابط تفعيل جديد إلى حسابك."
                    : "Enter your registered email address below to dispatch a new activation link."}
                </p>

                <div>
                  <label htmlFor="email" className="block text-[10px] font-bold text-text-secondary uppercase tracking-wider mb-1">
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
                        setResendError("");
                        setResendSuccess("");
                      }}
                      disabled={resendPending}
                      placeholder="employee@company.com"
                      className="block w-full pl-10 pr-3 py-2 border border-border-clean rounded-xl bg-bg-secondary text-text-primary placeholder:text-text-muted/60 focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent dark:bg-bg-tertiary text-xs font-semibold transition-all disabled:opacity-60"
                    />
                  </div>
                  {resendError && <span className="text-xs text-status-danger mt-1 block font-bold">{resendError}</span>}
                  {resendSuccess && <span className="text-xs text-status-success mt-1 block font-bold">{resendSuccess}</span>}
                </div>

                <button
                  type="submit"
                  disabled={resendPending}
                  className="w-full flex items-center justify-center gap-2 py-2 px-4 border border-transparent rounded-xl shadow-sm text-xs font-bold uppercase tracking-wider text-white bg-brand-primary hover:bg-brand-secondary transition-all active:scale-95 cursor-pointer disabled:opacity-60"
                >
                  {resendPending ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <span>{isRtl ? "إرسال رابط جديد" : "Send Activation Link"}</span>
                  )}
                </button>
              </form>

              <div className="text-center pt-2 border-t border-border-clean">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-text-muted hover:text-brand-primary transition-colors"
                >
                  <ArrowRight className="h-3.5 w-3.5 rotate-180" />
                  <span>{isRtl ? "العودة لتسجيل الدخول" : "Back to login"}</span>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col justify-center items-center py-24">
        <Loader2 className="h-10 w-10 text-brand-primary animate-spin" />
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  );
}
