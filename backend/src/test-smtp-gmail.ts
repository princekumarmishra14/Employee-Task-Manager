import dotenv from "dotenv";
import path from "path";

// Load backend .env variables
dotenv.config({ path: path.join(__dirname, "../.env") });

import { EmailService } from "./services/email/email.service";
import { mailConfig } from "./config/mail";

async function main() {
  console.log("=== SMTP Diagnostic Tool ===");
  console.log("Loaded Mail Configuration:");
  console.log(`- SMTP Host: ${mailConfig.host}`);
  console.log(`- SMTP Port: ${mailConfig.port}`);
  console.log(`- Secure (SSL/TLS): ${mailConfig.secure}`);
  console.log(`- Auth User: ${mailConfig.auth.user}`);
  console.log(`- Auth Pass (Masked): ${mailConfig.auth.pass ? "••••••••••••••••" : "(empty)"}`);
  console.log(`- Mail From: ${mailConfig.from}`);

  console.log("\nVerifying Connection to SMTP Server...");
  const connected = await EmailService.verifyConnection();
  console.log(`SMTP Connection verified: ${connected}`);

  if (!connected) {
    console.error("❌ SMTP connection failed. Check your environment variables and network connectivity.");
    process.exit(1);
  }

  console.log("\nSMTP connection is UP and running!");

  // If a destination Gmail is provided in CLI arguments, send a test OTP email!
  const destEmail = process.argv[2];
  if (destEmail) {
    console.log(`\nAttempting to send a test OTP email to: ${destEmail}...`);
    const sent = await EmailService.sendForgotPasswordOtp(destEmail, "ETM Test User", "998877");
    if (sent) {
      console.log("🎉 Test OTP email sent successfully! Please check your Gmail Inbox (or Spam/Junk folder).");
    } else {
      console.error("❌ Failed to send test OTP email.");
    }
  } else {
    console.log("\n💡 Note: You can test sending a real email by running: npx ts-node src/test-smtp-gmail.ts your-email@gmail.com");
  }

  process.exit(0);
}

main().catch((err) => {
  console.error("Diagnostic script failed:", err);
  process.exit(1);
});
