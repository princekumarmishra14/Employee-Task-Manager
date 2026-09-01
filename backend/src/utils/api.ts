/**
 * src/utils/api.ts
 * Secure client-side API fetch utility.
 *
 * Security:
 *  - Auth tokens are managed via HttpOnly cookies (set by Auth.js server-side)
 *  - NO localStorage token storage — eliminated XSS attack vector
 *  - Credentials: "include" ensures cookies are sent automatically
 *  - All requests target same-origin /api/* routes only
 */

export interface ApiResult<T> {
  success: boolean;
  data?: T;
  error?: string;
  meta?: {
    total?: number;
    page?: number;
    pageSize?: number;
    hasNextPage?: boolean;
  };
}

/**
 * Authenticated fetch helper for client components.
 * Auth is handled automatically via HttpOnly session cookies.
 */
export async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResult<T>> {
  try {
    const url = endpoint.startsWith("/api/")
      ? endpoint
      : `/api${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;

    const res = await fetch(url, {
      ...options,
      credentials: "include", // Always send cookies
      headers: {
        "Content-Type": "application/json",
        ...(options.headers as Record<string, string>),
      },
    });

    // Handle session expiry — redirect to login
    if (res.status === 401) {
      if (typeof window !== "undefined" && window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
      return { success: false, error: "Session expired. Please log in again." };
    }

    const json = await res.json();

    if (!res.ok) {
      return { success: false, error: json.error ?? "Something went wrong." };
    }

    return { success: true, data: json.data as T, meta: json.meta };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Network connection failure.";
    return { success: false, error: message };
  }
}

/**
 * Convenience wrappers for common HTTP methods.
 */
export const api = {
  get: <T>(url: string) => apiFetch<T>(url),
  post: <T>(url: string, body: unknown) =>
    apiFetch<T>(url, { method: "POST", body: JSON.stringify(body) }),
  patch: <T>(url: string, body: unknown) =>
    apiFetch<T>(url, { method: "PATCH", body: JSON.stringify(body) }),
  delete: <T>(url: string) => apiFetch<T>(url, { method: "DELETE" }),
};
