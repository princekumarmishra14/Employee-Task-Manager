/**
 * frontend/src/providers/GoogleProvider.tsx
 * Component to wrap context scopes with GoogleOAuthProvider conditionally.
 */

"use client";

import React from "react";
import { GoogleOAuthProvider } from "@react-oauth/google";

export function isGoogleAuthConfigured(): boolean {
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID?.trim();
  return Boolean(
    clientId &&
    clientId !== "YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com" &&
    !clientId.startsWith("YOUR_GOOGLE_CLIENT_ID")
  );
}

export default function GoogleProvider({ children }: { children: React.ReactNode }) {
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID?.trim() || "";
  const configured = isGoogleAuthConfigured();

  if (!configured) {
    // If not configured, do not mount GoogleOAuthProvider to avoid HTTP 400 and redundant script loads
    return <>{children}</>;
  }

  return (
    <GoogleOAuthProvider clientId={clientId}>
      {children}
    </GoogleOAuthProvider>
  );
}
