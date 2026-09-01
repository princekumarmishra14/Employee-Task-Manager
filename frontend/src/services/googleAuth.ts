/**
 * frontend/src/services/googleAuth.ts
 * Service client-side functions for linking and unlinking Google accounts.
 */

import api from "@/lib/axios";

export interface ConnectResult {
  success: boolean;
  message: string;
  data?: {
    googleId: string;
  };
}

export interface DisconnectResult {
  success: boolean;
  message: string;
}

/**
 * Links a Google account using the provided ID Token.
 */
export async function connectGoogleAccount(idToken: string): Promise<ConnectResult> {
  const res = await api.post<ConnectResult>("/auth/google/connect", { idToken });
  return res.data;
}

/**
 * Disconnects the Google account integration.
 */
export async function disconnectGoogleAccount(): Promise<DisconnectResult> {
  const res = await api.post<DisconnectResult>("/auth/google/disconnect");
  return res.data;
}
