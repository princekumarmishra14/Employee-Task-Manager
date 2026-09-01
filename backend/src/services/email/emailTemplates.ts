/**
 * backend/src/services/email/emailTemplates.ts
 * Premium, responsive, mobile-friendly, dark-mode compatible HTML email templates
 * for Employee Task Manager (ETM) enterprise communications.
 */

// Shared premium base style rules
const SHARED_STYLES = `
  body {
    font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
    background-color: #f1f5f9;
    margin: 0;
    padding: 0;
    color: #334155;
    -webkit-font-smoothing: antialiased;
  }
  .wrapper {
    background-color: #f1f5f9;
    padding: 32px 16px;
  }
  .container {
    max-width: 600px;
    margin: 0 auto;
    background-color: #ffffff;
    border-radius: 20px;
    overflow: hidden;
    box-shadow: 0 10px 15px -3px rgba(0,0,0,0.05), 0 4px 6px -4px rgba(0,0,0,0.05);
    border: 1px solid #e2e8f0;
  }
  .header {
    background: linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%);
    padding: 40px 32px;
    text-align: center;
  }
  .header h1 {
    color: #ffffff;
    font-size: 26px;
    margin: 0;
    font-weight: 800;
    letter-spacing: -0.025em;
    text-transform: uppercase;
  }
  .body {
    padding: 40px 32px;
  }
  .body h2 {
    font-size: 20px;
    margin-top: 0;
    color: #0f172a;
    font-weight: 700;
  }
  .body p {
    font-size: 15px;
    line-height: 1.6;
    color: #475569;
  }
  .btn-container {
    text-align: center;
    margin: 32px 0;
  }
  .btn {
    background-color: #4f46e5;
    color: #ffffff !important;
    text-decoration: none;
    padding: 14px 28px;
    font-size: 14px;
    font-weight: 700;
    border-radius: 12px;
    display: inline-block;
    box-shadow: 0 4px 10px rgba(79, 70, 229, 0.25);
  }
  .otp-code {
    font-size: 32px;
    font-weight: 800;
    color: #4f46e5;
    background-color: #f8fafc;
    border: 2px dashed #cbd5e1;
    border-radius: 12px;
    padding: 16px;
    text-align: center;
    letter-spacing: 6px;
    margin: 24px auto;
    width: 200px;
  }
  .info-grid {
    background-color: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 12px;
    padding: 20px;
    margin: 24px 0;
  }
  .info-row {
    display: flex;
    justify-content: space-between;
    padding: 8px 0;
    border-bottom: 1px solid #f1f5f9;
    font-size: 13px;
  }
  .info-row:last-child {
    border-bottom: none;
  }
  .info-label {
    font-weight: 700;
    color: #64748b;
  }
  .info-value {
    color: #334155;
    font-weight: 600;
  }
  .divider {
    height: 1px;
    background-color: #e2e8f0;
    margin: 32px 0;
  }
  .footer {
    background-color: #f8fafc;
    padding: 32px;
    text-align: center;
    font-size: 12px;
    color: #94a3b8;
    border-top: 1px solid #e2e8f0;
  }
  .footer a {
    color: #4f46e5;
    text-decoration: none;
    font-weight: 600;
  }
  .security-badge {
    font-size: 11px;
    color: #94a3b8;
    background-color: #f1f5f9;
    padding: 8px 12px;
    border-radius: 8px;
    display: inline-block;
    margin-top: 16px;
  }
  .social-links {
    margin-top: 16px;
  }
  .social-link {
    margin: 0 8px;
    color: #64748b;
    text-decoration: none;
  }
`;

// Helper base layout wrapper
function wrapTemplate(title: string, bodyContent: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>${SHARED_STYLES}</style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <div class="header">
        <h1>Employee Task Manager</h1>
      </div>
      <div class="body">
        ${bodyContent}
      </div>
      <div class="footer">
        <p>&copy; 2026 ETM Platform. All rights reserved.</p>
        <p>This is a secure enterprise transmission. Need assistance? Contact our <a href="mailto:support@etm.com">Security Operations Center</a></p>
        <div class="social-links">
          <a href="#" class="social-link">LinkedIn</a> | 
          <a href="#" class="social-link">Twitter</a> | 
          <a href="#" class="social-link">GitHub</a>
        </div>
      </div>
    </div>
  </div>
</body>
</html>
  `.trim();
}

/**
 * 1. Welcome Email Template
 */
export function getWelcomeEmailHtml(name: string, loginUrl: string): string {
  return wrapTemplate("Welcome to ETM", `
    <h2>Welcome Aboard, ${name}!</h2>
    <p>We are thrilled to welcome you to the Employee Task Manager (ETM) platform. Your enterprise workspace is fully provisioned and ready.</p>
    <p>You can log in using your company email to coordinate tasks, join projects, and review department metrics.</p>
    <div class="btn-container">
      <a href="${loginUrl}" class="btn">Get Started Now</a>
    </div>
    <div class="info-grid">
      <div class="info-row">
        <span class="info-label">Account Support</span>
        <span class="info-value">support@etm.com</span>
      </div>
      <div class="info-row">
        <span class="info-label">Workspace Access</span>
        <span class="info-value">Public Beta v2.0</span>
      </div>
    </div>
    <p>If the button above does not work, copy and paste the following link in your browser:</p>
    <p style="word-break: break-all; font-size: 12px; color: #4f46e5; background-color: #f1f5f9; padding: 12px; border-radius: 8px;">${loginUrl}</p>
  `);
}

/**
 * 2. Verification Email Template
 */
export function getVerifyEmailHtml(name: string, verifyUrl: string): string {
  return wrapTemplate("Verify Your Email Address", `
    <h2>Account Verification Required</h2>
    <p>Hello ${name},</p>
    <p>Thank you for registering on the Employee Task Manager platform. To activate your account and enable workspace access, please confirm your email address.</p>
    <div class="btn-container">
      <a href="${verifyUrl}" class="btn">Verify Email Address</a>
    </div>
    <p>If you did not initiate this registration request, you can safely ignore this transmission. This activation link remains active for 24 hours.</p>
    <div class="divider"></div>
    <p style="word-break: break-all; font-size: 11px; color: #64748b;">Link: ${verifyUrl}</p>
  `);
}

/**
 * 3. Forgot Password OTP Email Template
 */
export function getForgotPasswordOtpHtml(name: string, otp: string): string {
  return wrapTemplate("Reset Password Code", `
    <h2>Password Reset Verification Code</h2>
    <p>Hello ${name},</p>
    <p>A request was made to reset the password associated with your account on the Employee Task Manager platform. Please use the following 6-digit verification code to proceed.</p>
    <div class="otp-code">${otp}</div>
    <p><strong>Notice:</strong> This verification code is valid for <strong>10 minutes</strong> and will be invalidated once used. Do not share this OTP with anyone.</p>
    <div class="divider"></div>
    <div class="security-badge">Security Code Security notice: SOC2 compliant audit ledger active.</div>
  `);
}

/**
 * 4. Password Changed Notification Template
 */
export function getPasswordChangedHtml(name: string, date: string, time: string, ip: string, device: string): string {
  return wrapTemplate("Password Successfully Changed", `
    <h2>Password Change Confirmation</h2>
    <p>Hello ${name},</p>
    <p>This is a security alert confirming that your account password was changed successfully.</p>
    <div class="info-grid">
      <div class="info-row">
        <span class="info-label">Date & Time</span>
        <span class="info-value">${date} at ${time}</span>
      </div>
      <div class="info-row">
        <span class="info-label">IP Address</span>
        <span class="info-value">${ip}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Device Agent</span>
        <span class="info-value">${device}</span>
      </div>
    </div>
    <p><strong>Warning:</strong> If you did not make this change, please reset your password immediately using the Login screen or notify your security administrator.</p>
  `);
}

/**
 * 5. New Login Alert Email Template
 */
export function getNewLoginAlertHtml(options: {
  name: string;
  date: string;
  time: string;
  ip: string;
  device: string;
  method: string;
  resetUrl: string;
}): string {
  const { name, date, time, ip, device, method, resetUrl } = options;
  return wrapTemplate("New Account Login Detected", `
    <h2>New Login Detected</h2>
    <p>Hello ${name},</p>
    <p>We detected a new successful login session on your ETM employee profile.</p>
    <div class="info-grid">
      <div class="info-row">
        <span class="info-label">Date & Time</span>
        <span class="info-value">${date} at ${time}</span>
      </div>
      <div class="info-row">
        <span class="info-label">IP Address</span>
        <span class="info-value">${ip}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Login Method</span>
        <span class="info-value">${method}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Device Details</span>
        <span class="info-value">${device}</span>
      </div>
    </div>
    <p>If this was you, no action is required.</p>
    <p><strong>If you did not authorize this login</strong>, please secure your profile by resetting your password immediately:</p>
    <div class="btn-container">
      <a href="${resetUrl}" class="btn">Secure Account / Reset Password</a>
    </div>
  `);
}

/**
 * 6. Google Account Linked Template
 */
export function getGoogleAccountLinkedHtml(name: string, date: string, ip: string): string {
  return wrapTemplate("Google Identity Connection Alert", `
    <h2>Google Account Integration Added</h2>
    <p>Hello ${name},</p>
    <p>Your ETM credentials account has been successfully linked to your Google Single Sign-On (SSO) profile.</p>
    <div class="info-grid">
      <div class="info-row">
        <span class="info-label">Integration Date</span>
        <span class="info-value">${date}</span>
      </div>
      <div class="info-row">
        <span class="info-label">IP Origin</span>
        <span class="info-value">${ip}</span>
      </div>
    </div>
    <p>You can now use the Google login button to sign in directly without typing your password.</p>
  `);
}

/**
 * 7. Google Account Unlinked Template
 */
export function getGoogleAccountUnlinkedHtml(name: string, date: string, ip: string): string {
  return wrapTemplate("Google Account Removed", `
    <h2>Google Identity Disconnected</h2>
    <p>Hello ${name},</p>
    <p>Your Google authentication account integration has been removed from your ETM employee profile.</p>
    <div class="info-grid">
      <div class="info-row">
        <span class="info-label">Action Date</span>
        <span class="info-value">${date}</span>
      </div>
      <div class="info-row">
        <span class="info-label">IP Origin</span>
        <span class="info-value">${ip}</span>
      </div>
    </div>
    <p>You will need to use your corporate email and password credentials for future logins.</p>
  `);
}

/**
 * 8. General Account Created Alert
 */
export function getAccountCreatedHtml(name: string, email: string): string {
  return wrapTemplate("Account Created Successfully", `
    <h2>Account Provisioning Completed</h2>
    <p>Hello ${name},</p>
    <p>Your ETM employee profile associated with <strong>${email}</strong> has been successfully configured and created in the system database.</p>
    <p>Welcome to our workspace portal! You are now part of our unified collaboration gateway.</p>
  `);
}

/**
 * 9. Admin Invitation Template
 */
export function getAdminInvitationHtml(name: string, inviteUrl: string): string {
  return wrapTemplate("Admin Workspace Invitation", `
    <h2>ETM Admin Workspace Invitation</h2>
    <p>Hello ${name},</p>
    <p>An administrator has invited you to activate your credentials on the Employee Task Manager platform with administrative clearances.</p>
    <div class="btn-container">
      <a href="${inviteUrl}" class="btn">Accept Invitation</a>
    </div>
    <p>Please click the connection gateway link above to accept the workspace credentials transfer. This invitation will expire in 48 hours.</p>
  `);
}

/**
 * 10. Account Locked Alert
 */
export function getAccountLockedHtml(name: string, lockUntil: string, ip: string): string {
  return wrapTemplate("Security Alert: Account Temporarily Locked", `
    <h2>Account Security Lockout Active</h2>
    <p>Hello ${name},</p>
    <p>We detected multiple failed login attempts on your account. To protect your data, your profile has been temporarily locked.</p>
    <div class="info-grid">
      <div class="info-row">
        <span class="info-label">Lock Expiration</span>
        <span class="info-value">${lockUntil}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Attempt IP Origin</span>
        <span class="info-value">${ip}</span>
      </div>
    </div>
    <p>You will be able to attempt credentials login again after the lockout expires. If this was not you, please trigger a secure password reset immediately.</p>
  `);
}
