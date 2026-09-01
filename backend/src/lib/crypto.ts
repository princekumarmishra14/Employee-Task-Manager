import crypto from "crypto";

/**
 * Hash a plain token using SHA256.
 * Store only the hashed token in the database to prevent plain-text token leakage.
 */
export function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}
