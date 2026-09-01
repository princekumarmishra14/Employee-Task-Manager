/**
 * =============================================================================
 * EXPRESS APPLICATION BOOTSTRAP & PIPELINE CONFIGURATION
 * Project: Employee Task Manager (Enterprise Edition)
 * Role: Backend Core Gateway / HTTP Server Entry
 * 
 * Description:
 * This module initializes the Express application, configures essential security
 * and transport middleware (CORS, JSON parsers, URLEncoded parsers), establishes
 * request logging, registers the primary API router, and provisions a global
 * asynchronous error handler. It also handles macOS-specific port collisions
 * and implements graceful shutdown protocols.
 * 
 * Middleware Pipeline Sequence:
 * 1. DOTENV Configuration - Loads environment variables.
 * 2. CORS - Permits credentials & restricted origins (e.g. Next.js at port 3000).
 * 3. Body Parsers - Express JSON & URLEncoded parsers.
 * 4. Request Logging - Active in non-production modes.
 * 5. Health Gateway - /health ping endpoint.
 * 6. API Route Router - Mapped under `/api`.
 * 7. Global Error Handler - Catches and formats unhandled exceptions.
 * =============================================================================
 */

import dotenv from "dotenv";
dotenv.config();

import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import path from "path";
import apiRoutes from "./routes/api.routes";
import { EmailService } from "./services/email/email.service";

const app = express();

// Server listening port resolution. 
// Standard Express application default is 5000/5001.
// Note: macOS Monterey and later restricts port 5000 for AirPlay Receiver services.
let PORT = parseInt(process.env.PORT as string, 10) || 5001;
if (PORT === 5000) {
  console.log("⚠️ Port 5000 is restricted due to macOS AirPlay conflict. Forcing port 5001 instead.");
  PORT = 5001;
}

// Configure CORS to dynamically allow localhost and local network IP origins
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:3001",
  "http://127.0.0.1:3000",
  "http://127.0.0.1:3001"
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      
      const isLocalhost = origin.includes("localhost") || origin.includes("127.0.0.1");
      const isLocalIP = /^http:\/\/192\.168\./.test(origin) || 
                        /^http:\/\/10\./.test(origin) || 
                        /^http:\/\/172\.(1[6-9]|2[0-9]|3[0-1])\./.test(origin);
                        
      if (isLocalhost || isLocalIP || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

// Apply body-parsing middlewares to process standard application/json and application/x-www-form-urlencoded payloads.
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from the uploads directory
app.use("/uploads", express.static(path.join(__dirname, "../../uploads")));

// HTTP Request Logger Middleware
// Logs HTTP method and target URL in local/development environment to ease tracing and debugging.
if (process.env.NODE_ENV !== "production") {
  app.use((req, res, next) => {
    console.log(`[Express API] ${req.method} ${req.url}`);
    next();
  });
}

// Health Check Gateway
// Simple ping endpoint for deployment orchestration health checking (e.g. AWS target group, Kubernetes liveness probes).
app.get("/health", (req, res) => {
  res.status(200).json({ status: "UP", timestamp: new Date() });
});

// Primary route dispatcher
// Registers API sub-routers (Auth, Employee, Tasks, system controllers) under the '/api' prefix namespace.
app.use("/api", apiRoutes);

// Global Error Handler Middleware
// Captures and logs all unhandled exceptions occurring inside async handlers or routing steps.
// Prevents stack trace leakages to client, formatting client-safe responses.
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error("[Express API Error]:", err);
  const status = err.statusCode || err.status || 500;
  const message = err.message || "An unexpected server error occurred.";
  return res.status(status).json({
    success: false,
    message,
    errors: err.errors || undefined,
  });
});

// Launch server instance
const server = app.listen(PORT, async () => {
  console.log(`🚀 Express server running on http://localhost:${PORT}`);
  await EmailService.verifyConnection();

  // Start background email queue worker (runs every 5 seconds)
  setInterval(() => {
    EmailService.processQueue().catch((err) => {
      console.error("[EmailQueue Worker Error]:", err);
    });
  }, 5000);
});

// Global server error tracking (e.g., EADDRINUSE)
server.on('error', (err) => {
  console.error('[Server Error]', err);
  process.exit(1);
});

// Graceful Shutdown Handler
// Responds to termination signals (SIGTERM) to clean up DB client resources before system exit.
process.on("SIGTERM", () => {
  console.log("Shutting down Express server...");
  server.close(() => {
    process.exit(0);
  });
});
