/**
 * src/lib/prisma.ts
 *
 * Singleton Prisma Client for Next.js.
 * Prevents multiple PrismaClient instances in development due to hot-reloading.
 */

import { PrismaClient } from "@prisma/client";

declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
}

const prisma = global.__prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
});

if (process.env.NODE_ENV !== "production") {
  global.__prisma = prisma;
}

export default prisma;
