/**
 * backend/src/config/jwt.ts
 * JWT Configuration.
 */

export const jwtConfig = {
  secret: process.env.AUTH_SECRET || process.env.JWT_SECRET || "cY7JsCije9NceA+ADwHUZWBqUnzCTwnS/B2IutAFBzw=",
  accessExpiresIn: "8h",
  refreshExpiresIn: "30d",
};
