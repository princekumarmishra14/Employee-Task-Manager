/**
 * src/providers/SessionProvider.tsx
 * Wraps the app in NextAuth's SessionProvider for client-side session access.
 */

"use client";

import { SessionProvider } from "next-auth/react";

export default function AuthSessionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return <SessionProvider>{children}</SessionProvider>;
}
