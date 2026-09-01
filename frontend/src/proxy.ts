/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * middleware.ts (project root)
 * Next.js Edge Middleware — route protection & session validation.
 *
 * All routes under the app except /login, /api/auth/*, and static assets
 * require an active authenticated session.
 *
 * Security:
 *  - Runs on the Edge before any page/API handler
 *  - Redirects unauthenticated users to /login
 *  - Preserves the originally requested URL as `callbackUrl` query param
 */

import { auth } from "@/auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Public routes that do not require authentication
const PUBLIC_PATHS = [
  "/login",
  "/signup",
  "/forgot-password",
  "/reset-password",
  "/verify-email",
  "/api/auth",
  "/docs",
  "/openapi.json",
];

function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.some(
    (p) => pathname === p || pathname.startsWith(p + "/")
  );
}

export const proxy = auth((req: NextRequest & { auth: any }) => {
  const { pathname } = req.nextUrl;

  // Allow static assets, images, favicon
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // Allow public paths
  if (isPublicPath(pathname)) {
    // If already authenticated and trying to access /login or /signup, redirect to dashboard
    if (req.auth && (pathname === "/login" || pathname === "/signup")) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
    return NextResponse.next();
  }

  // Redirect unauthenticated users to /login
  if (!req.auth) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Redirect root path to dashboard
  if (pathname === "/") {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
});

export default proxy;

export const config = {
  matcher: [
    /*
     * Match all request paths EXCEPT:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
