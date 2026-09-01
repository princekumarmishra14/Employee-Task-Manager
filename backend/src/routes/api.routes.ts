/**
 * =============================================================================
 * CENTRAL API ROUTING REGISTRY
 * Project: Employee Task Manager (Enterprise Edition)
 * Role: Express API Router Map
 * 
 * Description:
 * This module defines the complete route surface area for the Express backend.
 * Routes are divided into two main categories:
 * 1. Public Authentication Routes (Sign up, Log in, Refresh Token)
 * 2. Protected Core Service Routes (JWT verification required)
 * 
 * Security Architecture:
 * - JWT Verification: Injected at `router.use(verifyJwt)` as a pipeline gate.
 * - RBAC Authorization: Fine-grained permissions enforced using `requirePermission("module", "action")`.
 * =============================================================================
 */

import { Router } from "express";
import {
  login,
  refresh,
  signup,
  logout,
  forgotPassword,
  verifyOtp,
  resetPassword,
  resendOtp,
  verifyEmail,
  resendVerification
} from "../modules/auth/auth.controller";
import googleRouter from "./google.routes";
import { getEmployees, getEmployeeById, createEmployee, updateEmployee, deleteEmployee } from "../modules/employee/employee.controller";
import { getTasks, getTaskById, createTask, updateTask, deleteTask, addTaskComment, getTasksStatistics } from "../modules/task/task.controller";
import { getDepartments, getTeams, getProjects, getActivities, getAuditLogs, getDashboardStats, createDepartment, updateDepartment, deleteDepartment, createTeam, updateTeam, deleteTeam, updateProject, deleteProject, createProject } from "../controllers/system.controller";
import { getMyProfile } from "../modules/profile/profile.controller";
import { getRoles, getPermissions } from "../modules/rbac/rbac.controller";
import { verifyJwt } from "../middlewares/auth.middleware";
import { requirePermission } from "../middlewares/rbac.middleware";
import uploadRoutes from "./upload.routes";

const router = Router();

// =============================================================================
// PUBLIC ROUTE DEFINITIONS
// =============================================================================

// User credential validation and JWT issuance (Access + Refresh tokens).
router.post("/auth/login", login);
router.use("/auth", googleRouter);

// Admin/Self-signup endpoint to register new user identities.
router.post("/auth/signup", signup);

// Issue new access token using a valid, cryptographically signed refresh token.
router.post("/auth/refresh", refresh);

// Password Reset OTP Flow
router.post("/auth/forgot-password", forgotPassword);
router.post("/auth/verify-otp", verifyOtp);
router.post("/auth/reset-password", resetPassword);
router.post("/auth/resend-otp", resendOtp);

// Email Verification Flow
router.get("/auth/verify-email", verifyEmail);
router.post("/auth/resend-verification", resendVerification);

// =============================================================================
// JWT PROTECTED ROUTE PIPELINE
// =============================================================================
// All routes below this middleware require a valid, non-expired Bearer JWT.
router.use(verifyJwt as any);

// Session Termination
router.post("/auth/logout", logout as any);

// Active Identity Profile Resolution
router.get("/me", getMyProfile as any);

// File Uploads
router.use("/upload", uploadRoutes);

// =============================================================================
// ROLE-BASED ACCESS CONTROL (RBAC) METADATA
// =============================================================================
// View-level permissions for user-roles registry management.
router.get("/roles", requirePermission("roles", "view") as any, getRoles as any);
router.get("/permissions", requirePermission("roles", "view") as any, getPermissions as any);

// =============================================================================
// EMPLOYEE RESOURCE ENDPOINTS
// =============================================================================
// List all employees (supporting pagination, query filter parameters)
router.get("/employees", getEmployees as any);

// Retrieve detailed employee record by unique identifier
router.get("/employees/:id", getEmployeeById as any);

// Register a new employee (Requires admin/manager level permissions check inside handlers)
router.post("/employees", createEmployee as any);

// Partially update details of an existing employee record
router.patch("/employees/:id", updateEmployee as any);

// Terminate or purge employee record
router.delete("/employees/:id", deleteEmployee as any);

// =============================================================================
// TASK RESOURCE ENDPOINTS
// =============================================================================
// Query and list tasks with status/priority filtering and department grouping
router.get("/tasks", getTasks as any);

// Retrieve task-level telemetry statistics and metrics
router.get("/tasks/statistics", getTasksStatistics as any);

// Fetch a single task by ID alongside assignee and comments
router.get("/tasks/:id", getTaskById as any);

// Create and queue a new project/department task
router.post("/tasks", createTask as any);

// Update task metadata, assignment, or completion status
router.patch("/tasks/:id", updateTask as any);

// Delete or archive a task
router.delete("/tasks/:id", deleteTask as any);

// Append a comment thread to a task
router.post("/tasks/:id/comments", addTaskComment as any);

// =============================================================================
// SYSTEM & METADATA SERVICES
// =============================================================================
// Retrieve system lookup departments
router.get("/departments", getDepartments);
router.post("/departments", createDepartment as any);
router.patch("/departments/:id", updateDepartment as any);
router.delete("/departments/:id", deleteDepartment as any);

// Fetch system lookup teams
router.get("/teams", getTeams);
router.post("/teams", createTeam as any);
router.patch("/teams/:id", updateTeam as any);
router.delete("/teams/:id", deleteTeam as any);

// Fetch system lookup project schedules
router.get("/projects", getProjects);
router.post("/projects", createProject as any);
router.patch("/projects/:id", updateProject as any);
router.delete("/projects/:id", deleteProject as any);

// Query global audit activity feed (for real-time dashboards)
router.get("/activity", getActivities);

// Query compliance and security audit logs (restricted log views)
router.get("/audit-logs", getAuditLogs);

// Aggregate and calculate dashboard telemetry, counters, and statistics
router.get("/dashboard/stats", getDashboardStats);
router.get("/dashboard/statistics", getDashboardStats);

export default router;
