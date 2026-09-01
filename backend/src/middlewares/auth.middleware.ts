/**
 * =============================================================================
 * JWT AUTHENTICATION GATE MIDDLEWARE
 * Project: Employee Task Manager (Enterprise Edition)
 * Role: Authentication Filter Middleware
 * 
 * Description:
 * Intercepts incoming HTTP requests, decodes Bearer JWT tokens in the
 * Authorization header, validates signatures against a cryptographically secure
 * JWT_SECRET, and populates user session details inside the Express Request namespace.
 * Aborts pipeline with 401 Unauthorized responses if verification fails.
 * =============================================================================
 */

import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

// JWT Secret Key Resolution (supports unified Auth.js / NextAuth environment variable configurations)
const JWT_SECRET = process.env.AUTH_SECRET || process.env.JWT_SECRET || "cY7JsCije9NceA+ADwHUZWBqUnzCTwnS/B2IutAFBzw=";

/**
 * Enterprise Request Interface Extension.
 * Enriches standard Express Request payload with the authenticated user context object.
 */
export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;          // Database UUID of the authenticated user
    email: string;       // User login credential email
    role: string;        // RBAC role string (e.g. SUPER_ADMIN, MANAGER, etc.)
    employeeId: string | null; // Profile association index
    title: string | null;      // Organizational title
  };
}

/**
 * Express middleware to verify token signature and authenticity.
 * Flow:
 * 1. Extract 'Authorization' Header.
 * 2. Validate prefix matches 'Bearer <token>'.
 * 3. Verify JWT signature against cryptosecret.
 * 4. Bind decoded properties to Request container.
 * 5. Call `next()` to advance to route handler.
 */
export function verifyJwt(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  // Verify Bearer header integrity
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      message: "Access token is missing or invalid. Authentication required.",
    });
  }

  // Parse JWT token from authorization header string
  const token = authHeader.split(" ")[1];

  try {
    // Decode and verify JWT token signature
    const decoded = jwt.verify(token!, JWT_SECRET) as any;
    
    // Inject parsed session payload into request context
    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
      employeeId: decoded.employeeId,
      title: decoded.title,
    };
    next();
  } catch (err) {
    // Return standard unauthorized error response on expired or corrupted tokens
    return res.status(401).json({
      success: false,
      message: "Session expired or access token is invalid.",
    });
  }
}
