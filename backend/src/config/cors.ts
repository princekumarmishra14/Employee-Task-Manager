/**
 * backend/src/config/cors.ts
 * CORS configuration settings.
 */

export const corsConfig = {
  origin: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  credentials: true,
};
