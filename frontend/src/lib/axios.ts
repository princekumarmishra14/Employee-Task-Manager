/**
 * src/lib/axios.ts
 * Enterprise Axios client with interceptors.
 *
 * Architecture: UI → Hooks → Services → API Layer → Axios Client → Backend
 * This module sits at the "Axios Client" layer.
 *
 * Features:
 *  - Base URL auto-set from NEXT_PUBLIC_APP_URL
 *  - Request interceptor: attaches Content-Type and auth headers
 *  - Response interceptor: handles 401/403 centrally
 *  - Type-safe generic request helper
 *  - Never call this directly from UI components — use hooks/services instead
 */

import axios, { AxiosInstance, AxiosRequestConfig, AxiosError } from "axios";

// ─── Axios Instance ───────────────────────────────────────────────────────────

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5001/api";

export const axiosClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 15_000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  withCredentials: true, // Required for HttpOnly session cookies (NextAuth)
});

// ─── Request Interceptor ─────────────────────────────────────────────────────
// Runs before every request. Attaches any dynamic headers.

axiosClient.interceptors.request.use(
  async (config) => {
    // In browser, retrieve session and inject JWT token
    if (typeof window !== "undefined") {
      try {
        const { getSession } = await import("next-auth/react");
        const session = await getSession();
        const token = (session as any)?.user?.accessToken;
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      } catch (e) {
        console.warn("[Axios Interceptor] Failed to fetch session token", e);
      }
    }
    
    if (process.env.NODE_ENV === "development") {
      console.debug(
        `[Axios] ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`
      );
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// ─── Response Interceptor ────────────────────────────────────────────────────
// Centralizes HTTP error handling across all API calls.

axiosClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const status = error.response?.status;

    if (status === 401) {
      // Session expired or unauthorized — redirect to login
      // We use window.location to ensure full page reload (clears React state)
      if (typeof window !== "undefined") {
        console.warn("[Axios] 401 Unauthorized — redirecting to /login");
        window.location.href = "/login?reason=session_expired";
      }
    }

    if (status === 403) {
      // Authenticated but lacking permission — log for debugging
      console.warn(
        "[Axios] 403 Forbidden — insufficient permissions for:",
        error.config?.url
      );
    }

    if (status === 500) {
      console.error("[Axios] 500 Server Error:", error.config?.url, error.message);
    }

    return Promise.reject(error);
  }
);

// ─── Type-Safe Request Helpers ───────────────────────────────────────────────

export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface ApiError {
  message: string;
  code?: string;
  statusCode?: number;
}

/**
 * Type-safe GET request.
 * @example const users = await apiGet<User[]>('/users');
 */
export async function apiGet<T>(
  url: string,
  config?: AxiosRequestConfig
): Promise<T> {
  const separator = url.includes("?") ? "&" : "?";
  const finalUrl = `${url}${separator}_t=${Date.now()}`;
  const response = await axiosClient.get<ApiResponse<T>>(finalUrl, config);
  return response.data.data;
}

/**
 * Type-safe POST request.
 * @example const user = await apiPost<User>('/users', { name: 'Jane' });
 */
export async function apiPost<T>(
  url: string,
  data?: unknown,
  config?: AxiosRequestConfig
): Promise<T> {
  const response = await axiosClient.post<ApiResponse<T>>(url, data, config);
  return response.data.data;
}

/**
 * Type-safe PATCH request.
 */
export async function apiPatch<T>(
  url: string,
  data?: unknown,
  config?: AxiosRequestConfig
): Promise<T> {
  const response = await axiosClient.patch<ApiResponse<T>>(url, data, config);
  return response.data.data;
}

/**
 * Type-safe PUT request.
 */
export async function apiPut<T>(
  url: string,
  data?: unknown,
  config?: AxiosRequestConfig
): Promise<T> {
  const response = await axiosClient.put<ApiResponse<T>>(url, data, config);
  return response.data.data;
}

/**
 * Type-safe DELETE request.
 */
export async function apiDelete<T>(
  url: string,
  config?: AxiosRequestConfig
): Promise<T> {
  const response = await axiosClient.delete<ApiResponse<T>>(url, config);
  return response.data.data;
}

/**
 * Extract a human-readable error message from an Axios error.
 * Falls back to a generic message for unexpected errors.
 */
export function extractAxiosError(error: unknown): string {
  if (axios.isAxiosError(error)) {
    // Backend returned a structured error response
    const data = error.response?.data as { message?: string; error?: string } | undefined;
    return (
      data?.message ??
      data?.error ??
      error.message ??
      "An unexpected network error occurred."
    );
  }
  if (error instanceof Error) return error.message;
  return "An unexpected error occurred.";
}

export default axiosClient;
