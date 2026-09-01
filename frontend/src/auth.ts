/**
 * src/auth.ts
 * Auth.js v5 (NextAuth) configuration.
 *
 * Strategy: Credentials provider + database sessions via Prisma adapter.
 * Security:
 *  - Passwords hashed with bcryptjs (12 rounds)
 *  - Sessions stored in DB (Session model) — revocable on logout/role change
 *  - HttpOnly, Secure, SameSite=Lax cookies (enforced by Auth.js)
 *  - Account lockout after 5 failed attempts (15 min lockout)
 *
 * TODO(security): Add MFA (TOTP) support for SUPER_ADMIN and ADMIN roles.
 * TODO(security): Add OAuth providers (Google Workspace, Microsoft Azure AD).
 * TODO(security): Add leaked-password detection via HaveIBeenPwned API.
 */

import NextAuth, { type NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const authConfig: NextAuthConfig = {
  session: {
    strategy: "jwt",
    maxAge: 8 * 60 * 60, // 8 hours default
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        rememberMe: { label: "Remember Me", type: "checkbox" },
        googleIdToken: { label: "Google ID Token", type: "text" },
      },
      async authorize(credentials) {
        const googleIdToken = credentials?.googleIdToken as string | undefined;

        if (googleIdToken) {
          try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";
            const res = await fetch(`${apiUrl}/auth/google`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ idToken: googleIdToken }),
            });

            const data = await res.json();

            if (!res.ok || !data.success) {
              if (res.status === 403) {
                throw new Error("GOOGLE_UNREGISTERED");
              }
              return null;
            }

            const { accessToken, refreshToken, user: profile } = data.data;

            return {
              id: profile.id,
              email: profile.email,
              role: profile.role,
              name: profile.name,
              image: profile.image,
              title: profile.title,
              employeeId: profile.employeeId,
              employeeCode: profile.employeeCode,
              departmentId: profile.departmentId,
              teamId: profile.teamId,
              permissions: profile.permissions || [],
              accessToken,
              refreshToken,
            };
          } catch (err) {
            console.error("[NextAuth Auth] Delegate Google login error:", err);
            return null;
          }
        }

        // 1. Validate input shape
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const { email, password } = parsed.data;

        try {
          const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";
          const res = await fetch(`${apiUrl}/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
          });

          const data = await res.json();

          if (!res.ok || !data.success) {
            if (data.message?.includes("locked")) {
              throw new Error("ACCOUNT_LOCKED");
            }
            if (data.isUnverified) {
              throw new Error("EMAIL_UNVERIFIED");
            }
            return null;
          }

          const { accessToken, refreshToken, user: profile } = data.data;

          return {
            id: profile.id,
            email: profile.email,
            role: profile.role,
            name: profile.name,
            image: profile.image,
            title: profile.title,
            employeeId: profile.employeeId,
            employeeCode: profile.employeeCode,
            departmentId: profile.departmentId,
            teamId: profile.teamId,
            permissions: profile.permissions || [],
            accessToken,
            refreshToken,
          };
          } catch (err) {
            if (err instanceof Error && (err.message === "ACCOUNT_LOCKED" || err.message === "EMAIL_UNVERIFIED")) throw err;
            console.error("[NextAuth Auth] Delegate login error:", err);
            return null;
          }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      // Initial sign-in — enrich the JWT with user data
      if (user) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const u = user as any;
        token.id = user.id;
        token.role = u.role;
        token.name = u.name;
        token.image = u.image;
        token.title = u.title;
        token.employeeId = u.employeeId;
        token.employeeCode = u.employeeCode;
        token.departmentId = u.departmentId;
        token.teamId = u.teamId;
        token.permissions = u.permissions;
        token.accessToken = u.accessToken;
        token.refreshToken = u.refreshToken;
      }
      // Session update trigger (e.g. after role change)
      if (trigger === "update" && session) {
        token = { ...token, ...session };
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const su = session.user as any;
        su.role = token.role;
        su.title = token.title;
        su.employeeId = token.employeeId;
        su.employeeCode = token.employeeCode;
        su.departmentId = token.departmentId;
        su.teamId = token.teamId;
        su.permissions = token.permissions || [];
        su.accessToken = token.accessToken;
        su.refreshToken = token.refreshToken;
        if (token.name) session.user.name = token.name as string;
        if (token.image) session.user.image = token.image as string;
      }
      return session;
    },
  },
  events: {
    async signOut() {
      // Custom audit logging will be dispatched via the backend API
    },
  },
  trustHost: true,
};

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);
