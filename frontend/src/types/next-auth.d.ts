/**
 * src/types/next-auth.d.ts
 * Extends NextAuth session types to include enterprise-specific user fields.
 */

import { UserRole } from "@/constants/roles";
import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: DefaultSession["user"] & {
      id: string;
      role: UserRole;
      employeeId: string | null;
      employeeCode: string | null;
      title: string | null;
      departmentId: string | null;
      teamId: string | null;
    };
  }

  interface User {
    role: UserRole;
    employeeId: string | null;
    employeeCode: string | null;
    title: string | null;
    departmentId: string | null;
    teamId: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: UserRole;
    employeeId: string | null;
    employeeCode: string | null;
    title: string | null;
    departmentId: string | null;
    teamId: string | null;
  }
}
