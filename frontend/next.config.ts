import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV !== "production";

const nextConfig: NextConfig = {
  // Disable Strict Mode to prevent third-party lifecycle warnings (e.g. Swagger UI React 19 warnings)
  reactStrictMode: false,

  // Enable use cache directive for Next.js 16
  cacheComponents: true,

  // Disable Next.js dev indicators (the floating N icon)
  devIndicators: false,

  // Security Headers
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          // Prevent MIME sniffing
          { key: "X-Content-Type-Options", value: "nosniff" },
          // Prevent clickjacking — also covered by CSP frame-ancestors
          { key: "X-Frame-Options", value: "DENY" },
          // Strict referrer policy
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          // Disable unnecessary browser features
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), payment=(), usb=()",
          },
          // HSTS — force HTTPS in production only
          ...(!isDev
            ? [{ key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" }]
            : []),
          // Content Security Policy
          // 'unsafe-eval' is required by React dev tools for callstack reconstruction.
          // It is ONLY added in development — production uses a strict policy.
          // TODO(security): Replace 'unsafe-inline' for styles once Tailwind supports nonce injection.
          // Content Security Policy
          // 'unsafe-eval' is required by React dev tools for callstack reconstruction.
          // It is ONLY added in development — production uses a strict policy.
          // TODO(security): Replace 'unsafe-inline' for styles once Tailwind supports nonce injection.
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              isDev
                ? "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://accounts.google.com/gsi/client"  // React dev mode needs eval()
                : "script-src 'self' 'unsafe-inline' https://accounts.google.com/gsi/client",               // Production: no eval
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://accounts.google.com",
              "font-src 'self' https://fonts.gstatic.com",
              "img-src 'self' data: blob: https://ui-avatars.com https://avatars.githubusercontent.com https://images.unsplash.com https://randomuser.me https://lh3.googleusercontent.com",
              // ws/wss for Next.js HMR in dev; localhost for Express API; Google authentication connection
              `connect-src 'self' http://localhost:5001 http://localhost:3000 ws://localhost:3000 https://accounts.google.com ${isDev ? "ws://localhost:* wss://localhost:*" : ""}`.trim(),
              "frame-src 'self' https://accounts.google.com",
              "frame-ancestors 'none'",
              "object-src 'none'",
              "base-uri 'self'",
            ].join("; "),
          },
        ],
      },
    ];
  },

  // Authorize local host dev connections to prevent Webpack HMR blockage
  allowedDevOrigins: ["localhost", "localhost:3000"],

  // Silence known non-breaking warnings
  experimental: {},
};

export default nextConfig;
