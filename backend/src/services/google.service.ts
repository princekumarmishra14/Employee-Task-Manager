/**
 * backend/src/services/google.service.ts
 * Service for verifying Google OAuth ID Tokens.
 */

import { OAuth2Client } from "google-auth-library";

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;

const client = new OAuth2Client(GOOGLE_CLIENT_ID);

export interface GoogleUserPayload {
  email: string;
  emailVerified: boolean;
  firstName: string;
  lastName: string;
  picture?: string;
  googleId: string;
}

export class GoogleVerifyService {
  /**
   * Cryptographically verifies the Google ID token and returns the parsed user profile.
   * Throws on invalid or unverified tokens.
   */
  static async verifyIdToken(idToken: string): Promise<GoogleUserPayload> {
    if (!GOOGLE_CLIENT_ID) {
      throw new Error("GOOGLE_CLIENT_ID is not configured in the backend environment.");
    }

    try {
      const ticket = await client.verifyIdToken({
        idToken,
        audience: GOOGLE_CLIENT_ID,
      });

      const payload = ticket.getPayload();
      if (!payload) {
        throw new Error("Token payload could not be decoded.");
      }

      const {
        email,
        email_verified: emailVerified,
        given_name: firstName,
        family_name: lastName,
        picture,
        sub: googleId,
      } = payload;

      if (!email) {
        throw new Error("Email address was not found in the token payload.");
      }

      if (!emailVerified) {
        throw new Error("The email address linked to this Google token is not verified.");
      }

      return {
        email: email.toLowerCase().trim(),
        emailVerified: !!emailVerified,
        firstName: firstName || "",
        lastName: lastName || "",
        picture: picture || undefined,
        googleId,
      };
    } catch (err: any) {
      console.error("[GoogleVerifyService] Cryptographic verification failure:", err);
      throw new Error(err.message || "Invalid or expired Google ID token.");
    }
  }
}
