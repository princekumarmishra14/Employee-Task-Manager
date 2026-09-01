/**
 * frontend/src/components/auth/GoogleButton.tsx
 * A modern, accessible, responsive "Continue with Google" button.
 * Integrates directly with the GSI SDK inside a safe boundary.
 */

"use client";

import React from "react";
import { GoogleLogin, CredentialResponse } from "@react-oauth/google";
import { useTranslation } from "@/hooks/useTranslation";
import { Loader2 } from "lucide-react";
import { useTheme } from "@/hooks/use-theme";

interface GoogleButtonProps {
  onSuccess: (credentialResponse: CredentialResponse) => void;
  onError: (errorMsg: string) => void;
  isLoading?: boolean;
  disabled?: boolean;
}

export function GoogleButton({ onSuccess, onError, isLoading = false, disabled = false }: GoogleButtonProps) {
  const { isRtl } = useTranslation();
  const { isDark, mounted } = useTheme();

  if (isLoading) {
    return (
      <div 
        role="status"
        aria-live="polite"
        className="w-full flex justify-center items-center gap-2.5 py-2.5 px-4 border border-border-clean rounded-xl bg-bg-secondary text-text-muted text-xs font-bold font-sans select-none"
      >
        <Loader2 className="h-3.5 w-3.5 animate-spin text-brand-primary" aria-hidden="true" />
        <span>{isRtl ? "يرجى الانتظار..." : "Please wait..."}</span>
      </div>
    );
  }

  // Fallback to outline/light style during SSR or before hydration
  const activeGoogleTheme = mounted && isDark ? "filled_black" : "outline";

  return (
    <div className={`w-full flex justify-center focus-within:ring-2 focus-within:ring-brand-primary focus-within:ring-offset-2 rounded-full transition-all duration-200 ${disabled ? "opacity-50 pointer-events-none" : ""}`}>
      <GoogleLogin
        key={mounted && isDark ? "dark" : "light"}
        onSuccess={onSuccess}
        onError={() => onError("Google authentication failed. Please try again.")}
        theme={activeGoogleTheme}
        shape="pill"
        size="large"
        width="348"
        text="continue_with"
      />
    </div>
  );
}
