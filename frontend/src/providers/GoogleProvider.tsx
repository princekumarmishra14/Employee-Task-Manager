/**
 * frontend/src/providers/GoogleProvider.tsx
 * Component to wrap context scopes with GoogleOAuthProvider.
 */

"use client";

import React from "react";
import { GoogleOAuthProvider } from "@react-oauth/google";

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "";

export default function GoogleProvider({ children }: { children: React.ReactNode }) {
  if (!GOOGLE_CLIENT_ID) {
    console.warn("[GoogleProvider] NEXT_PUBLIC_GOOGLE_CLIENT_ID is not configured.");
  }

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      {children}
    </GoogleOAuthProvider>
  );
}
