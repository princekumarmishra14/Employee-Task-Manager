import crypto from "crypto";

/**
 * Generate a cryptographically secure 256-bit random reset token (represented as a 64-character hex string).
 */
export function generateResetToken(): string {
  return crypto.randomBytes(32).toString("hex");
}
