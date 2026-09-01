/**
 * Mailtrap Email sending integration.
 * Uses native fetch to execute HTTP API requests.
 */

export interface EmailRecipient {
  email: string;
  name?: string;
}

export interface SendEmailPayload {
  to: EmailRecipient[];
  subject: string;
  html: string;
}

export async function sendMailtrapEmail(payload: SendEmailPayload): Promise<boolean> {
  const token = process.env.MAILTRAP_API_TOKEN;
  const fromEmail = process.env.MAIL_FROM || "no-reply@etm.com";
  const fromName = "Employee Task Manager";

  if (!token) {
    console.error("[EmailService] MAILTRAP_API_TOKEN environment variable is not defined.");
    return false;
  }

  // Determine sending endpoint
  // Supports standard Mailtrap Sending API and Sandbox Inbox API
  const sandboxInboxId = process.env.MAILTRAP_SANDBOX_INBOX_ID;
  const endpoint = sandboxInboxId
    ? `https://sandbox.api.mailtrap.io/api/send/${sandboxInboxId}`
    : "https://send.api.mailtrap.io/api/send";

  const requestBody = {
    from: {
      email: fromEmail,
      name: fromName,
    },
    to: payload.to.map((rec) => ({
      email: rec.email,
      name: rec.name || rec.email.split("@")[0],
    })),
    subject: payload.subject,
    html: payload.html,
    category: "Password Reset",
  };

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        `[EmailService] Mailtrap send failed. Status: ${response.status}. Response: ${errorText}`
      );
      return false;
    }

    return true;
  } catch (err) {
    console.error("[EmailService] Network/Connection failure communicating with Mailtrap:", err);
    return false;
  }
}
