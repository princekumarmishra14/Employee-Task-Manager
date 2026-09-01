/**
 * backend/src/modules/auth/google.controller.ts
 * Controller to handle Google OAuth verification, user creation,
 * login histories, audit logging, and custom ETM JWT generation.
 */

import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import prisma from "../../lib/prisma";
import { writeAuditLog } from "../../lib/audit";
import { GoogleAuthService } from "./google.service";

const JWT_SECRET = process.env.AUTH_SECRET || process.env.JWT_SECRET || "cY7JsCije9NceA+ADwHUZWBqUnzCTwnS/B2IutAFBzw=";

/**
 * Handles incoming client POST requests carrying the Google ID Token.
 */
export async function googleLogin(req: Request, res: Response, next: NextFunction) {
  try {
    const { idToken } = req.body;

    if (!idToken) {
      return res.status(400).json({ success: false, message: "Google ID Token is required." });
    }

    // 1. Verify token with Google service
    const payload = await GoogleAuthService.verifyIdToken(idToken);
    const ipAddress = req.ip || req.headers["x-forwarded-for"]?.toString() || undefined;
    const userAgent = req.headers["user-agent"] || undefined;

    // 2. Query PostgreSQL for user
    let user = await prisma.user.findUnique({
      where: { email: payload.email },
      include: {
        employee: true,
        role: {
          include: {
            rolePermissions: {
              include: {
                permission: true
              }
            }
          }
        }
      }
    });

    // 3. Reject access if user does not exist in the database (No self-registration)
    if (!user) {
      return res.status(403).json({
        success: false,
        message: "Access Denied. Your Google account is not pre-registered on the platform. Please contact your administrator."
      });
    }

    if (!user.isActive) {
      return res.status(401).json({ success: false, message: "Account is inactive." });
    }

    // 4. Update metadata and link Google details on successful match
    user = await prisma.user.update({
      where: { id: user.id },
      data: {
        failedLoginAttempts: 0,
        lockedUntil: null,
        lastLoginAt: new Date(),
        loginMethod: "google",
        ...(user.googleId === null && { googleId: payload.googleId }),
        ...(user.provider === "credentials" && { provider: "google" }),
      },
      include: {
        employee: true,
        role: {
          include: {
            rolePermissions: {
              include: {
                permission: true
              }
            }
          }
        }
      }
    });

    // 5. Generate Access & Refresh tokens
    const accessToken = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role?.name || "EMPLOYEE",
        employeeId: user.employee?.id || null,
        title: user.employee?.title || null,
      },
      JWT_SECRET,
      { expiresIn: "8h" }
    );

    const refreshToken = jwt.sign(
      { id: user.id },
      JWT_SECRET,
      { expiresIn: "30d" }
    );

    // 6. Write to LoginHistory
    await prisma.loginHistory.create({
      data: {
        userId: user.id,
        ipAddress,
        userAgent,
        status: "SUCCESS"
      }
    });

    const displayName = user.employee?.fullName || user.email.split("@")[0];

    // Log successful login
    await writeAuditLog({
      action: "LOGIN",
      entity: "USER",
      entityId: user.id,
      entityName: user.email,
      details: `User '${user.email}' logged in successfully via Google Sign-In.`,
    }, {
      performedBy: displayName,
      performedById: user.id,
      ipAddress,
      userAgent,
    });

    return res.status(200).json({
      success: true,
      message: "Login successful via Google.",
      data: {
        accessToken,
        refreshToken,
        user: {
          id: user.id,
          email: user.email,
          role: user.role?.name || "EMPLOYEE",
          permissions: user.role?.rolePermissions.map(rp => `${rp.permission.module}:${rp.permission.action}`) || [],
          name: displayName,
          image: user.employee?.avatarUrl || null,
          title: user.employee?.title || null,
          employeeId: user.employee?.id || null,
          employeeCode: user.employee?.employeeCode || null,
          departmentId: user.departmentId || null,
          teamId: user.teamId || null,
        },
      },
    });
  } catch (err) {
    next(err);
  }
}
