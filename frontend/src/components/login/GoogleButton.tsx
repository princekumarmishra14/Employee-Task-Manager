"use client";

import React from "react";
import { GoogleButton as ReactGoogleButton } from "@/components/auth/GoogleButton";
import { CredentialResponse } from "@react-oauth/google";

interface GoogleButtonProps {
  onSuccess: (credentialResponse: CredentialResponse) => void;
  onError: (errorMsg: string) => void;
  isLoading: boolean;
  disabled: boolean;
}

export default function GoogleButton({
  onSuccess,
  onError,
  isLoading,
  disabled,
}: GoogleButtonProps) {
  return (
    <div className="w-full flex justify-center select-none">
      <ReactGoogleButton
        onSuccess={onSuccess}
        onError={onError}
        isLoading={isLoading}
        disabled={disabled}
      />
    </div>
  );
}
