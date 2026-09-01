import nodemailer from "nodemailer";
import { mailConfig } from "../../config/mail";
import prisma from "../../lib/prisma";
import {
  getWelcomeEmailHtml,
  getVerifyEmailHtml,
  getForgotPasswordOtpHtml,
  getPasswordChangedHtml,
  getNewLoginAlertHtml,
  getGoogleAccountLinkedHtml,
  getGoogleAccountUnlinkedHtml,
  getAccountLockedHtml,
  getAccountCreatedHtml
} from "./emailTemplates";

// Create Nodemailer transporter with connection timeout and TLS fallback parameters
const transporter = nodemailer.createTransport({
  host: mailConfig.host,
  port: mailConfig.port,
  secure: mailConfig.secure, // true for port 465, false for other ports
  auth: {
    user: mailConfig.auth.user,
    pass: mailConfig.auth.pass,
  },
  connectionTimeout: 10000, // 10 seconds connection timeout limit
  tls: {
    // Prevent verification crashes on self-signed localhost/development certs
    rejectUnauthorized: false,
  },
});

export class EmailService {
  private static isProcessing = false;

  /**
   * Verify SMTP connection status.
   */
  static async verifyConnection(): Promise<boolean> {
    try {
      console.log(`[EmailService] Validating SMTP connection to ${mailConfig.host}:${mailConfig.port}...`);
      await transporter.verify();
      console.log("[EmailService] SMTP connection verified successfully.");
      return true;
    } catch (err: any) {
      console.error("[EmailService] SMTP connection verification failed:", err.message || err);
      return false;
    }
  }

  /**
   * Queue email in the database for asynchronous background delivery.
   */
  static async queueMail(options: { to: string; subject: string; html: string }): Promise<boolean> {
    try {
      console.log(`[EmailService] Queueing email to ${options.to}: "${options.subject}"`);
      await prisma.emailQueue.create({
        data: {
          to: options.to,
          subject: options.subject,
          html: options.html,
          status: "PENDING",
        },
      });
      
      // Asynchronously trigger processing immediately in the background
      this.processQueue().catch((err) => {
        console.error("[EmailService] Immediate queue processing failed:", err.message || err);
      });
      
      return true;
    } catch (err: any) {
      console.error(`[EmailService] Failed to queue email to ${options.to}:`, err.message || err);
      return false;
    }
  }

  /**
   * Processes pending emails in the database queue with retry logic and logs outcomes.
   */
  static async processQueue(): Promise<void> {
    if (this.isProcessing) return;
    this.isProcessing = true;

    try {
      // Retrieve up to 10 pending emails that haven't exceeded retry limits
      const pendingMails = await prisma.emailQueue.findMany({
        where: {
          status: "PENDING",
          attempts: { lt: 3 },
        },
        orderBy: { createdAt: "asc" },
        take: 10,
      });

      if (pendingMails.length === 0) {
        this.isProcessing = false;
        return;
      }

      console.log(`[EmailService] Processing ${pendingMails.length} queued emails...`);

      for (const email of pendingMails) {
        // Prevent duplicate sends by incrementing attempts first
        await prisma.emailQueue.update({
          where: { id: email.id },
          data: { attempts: { increment: 1 } },
        });

        try {
          console.log(`[EmailService] Delivering email ${email.id} to ${email.to}...`);
          
          const mailOptions = {
            from: `"${process.env.NEXT_PUBLIC_APP_NAME || "Employee Task Manager"}" <${mailConfig.from}>`,
            to: email.to,
            subject: email.subject,
            html: email.html,
          };

          const info = await transporter.sendMail(mailOptions);
          
          await prisma.emailQueue.update({
            where: { id: email.id },
            data: { status: "SENT", updatedAt: new Date() },
          });

          console.log(`[EmailService] Email Delivered: ${email.id} to ${email.to}. Msg ID: ${info.messageId}`);
        } catch (sendErr: any) {
          console.error(`[EmailService] SMTP Failure for email ${email.id} to ${email.to}:`, sendErr.message || sendErr);
          
          const currentAttempts = email.attempts + 1;
          const status = currentAttempts >= 3 ? "FAILED" : "PENDING";
          
          await prisma.emailQueue.update({
            where: { id: email.id },
            data: {
              status,
              lastError: sendErr.message || String(sendErr),
              updatedAt: new Date(),
            },
          });
          
          if (status === "FAILED") {
            console.error(`[EmailService] Email permanently failed: ${email.id} after ${currentAttempts} attempts.`);
          } else {
            console.warn(`[EmailService] Email Retry scheduled: ${email.id}. Attempt ${currentAttempts}/3.`);
          }
        }
      }
    } catch (err: any) {
      console.error("[EmailService] Queue worker error:", err.message || err);
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Direct synchronous send method, reserved for diagnostics and test scripts.
   */
  static async sendMailDirect(options: { to: string; subject: string; html: string }): Promise<boolean> {
    try {
      const mailOptions = {
        from: `"${process.env.NEXT_PUBLIC_APP_NAME || "Employee Task Manager"}" <${mailConfig.from}>`,
        to: options.to,
        subject: options.subject,
        html: options.html,
      };
      await transporter.sendMail(mailOptions);
      console.log(`[EmailService] Direct email successfully sent to ${options.to}.`);
      return true;
    } catch (err: any) {
      console.error(`[EmailService] Direct send failure to ${options.to}:`, err.message || err);
      return false;
    }
  }

  // ─── Production Queue Dispatch Helpers ─────────────────────────────────────

  static async sendWelcomeEmail(to: string, name: string): Promise<boolean> {
    const loginUrl = `${process.env.APP_URL || "http://localhost:3000"}/login`;
    const html = getWelcomeEmailHtml(name, loginUrl);
    return this.queueMail({ to, subject: "Welcome to Employee Task Manager", html });
  }

  static async sendVerificationEmail(to: string, name: string, token: string): Promise<boolean> {
    const verifyUrl = `${process.env.APP_URL || "http://localhost:3000"}/verify-email?token=${token}`;
    const html = getVerifyEmailHtml(name, verifyUrl);
    return this.queueMail({ to, subject: "Verify Your Email Address - ETM", html });
  }

  static async sendForgotPasswordOtp(to: string, name: string, otp: string): Promise<boolean> {
    const html = getForgotPasswordOtpHtml(name, otp);
    return this.queueMail({ to, subject: "Password Reset Verification Code", html });
  }

  static async sendPasswordChangedEmail(to: string, name: string, ip: string, device: string): Promise<boolean> {
    const now = new Date();
    const date = now.toLocaleDateString();
    const time = now.toLocaleTimeString();
    const html = getPasswordChangedHtml(name, date, time, ip, device);
    return this.queueMail({ to, subject: "Your Password Was Successfully Changed", html });
  }

  static async sendNewLoginAlertEmail(options: {
    to: string;
    name: string;
    ip: string;
    device: string;
    method: string;
  }): Promise<boolean> {
    const now = new Date();
    const date = now.toLocaleDateString();
    const time = now.toLocaleTimeString();
    const resetUrl = `${process.env.APP_URL || "http://localhost:3000"}/forgot-password`;
    const html = getNewLoginAlertHtml({
      name: options.name,
      date,
      time,
      ip: options.ip,
      device: options.device,
      method: options.method,
      resetUrl,
    });
    return this.queueMail({ to: options.to, subject: "New Login Detected - Security Alert", html });
  }

  static async sendGoogleAccountLinkedEmail(to: string, name: string, ip: string): Promise<boolean> {
    const date = new Date().toLocaleString();
    const html = getGoogleAccountLinkedHtml(name, date, ip);
    return this.queueMail({ to, subject: "Google Account Successfully Connected", html });
  }

  static async sendGoogleAccountUnlinkedEmail(to: string, name: string, ip: string): Promise<boolean> {
    const date = new Date().toLocaleString();
    const html = getGoogleAccountUnlinkedHtml(name, date, ip);
    return this.queueMail({ to, subject: "Google Account Disconnected", html });
  }

  static async sendAccountLockedEmail(to: string, name: string, lockUntil: Date, ip: string): Promise<boolean> {
    const lockUntilStr = lockUntil.toLocaleString();
    const html = getAccountLockedHtml(name, lockUntilStr, ip);
    return this.queueMail({ to, subject: "Account Access Temporarily Suspended", html });
  }

  static async sendAccountCreatedEmail(to: string, name: string, email: string): Promise<boolean> {
    const html = getAccountCreatedHtml(name, email);
    return this.queueMail({ to, subject: "Account Created Successfully - ETM", html });
  }
}
