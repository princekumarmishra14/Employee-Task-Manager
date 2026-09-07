/**
 * frontend/src/config/api.ts
 * Centralized API URL configuration.
 *
 * Ensures all client and server requests in production target the live Render backend,
 * while seamlessly supporting local development on http://localhost:5001/api.
 */

export const PRODUCTION_API_URL = "https://employee-task-manager-api.onrender.com/api";
export const PRODUCTION_ORIGIN = "https://employee-task-manager-api.onrender.com";

export function resolveApiBaseUrl(): string {
  const envUrl = process.env.NEXT_PUBLIC_API_URL;
  const isBrowser = typeof window !== "undefined";
  const isRemoteHost =
    isBrowser &&
    !window.location.hostname.includes("localhost") &&
    !window.location.hostname.includes("127.0.0.1");
  const isProdEnv = process.env.NODE_ENV === "production";

  // In the browser on a remote deployment (e.g. Netlify), never allow localhost
  if (isRemoteHost) {
    if (!envUrl || envUrl.includes("localhost") || envUrl.includes("127.0.0.1")) {
      return PRODUCTION_API_URL;
    }
    return envUrl;
  }

  // If env var is explicitly provided and not an invalid localhost in production
  if (envUrl && (!isProdEnv || !envUrl.includes("localhost"))) {
    return envUrl;
  }

  // In production builds / SSR, default to Render API URL
  return isProdEnv ? PRODUCTION_API_URL : "http://localhost:5001/api";
}

export const API_BASE_URL = resolveApiBaseUrl();
