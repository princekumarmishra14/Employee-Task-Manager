/**
 * backend/src/modules/auth/auth.controller.ts
 * Authentication controller handling login, signup, logout, token refresh, lockouts,
 * email verification, OTP password reset flows, and audit logs.
 */

import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { z } from "zod";
import crypto from "crypto";
import prisma from "../../lib/prisma";
import { writeAuditLog } from "../../lib/audit";
import { EmailService } from "../../services/email/email.service";

const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 mins
const JWT_SECRET = process.env.AUTH_SECRET || process.env.JWT_SECRET || "cY7JsCije9NceA+ADwHUZWBqUnzCTwnS/B2IutAFBzw=";

const signupSchema = z.object({
  firstName: z.string().min(2).max(100).trim(),
  lastName: z.string().min(2).max(100).trim(),
  email: z.string().email().toLowerCase().trim(),
  mobile: z.string().optional().or(z.literal("")),
  employeeId: z.string().max(50).optional().or(z.literal("")),
  department: z.string().min(1).trim(),
  designation: z.string().min(2).max(150).trim(),
  password: z.string().min(8).max(32),
});

const forgotPasswordSchema = z.object({
  email: z.string().email().toLowerCase().trim(),
});

const verifyOtpSchema = z.object({
  email: z.string().email().toLowerCase().trim(),
  otp: z.string().length(6, "OTP must be 6 digits."),
});

const resetPasswordSchema = z.object({
  email: z.string().email().toLowerCase().trim(),
  otp: z.string().length(6),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters.")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter.")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter.")
    .regex(/[0-9]/, "Password must contain at least one number.")
    .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character."),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match.",
  path: ["confirmPassword"],
});

function generateNumericOTP(): string {
  const bytes = crypto.randomBytes(3);
  const num = parseInt(bytes.toString("hex"), 16);
  const otp = (num % 900000) + 100000; // Ensures 100000 - 999999 range
  return otp.toString();
}

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

export async function signup(req: Request, res: Response, next: NextFunction) {
  try {
    const parsed = signupSchema.safeParse(req.body);
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      parsed.error.issues.forEach((issue) => {
        const field = String(issue.path[0] ?? "general");
        fieldErrors[field] = issue.message;
      });
      return res.status(400).json({
        success: false,
        message: parsed.error.issues[0]?.message || "Validation failed.",
        errors: fieldErrors,
      });
    }

    const {
      firstName,
      lastName,
      email,
      mobile,
      department,
      designation,
      password,
    } = parsed.data;

    // Check email uniqueness
    const existingUser = await prisma.user.findUnique({
      where: { email },
      select: { id: true, isActive: true, deletedAt: true },
    });
    
    const isReactivating = existingUser && (existingUser.deletedAt !== null || !existingUser.isActive);

    if (existingUser && !isReactivating) {
      return res.status(409).json({
        success: false,
        message: "An account with this email address already exists.",
        errors: { email: "Email is already registered." },
      });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const employeeCode = await generateEmployeeCode();

    const verificationToken = crypto.randomBytes(32).toString("hex");
    const verificationExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 Hours

    let newUserId: string;
    let newEmployeeId: string;

    const ipAddress = req.ip || req.headers["x-forwarded-for"]?.toString() || "127.0.0.1";
    const userAgent = req.headers["user-agent"] || "unknown";

    await prisma.$transaction(async (tx) => {
      // Find or create department matching selected name
      let dbDept = await tx.department.findFirst({
        where: { name: department, isActive: true },
      });

      if (!dbDept) {
        dbDept = await tx.department.create({
          data: {
            name: department,
            isActive: true,
            createdBy: "signup_portal",
          },
        });
      }

      // Lookup the default EMPLOYEE role from the DB
      const employeeRole = await tx.role.findUnique({ where: { name: "EMPLOYEE" } });
      
      let user;
      if (isReactivating) {
        user = await tx.user.update({
          where: { id: existingUser.id },
          data: {
            passwordHash,
            roleId: employeeRole?.id ?? null,
            isActive: true,
            deletedAt: null,
            failedLoginAttempts: 0,
            lockedUntil: null,
            departmentId: dbDept.id,
            isEmailVerified: false, // require verification again
            emailVerificationToken: verificationToken,
            emailVerificationExpiry: verificationExpiry,
          },
        });
      } else {
        user = await tx.user.create({
          data: {
            email,
            passwordHash,
            roleId: employeeRole?.id ?? null,
            isActive: true,
            departmentId: dbDept.id,
            isEmailVerified: false,
            emailVerificationToken: verificationToken,
            emailVerificationExpiry: verificationExpiry,
          },
        });
      }

      // Create or update the employee profile
      let employee;
      if (isReactivating) {
        employee = await tx.employee.update({
          where: { userId: user.id },
          data: {
            fullName: `${firstName} ${lastName}`,
            firstName,
            lastName,
            title: designation,
            phone: mobile || null,
            isActive: true,
            deletedAt: null,
          },
        });
      } else {
        employee = await tx.employee.create({
          data: {
            userId: user.id,
            employeeCode,
            fullName: `${firstName} ${lastName}`,
            firstName,
            lastName,
            title: designation,
            phone: mobile || null,
            hireDate: new Date(),
            isActive: true,
          },
        });
      }

      newUserId = user.id;
      newEmployeeId = employee.id;
    });

    const fullName = `${firstName} ${lastName}`;

    // Write audit log
    await writeAuditLog({
      action: "CREATE",
      entity: "USER",
      entityId: newUserId!,
      entityName: email,
      details: `User account '${email}' registered. Verification email queued.`,
    }, {
      performedBy: `${fullName} (Self-Registration)`,
      performedById: newUserId!,
      ipAddress,
      userAgent,
    });

    // Send Welcome, Account Created, and Verification Emails (all queued asynchronously)
    EmailService.sendWelcomeEmail(email, fullName).catch(console.error);
    EmailService.sendAccountCreatedEmail(email, fullName, email).catch(console.error);
    EmailService.sendVerificationEmail(email, fullName, verificationToken).catch(console.error);

    return res.status(201).json({
      success: true,
      message: "Registration successful. Check your email to verify your account.",
      data: {
        userId: newUserId!,
        employeeId: newEmployeeId!,
        employeeCode,
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email and password are required." });
    }

    const trimmedEmail = email.toLowerCase().trim();
    const ipAddress = req.ip || req.headers["x-forwarded-for"]?.toString() || "127.0.0.1";
    const userAgent = req.headers["user-agent"] || "unknown";

    // 1. Lookup user
    const user = await prisma.user.findUnique({
      where: { email: trimmedEmail },
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
      },
    });

    if (!user || !user.isActive) {
      return res.status(401).json({ success: false, message: "Invalid email or password." });
    }

    // 2. Check account lockout
    if (user.lockedUntil && user.lockedUntil > new Date()) {
      return res.status(423).json({
        success: false,
        message: "Your account is temporarily locked due to multiple failed login attempts. Try again in 15 minutes.",
      });
    }

    // 3. Compare passwords
    const isValid = await bcrypt.compare(password, user.passwordHash);

    if (!isValid) {
      const newAttempts = user.failedLoginAttempts + 1;
      const isLocked = newAttempts >= MAX_FAILED_ATTEMPTS;
      const lockedUntil = isLocked ? new Date(Date.now() + LOCKOUT_DURATION_MS) : null;

      await prisma.user.update({
        where: { id: user.id },
        data: {
          failedLoginAttempts: newAttempts,
          lockedUntil,
        },
      });

      await writeAuditLog({
        action: "LOGIN",
        entity: "USER",
        entityId: user.id,
        entityName: user.email,
        details: `Failed credentials login. Attempts: ${newAttempts}/${MAX_FAILED_ATTEMPTS}. Locked: ${lockedUntil ? "Yes" : "No"}.`,
      }, {
        performedBy: user.email,
        performedById: user.id,
        ipAddress,
        userAgent,
      });

      if (isLocked) {
        EmailService.sendAccountLockedEmail(
          user.email,
          user.employee?.fullName || user.email,
          lockedUntil!,
          ipAddress
        ).catch(console.error);
      }

      return res.status(401).json({ success: false, message: "Invalid email or password." });
    }

    // 4. Enforce Email Verification Check
    if (!user.isEmailVerified) {
      return res.status(403).json({
        success: false,
        isUnverified: true,
        message: "Please verify your email address before signing in.",
      });
    }

    // 5. Reset failed attempts & update login metadata
    await prisma.user.update({
      where: { id: user.id },
      data: {
        failedLoginAttempts: 0,
        lockedUntil: null,
        lastLoginAt: new Date(),
        lastLoginIP: ipAddress,
        lastLoginDevice: userAgent,
        loginMethod: "credentials",
      },
    });

    // 6. Generate Access & Refresh tokens
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

    // Save login history
    await prisma.loginHistory.create({
      data: {
        userId: user.id,
        ipAddress,
        userAgent,
        status: "SUCCESS"
      }
    });

    const displayName = user.employee?.fullName || user.email.split("@")[0];

    // Write successful login to audit log
    await writeAuditLog({
      action: "LOGIN",
      entity: "USER",
      entityId: user.id,
      entityName: user.email,
      details: `User '${user.email}' logged in successfully via credentials.`,
    }, {
      performedBy: displayName,
      performedById: user.id,
      ipAddress,
      userAgent,
    });

    // Send Login Security Alert Email
    EmailService.sendNewLoginAlertEmail({
      to: user.email,
      name: displayName,
      ip: ipAddress,
      device: userAgent,
      method: "Credentials (Email/Password)",
    }).catch(console.error);

    return res.status(200).json({
      success: true,
      message: "Login successful.",
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

export async function logout(req: any, res: Response, next: NextFunction) {
  try {
    const ipAddress = req.ip || req.headers["x-forwarded-for"]?.toString() || "127.0.0.1";
    const userAgent = req.headers["user-agent"] || "unknown";

    if (req.user) {
      await writeAuditLog({
        action: "LOGOUT",
        entity: "USER",
        entityId: req.user.id,
        entityName: req.user.email,
        details: `User '${req.user.email}' logged out successfully.`,
      }, {
        performedBy: req.user.email,
        performedById: req.user.id,
        ipAddress,
        userAgent,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Logged out successfully.",
    });
  } catch (err) {
    next(err);
  }
}

export async function refresh(req: Request, res: Response, next: NextFunction) {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ success: false, message: "Refresh token is required." });
    }

    let decoded: any;
    try {
      decoded = jwt.verify(refreshToken, JWT_SECRET);
    } catch (err) {
      return res.status(401).json({ success: false, message: "Invalid or expired refresh token." });
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      include: { employee: true },
    });

    if (!user || !user.isActive) {
      return res.status(401).json({ success: false, message: "User is suspended or deactivated." });
    }

    const accessToken = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: (user as any).role?.name || "EMPLOYEE",
        employeeId: (user as any).employee?.id || null,
        title: (user as any).employee?.title || null,
      },
      JWT_SECRET,
      { expiresIn: "8h" }
    );

    return res.status(200).json({
      success: true,
      data: { accessToken },
    });
  } catch (err) {
    next(err);
  }
}

// ─── Forgot Password / OTP Flow ──────────────────────────────────────────────

export async function forgotPassword(req: Request, res: Response, next: NextFunction) {
  try {
    const parsed = forgotPasswordSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: parsed.error.issues[0]?.message || "Invalid email address.",
      });
    }

    const { email } = parsed.data;
    const ipAddress = req.ip || req.headers["x-forwarded-for"]?.toString() || "127.0.0.1";
    const userAgent = req.headers["user-agent"] || "unknown";

    const user = await prisma.user.findUnique({
      where: { email },
      include: { employee: true },
    });

    const successResponse = {
      success: true,
      message: "If the account exists, a 6-digit verification OTP code has been sent.",
    };

    if (!user || !user.isActive) {
      return res.status(200).json(successResponse);
    }

    // Cooldown and rate limiting check (60s cooldown, max 3 resends)
    const now = new Date();
    if (user.otpResendCooldown && user.otpResendCooldown > now) {
      const remainingSeconds = Math.ceil((user.otpResendCooldown.getTime() - now.getTime()) / 1000);
      return res.status(429).json({
        success: false,
        message: `Please wait ${remainingSeconds} seconds before requesting a new OTP.`,
      });
    }

    if (user.otpResendAttempts >= 3) {
      // Check if cooldown allows resetting attempts after 1 hour
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
      if (user.otpResendCooldown && user.otpResendCooldown > oneHourAgo) {
        return res.status(429).json({
          success: false,
          message: "You have exceeded the maximum resends (3). Please try again in an hour.",
        });
      } else {
        // Reset attempts
        await prisma.user.update({
          where: { id: user.id },
          data: { otpResendAttempts: 0 },
        });
      }
    }

    const otp = generateNumericOTP();
    const otpHash = await bcrypt.hash(otp, 10);
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetPasswordOTPHash: otpHash,
        resetPasswordOTPExpiry: otpExpiry,
        otpVerifyAttempts: 0,
        otpResendAttempts: user.otpResendAttempts + 1,
        otpResendCooldown: new Date(Date.now() + 60 * 1000), // 60s cooldown
      },
    });

    const displayName = user.employee?.fullName || user.email;

    await writeAuditLog({
      action: "UPDATE",
      entity: "USER",
      entityId: user.id,
      entityName: user.email,
      details: "OTP Password Reset Requested.",
    }, {
      performedById: user.id,
      performedBy: displayName,
      ipAddress,
      userAgent,
    });

    // Send OTP via email
    EmailService.sendForgotPasswordOtp(user.email, displayName, otp).catch(console.error);

    return res.status(200).json(successResponse);
  } catch (err) {
    next(err);
  }
}

export async function verifyOtp(req: Request, res: Response, next: NextFunction) {
  try {
    const parsed = verifyOtpSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: parsed.error.issues[0]?.message || "Validation failed.",
      });
    }

    const { email, otp } = parsed.data;
    const ipAddress = req.ip || req.headers["x-forwarded-for"]?.toString() || "127.0.0.1";
    const userAgent = req.headers["user-agent"] || "unknown";

    const user = await prisma.user.findUnique({
      where: { email },
      include: { employee: true },
    });

    if (!user || !user.isActive) {
      return res.status(400).json({ success: false, message: "User not found or is inactive." });
    }

    if (!user.resetPasswordOTPHash || !user.resetPasswordOTPExpiry) {
      return res.status(400).json({ success: false, message: "No active OTP request found." });
    }

    if (user.resetPasswordOTPExpiry < new Date()) {
      return res.status(400).json({ success: false, message: "OTP has expired. Please request a new one." });
    }

    if (user.otpVerifyAttempts >= 5) {
      // Invalidate the OTP due to excessive failures
      await prisma.user.update({
        where: { id: user.id },
        data: {
          resetPasswordOTPHash: null,
          resetPasswordOTPExpiry: null,
          otpVerifyAttempts: 0,
        },
      });

      return res.status(400).json({
        success: false,
        message: "Too many failed attempts. This OTP has been invalidated. Please request a new one.",
      });
    }

    const isValid = await bcrypt.compare(otp, user.resetPasswordOTPHash);

    if (!isValid) {
      const nextAttempts = user.otpVerifyAttempts + 1;
      await prisma.user.update({
        where: { id: user.id },
        data: { otpVerifyAttempts: nextAttempts },
      });

      return res.status(400).json({
        success: false,
        message: `Invalid OTP code. Attempts remaining: ${5 - nextAttempts}`,
      });
    }

    // Success response
    return res.status(200).json({
      success: true,
      message: "OTP verified successfully. You may now reset your password.",
    });
  } catch (err) {
    next(err);
  }
}

export async function resetPassword(req: Request, res: Response, next: NextFunction) {
  try {
    const parsed = resetPasswordSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: parsed.error.issues[0]?.message || "Validation failed.",
      });
    }

    const { email, otp, password } = parsed.data;
    const ipAddress = req.ip || req.headers["x-forwarded-for"]?.toString() || "127.0.0.1";
    const userAgent = req.headers["user-agent"] || "unknown";

    const user = await prisma.user.findUnique({
      where: { email },
      include: { employee: true },
    });

    if (!user || !user.isActive) {
      return res.status(400).json({ success: false, message: "User not found or is inactive." });
    }

    if (!user.resetPasswordOTPHash || !user.resetPasswordOTPExpiry) {
      return res.status(400).json({ success: false, message: "No active password reset request found." });
    }

    if (user.resetPasswordOTPExpiry < new Date()) {
      return res.status(400).json({ success: false, message: "Reset OTP has expired." });
    }

    const isValid = await bcrypt.compare(otp, user.resetPasswordOTPHash);
    if (!isValid) {
      return res.status(400).json({ success: false, message: "Invalid verification state." });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    await prisma.$transaction(async (tx) => {
      // Update password and clear OTP states
      await tx.user.update({
        where: { id: user.id },
        data: {
          passwordHash,
          resetPasswordOTPHash: null,
          resetPasswordOTPExpiry: null,
          otpVerifyAttempts: 0,
          otpResendAttempts: 0,
          failedLoginAttempts: 0,
          lockedUntil: null,
          lastPasswordChange: new Date(),
        },
      });

      // Clear sessions
      await tx.session.deleteMany({
        where: { userId: user.id },
      });
    });

    const displayName = user.employee?.fullName || user.email;

    await writeAuditLog({
      action: "UPDATE",
      entity: "USER",
      entityId: user.id,
      entityName: user.email,
      details: "Password Reset Completed via OTP.",
    }, {
      performedById: user.id,
      performedBy: displayName,
      ipAddress,
      userAgent,
    });

    // Send Password Changed alert email
    EmailService.sendPasswordChangedEmail(user.email, displayName, ipAddress, userAgent).catch(console.error);

    return res.status(200).json({
      success: true,
      message: "Password updated successfully. Please login again.",
    });
  } catch (err) {
    next(err);
  }
}

export async function resendOtp(req: Request, res: Response, next: NextFunction) {
  try {
    const parsed = forgotPasswordSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: parsed.error.issues[0]?.message || "Invalid email address.",
      });
    }

    const { email } = parsed.data;
    const user = await prisma.user.findUnique({
      where: { email },
      include: { employee: true },
    });

    if (!user || !user.isActive) {
      return res.status(200).json({
        success: true,
        message: "If the account exists, a new 6-digit OTP code has been sent.",
      });
    }

    const now = new Date();
    if (user.otpResendCooldown && user.otpResendCooldown > now) {
      const remainingSeconds = Math.ceil((user.otpResendCooldown.getTime() - now.getTime()) / 1000);
      return res.status(429).json({
        success: false,
        message: `Please wait ${remainingSeconds} seconds before requesting another code.`,
      });
    }

    if (user.otpResendAttempts >= 3) {
      return res.status(429).json({
        success: false,
        message: "Maximum resend attempts reached (3). Please try again in an hour.",
      });
    }

    const otp = generateNumericOTP();
    const otpHash = await bcrypt.hash(otp, 10);
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetPasswordOTPHash: otpHash,
        resetPasswordOTPExpiry: otpExpiry,
        otpVerifyAttempts: 0,
        otpResendAttempts: user.otpResendAttempts + 1,
        otpResendCooldown: new Date(Date.now() + 60 * 1000),
      },
    });

    const displayName = user.employee?.fullName || user.email;

    EmailService.sendForgotPasswordOtp(user.email, displayName, otp).catch(console.error);

    return res.status(200).json({
      success: true,
      message: "If the account exists, a new 6-digit OTP code has been sent.",
    });
  } catch (err) {
    next(err);
  }
}

// ─── Email Verification Flow ────────────────────────────────────────────────

export async function verifyEmail(req: Request, res: Response, next: NextFunction) {
  try {
    const { token } = req.query;

    if (!token || typeof token !== "string") {
      return res.status(400).json({ success: false, message: "Verification token is required." });
    }

    const user = await prisma.user.findFirst({
      where: {
        emailVerificationToken: token,
      },
      include: { employee: true },
    });

    if (!user) {
      return res.status(400).json({ success: false, message: "Invalid or expired verification link." });
    }

    if (user.emailVerificationExpiry && user.emailVerificationExpiry < new Date()) {
      return res.status(400).json({ success: false, message: "Verification link has expired." });
    }

    // Activate and confirm
    await prisma.user.update({
      where: { id: user.id },
      data: {
        isEmailVerified: true,
        emailVerificationToken: null,
        emailVerificationExpiry: null,
      },
    });

    const displayName = user.employee?.fullName || user.email;

    await writeAuditLog({
      action: "UPDATE",
      entity: "USER",
      entityId: user.id,
      entityName: user.email,
      details: "Email verification successfully completed.",
    }, {
      performedById: user.id,
      performedBy: displayName,
    });

    // Send Welcome Email
    EmailService.sendWelcomeEmail(user.email, displayName).catch(console.error);

    return res.status(200).json({
      success: true,
      message: "Email Verified Successfully",
    });
  } catch (err) {
    next(err);
  }
}

export async function resendVerification(req: Request, res: Response, next: NextFunction) {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: "Email address is required." });
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
      include: { employee: true },
    });

    if (!user) {
      return res.status(200).json({
        success: true,
        message: "If the email is unregistered, a new verification link has been sent.",
      });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({ success: false, message: "This email address is already verified." });
    }

    const verificationToken = crypto.randomBytes(32).toString("hex");
    const verificationExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerificationToken: verificationToken,
        emailVerificationExpiry: verificationExpiry,
      },
    });

    const displayName = user.employee?.fullName || user.email;

    EmailService.sendVerificationEmail(user.email, displayName, verificationToken).catch(console.error);

    return res.status(200).json({
      success: true,
      message: "Verification email successfully resent.",
    });
  } catch (err) {
    next(err);
  }
}
