import dotenv from "dotenv";
dotenv.config();

const host = process.env.SMTP_HOST || "sandbox.smtp.mailtrap.io";
const port = process.env.SMTP_PORT || "2525";
const secure = process.env.SMTP_SECURE || "false";
const user = process.env.SMTP_USER || "sandbox_user";
const pass = process.env.SMTP_PASSWORD || process.env.SMTP_PASS || "sandbox_pass";
const from = process.env.EMAIL_FROM || process.env.MAIL_FROM || "no-reply@localhost";

if (!process.env.SMTP_USER || !(process.env.SMTP_PASSWORD || process.env.SMTP_PASS)) {
  console.warn("\n====================================================");
  console.warn("⚠️ WARNING: SMTP Credentials not configured in backend/.env.");
  console.warn("Using local sandbox SMTP settings. Server will run normally.");
  console.warn("====================================================\n");
}

const useGmail = user.toLowerCase().includes("gmail.com");

export const mailConfig = {
  host: useGmail ? "smtp.gmail.com" : host,
  port: useGmail ? 587 : parseInt(port, 10),
  secure: useGmail ? false : (secure === "true"),
  auth: {
    user,
    pass,
  },
  from: useGmail ? user : from,
};
