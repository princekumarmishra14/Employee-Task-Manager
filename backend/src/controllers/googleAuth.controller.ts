/**
 * backend/src/controllers/googleAuth.controller.ts
 * Controller to handle Google OAuth user login, automated registration,
 * connection, and disconnection actions.
 */

import { Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import prisma from "../lib/prisma";
import { writeAuditLog } from "../lib/audit";
import { RequestWithGooglePayload } from "../middlewares/googleVerify";
import { EmailService } from "../services/email/email.service";

const JWT_SECRET = process.env.AUTH_SECRET || process.env.JWT_SECRET || "cY7JsCije9NceA+ADwHUZWBqUnzCTwnS/B2IutAFBzw=";

/**
 * Helper to generate a unique employee code matching the format: EMP-YYYY-RANDOM
 */
async function generateEmployeeCode(): Promise<string> {
  const year = new Date().getFullYear();
  for (let attempt = 0; attempt < 5; attempt++) {
    const suffix = Math.floor(1000 + Math.random() * 9000);
    const code = `EMP-${year}-${suffix}`;
    const exists = await prisma.employee.findUnique({
      where: { employeeCode: code },
      select: { id: true },
    });
    if (!exists) return code;
  }
  return `EMP-${year}-${Date.now().toString().slice(-6)}`;
}

/**
 * Handles backend Google Sign-In login & signup.
 */
export async function googleLogin(req: RequestWithGooglePayload, res: Response, next: NextFunction) {
  try {
    const payload = req.googlePayload!;
    const ipAddress = req.ip || req.headers["x-forwarded-for"]?.toString() || "127.0.0.1";
    const userAgent = req.headers["user-agent"] || "unknown";

    // 1. Resolve User by email
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

    if (user && !user.isActive) {
      return res.status(401).json({ success: false, message: "Account is inactive." });
    }

    let isNewUser = false;

    if (user) {
      // 2. User exists. Map googleId if not yet linked
      if (!user.googleId) {
        user = await prisma.user.update({
          where: { id: user.id },
          data: {
            googleId: payload.googleId,
            provider: "google",
            loginMethod: "google",
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
      }
    } else {
      // 3. Automated transactional sign-up
      isNewUser = true;
      const employeeCode = await generateEmployeeCode();
      
      // Generate unguessable bcrypt password for the DB column
      const randomPassword = await bcrypt.hash(Math.random().toString(36) + Math.random().toString(36), 12);

      await prisma.$transaction(async (tx) => {
        // Find or create general department
        let dbDept = await tx.department.findFirst({
          where: { name: "General", isActive: true },
        });

        if (!dbDept) {
          dbDept = await tx.department.create({
            data: {
              name: "General",
              isActive: true,
              createdBy: "google_oauth",
            },
          });
        }

        const employeeRole = await tx.role.findUnique({ where: { name: "EMPLOYEE" } });

        const newUser = await tx.user.create({
          data: {
            email: payload.email,
            passwordHash: randomPassword,
            roleId: employeeRole?.id ?? null,
            isActive: true,
            failedLoginAttempts: 0,
            departmentId: dbDept.id,
            isEmailVerified: true,
            googleId: payload.googleId,
            provider: "google",
            loginMethod: "google",
            createdByGoogle: true,
          },
        });

        await tx.employee.create({
          data: {
            userId: newUser.id,
            employeeCode,
            fullName: `${payload.firstName} ${payload.lastName}`,
            firstName: payload.firstName,
            lastName: payload.lastName,
            title: "Employee",
            avatarUrl: payload.picture || null,
            isActive: true,
            hireDate: new Date(),
          },
        });
      });

      user = await prisma.user.findUnique({
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

      if (!user) {
        throw new Error("Unable to retrieve user record after transactional signup.");
      }

      await writeAuditLog({
        action: "CREATE",
        entity: "USER",
        entityId: user.id,
        entityName: user.email,
        details: `User registered successfully via Google Sign-In.`,
      }, {
        performedBy: user.employee?.fullName || user.email,
        performedById: user.id,
        ipAddress,
        userAgent,
      });

      const displayName = user.employee?.fullName || user.email;
      // Send Welcome, Account Created, and Security (New Login Alert) Emails
      EmailService.sendWelcomeEmail(user.email, displayName).catch(console.error);
      EmailService.sendAccountCreatedEmail(user.email, displayName, user.email).catch(console.error);
    }

    // 4. Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: {
        failedLoginAttempts: 0,
        lockedUntil: null,
        lastLoginAt: new Date(),
        loginMethod: "google",
        lastLoginIP: ipAddress,
        lastLoginDevice: userAgent,
      },
    });

    // 5. JWT Generation
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

    await prisma.loginHistory.create({
      data: {
        userId: user.id,
        ipAddress,
        userAgent,
        status: "SUCCESS",
      }
    });

    const displayName = user.employee?.fullName || user.email;

    await writeAuditLog({
      action: "LOGIN",
      entity: "USER",
      entityId: user.id,
      entityName: user.email,
      details: `User logged in via Google Sign-In.`,
    }, {
      performedBy: displayName,
      performedById: user.id,
      ipAddress,
      userAgent,
    });

    // Send Security Login Alert email
    EmailService.sendNewLoginAlertEmail({
      to: user.email,
      name: displayName,
      ip: ipAddress,
      device: userAgent,
      method: "Google OAuth",
    }).catch(console.error);

    return res.status(200).json({
      success: true,
      message: "Authentication successful.",
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
          googleId: user.googleId,
        },
      },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Links a Google account to an already logged-in session.
 */
export async function connectGoogle(req: RequestWithGooglePayload, res: Response, next: NextFunction) {
  try {
    const payload = req.googlePayload!;
    const userId = (req as any).user.id;
    const ipAddress = req.ip || req.headers["x-forwarded-for"]?.toString() || "127.0.0.1";

    // Check if this Google account is already linked to another user profile
    const existing = await prisma.user.findUnique({
      where: { googleId: payload.googleId }
    });

    if (existing && existing.id !== userId) {
      return res.status(400).json({
        success: false,
        message: "This Google account is already linked to another employee.",
      });
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        googleId: payload.googleId,
        provider: "google",
      },
      include: { employee: true }
    });

    // Send Connection success email
    EmailService.sendGoogleAccountLinkedEmail(
      updatedUser.email, 
      updatedUser.employee?.fullName || updatedUser.email, 
      ipAddress
    ).catch(console.error);

    return res.status(200).json({
      success: true,
      message: "Google account successfully linked.",
      data: { googleId: payload.googleId }
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Unlinks the Google account integration.
 */
export async function disconnectGoogle(req: any, res: Response, next: NextFunction) {
  try {
    const userId = req.user.id;
    const ipAddress = req.ip || req.headers["x-forwarded-for"]?.toString() || "127.0.0.1";

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { employee: true }
    });

    if (!user) {
      return res.status(404).json({ success: false, message: "User profile not found." });
    }

    // Security check: Must have password credentials so they aren't locked out of the app
    if (!user.passwordHash) {
      return res.status(400).json({
        success: false,
        message: "You must set an account password before disconnecting Google authentication.",
      });
    }

    await prisma.user.update({
      where: { id: userId },
      data: {
        googleId: null,
      }
    });

    // Send Unlink notification email
    EmailService.sendGoogleAccountUnlinkedEmail(
      user.email,
      user.employee?.fullName || user.email,
      ipAddress
    ).catch(console.error);

    return res.status(200).json({
      success: true,
      message: "Google account integration removed successfully.",
    });
  } catch (err) {
    next(err);
  }
}
