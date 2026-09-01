/**
 * src/app/api/auth/[...nextauth]/route.ts
 * Auth.js (NextAuth v5) catch-all route handler.
 */

// Force Turbopack compilation trigger
import { handlers } from "@/auth";

export const { GET, POST } = handlers;
