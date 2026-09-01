/**
 * backend/src/middlewares/googleVerify.ts
 * Express middleware to verify incoming Google OAuth ID tokens.
 */

import { Request, Response, NextFunction } from "express";
import { GoogleVerifyService, GoogleUserPayload } from "../services/google.service";

export interface RequestWithGooglePayload extends Request {
  googlePayload?: GoogleUserPayload;
}

export async function googleVerifyMiddleware(
  req: RequestWithGooglePayload,
  res: Response,
  next: NextFunction
) {
  const { idToken } = req.body;

  if (!idToken) {
    return res.status(400).json({
      success: false,
      message: "Google ID Token is required in request body.",
    });
  }

  try {
    const payload = await GoogleVerifyService.verifyIdToken(idToken);
    req.googlePayload = payload;
    next();
  } catch (err: any) {
    return res.status(401).json({
      success: false,
      message: err.message || "Invalid Google ID token.",
    });
  }
}
