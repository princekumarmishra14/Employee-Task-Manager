/**
 * frontend/src/hooks/useGoogleLogin.ts
 * Custom hook to orchestrate Google login server actions and router redirection.
 */

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { googleLoginAction } from "@/app/actions/auth";
import { CredentialResponse } from "@react-oauth/google";

export function useGoogleLogin(callbackUrl: string = "/dashboard") {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleGoogleSuccess = async (credentialResponse: CredentialResponse) => {
    const idToken = credentialResponse.credential;
    if (!idToken) {
      setError("No Google credential token returned.");
      return;
    }

    setError(null);

    startTransition(async () => {
      try {
        const result = await googleLoginAction(idToken);
        if (result?.error) {
          setError(result.error);
        } else {
          router.push(callbackUrl);
          router.refresh();
        }
      } catch (err: unknown) {
        const errMsg = err instanceof Error ? err.message : "Google Sign-In failed.";
        setError(errMsg);
      }
    });
  };

  return {
    handleGoogleSuccess,
    isPending,
    error,
    setError,
  };
}
