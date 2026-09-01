/**
 * =============================================================================
 * TASK CONTROLLER LAYER
 * Project: Employee Task Manager (Enterprise Edition)
 * Role: Task API Endpoints Controller Handlers
 * 
 * Description:
 * Implements business handler orchestrations for task workflows. Translates inbound Express
 * HTTP requests, validates access roles, calls underlying repository engines, fires auditing
 * compliance ledgers, aggregates telemetry feeds, and serializes clean HTTP responses.
 * =============================================================================
 */

import { Response, NextFunction } from "express";
import { z } from "zod";
import { AuthenticatedRequest } from "../../middlewares/auth.middleware";
import { TaskRepository } from "./task.repository";
import { TaskStatisticsService } from "./task-statistics.service";
import prisma from "../../lib/prisma";
import { audit } from "../../lib/audit";
import { activity } from "../../lib/activity";
import { TaskStatus, TaskPriority } from "@prisma/client";

/**
 * Retrieves a paginated list of tasks filtered by client criteria.
 * Maps request query parameters to typing filters.
 * Under RBAC rules, EMPLOYEE users can only view their own assigned tasks.
 */
export async function getTasks(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const isEmployee = req.user?.role === "EMPLOYEE";
    const filters = {
      search: req.query.search?.toString() || undefined,
      status: (req.query.status as TaskStatus) || undefined,
      priority: (req.query.priority as TaskPriority) || undefined,
      // Lock assignee ID filter to the current user's ID if role is Employee
      assigneeId: isEmployee ? req.user?.id : (req.query.assigneeId?.toString() || undefined),
      departmentId: req.query.departmentId?.toString() || undefined,
      teamId: req.query.teamId?.toString() || undefined,
      projectId: req.query.projectId?.toString() || undefined,
      isOverdue: req.query.isOverdue !== undefined ? req.query.isOverdue === "true" : undefined,
      startDate: req.query.startDate?.toString() || undefined,
      endDate: req.query.endDate?.toString() || undefined,
    };

    const searchParams = new URLSearchParams();
    if (req.query.page) searchParams.set("page", req.query.page.toString());
    if (req.query.pageSize) searchParams.set("pageSize", req.query.pageSize.toString());

    // Execute query builder on Repository layer
    const result = await TaskRepository.findMany(filters, searchParams, req.user);
    return res.status(200).json({ success: true, data: result.data, meta: result.meta });
  } catch (err) {
    next(err);
  }
}

/**
 * Fetch detailed task profile matching specific ID.
 */
export async function getTaskById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const id = req.params.id as string;
    const task = await TaskRepository.findById(id);
    return res.status(200).json({ success: true, data: task });
  } catch (err) {
    next(err);
  }
}

/**
 * Registers a new project/department task.
 * 
 * Flowchart for createTask:
 * [1. Validate Roles] -> Role is SUPER_ADMIN, ADMIN, or MANAGER
 *                              |
 *                              v
 * [2. Parse Request Body] -> Map properties & format Date / estimate parameters
 *                              |
 *                              v
 * [3. Invoke Repository] -> TaskRepository.create(...)
 *                              |
 *                              v
 * [4. Trigger Side Effects] -> Async audit.taskCreated() & activity.taskCreated()
 *                              |
 *                              v
 * [5. HTTP Response] -> Return 201 Created with JSON task data
 */
const createTaskSchema = z.object({
  title: z
    .string()
    .transform((val) => val.trim().replace(/\s+/g, " "))
    .refine((val) => val.length >= 3, {
      message: "Task title must contain at least 3 characters.",
    })
    .refine((val) => val.length <= 10, {
      message: "Task title cannot exceed 10 characters.",
    }),
  description: z
    .string()
    .trim()
    .refine((val) => val.length >= 20, { message: "Description must contain at least 20 characters." })
    .refine((val) => val.length <= 60, { message: "Description cannot exceed 60 characters." }),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "ESCALATED"]).optional(),
  status: z.enum(["UNASSIGNED", "ASSIGNED", "IN_PROGRESS", "COMPLETED", "OVERDUE", "ARCHIVED"]).optional(),
  dueDate: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), { message: "Invalid due date." })
    .transform((val) => new Date(val)),
  assigneeId: z.string().nullable().optional(),
  departmentId: z.string().nullable().optional(),
  teamId: z.string().nullable().optional(),
  projectId: z.string().nullable().optional(),
  estimatedHours: z
    .union([z.number(), z.string(), z.null()])
    .transform((val) => {
      if (val === undefined || val === null || val === "") return null;
      const parsed = typeof val === "number" ? val : parseInt(val, 10);
      return isNaN(parsed) ? null : parsed;
    })
    .optional(),
  tags: z.string().nullable().optional(),
});

export async function createTask(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    // Assert user role clearances
    if (req.user?.role !== "SUPER_ADMIN" && req.user?.role !== "ADMIN" && req.user?.role !== "MANAGER") {
      return res.status(403).json({ success: false, message: "Forbidden. Admin or Manager role required." });
    }

    const parsed = createTaskSchema.safeParse(req.body);
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

    const { title, description, priority, status, dueDate, assigneeId, departmentId, teamId, projectId, estimatedHours, tags } = parsed.data;

    // Create task database record
    const task = await TaskRepository.create({
      title,
      description,
      priority: priority as TaskPriority,
      status: status as TaskStatus,
      dueDate,
      assigneeId: assigneeId || null,
      departmentId: departmentId || null,
      teamId: teamId || null,
      projectId: projectId || null,
      estimatedHours: estimatedHours ?? null,
      tags: tags || null,
      createdBy: req.user?.email || "system",
    });

    const ipAddress = req.ip || req.headers["x-forwarded-for"]?.toString() || undefined;

    // Trigger downstream asynchronous logging operations in parallel
    await Promise.all([
      audit.taskCreated(task.id, task.title, {
        performedById: req.user?.id,
        performedBy: req.user?.email || "system",
        ipAddress,
      }),
      activity.taskCreated(task.id, task.title, {
        actorId: req.user?.id,
        actorName: req.user?.email || "system",
      }),
    ]);

    return res.status(201).json({ success: true, data: task });
  } catch (err) {
    next(err);
  }
}

/**
 * Updates metadata of a task record.
 * 
 * Flowchart for updateTask:
 * [1. Identify User Role] -> Check if user is EMPLOYEE or ADMIN/MANAGER
 *                                   |
 *         +-------------------------+-------------------------+
 *         | (EMPLOYEE)                                        | (ADMIN/MANAGER)
 *         v                                                   v
 * [2a. Validate status update]                      [2b. Allow bulk update fields]
 *         |                                                   |
 *         v                                                   v
 * [3a. Run status update Prisma query]              [3b. Run generic update Prisma query]
 *         |                                                   |
 *         v                                                   v
 * [4a. Log status audit & feed]                     [4b. Log general details audit]
 *         |                                                   |
 *         +-------------------------+-------------------------+
 *                                   |
 *                                   v
 *                           [5. Return 200 OK]
 */
export async function updateTask(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const id = req.params.id as string;
    const isEmployee = req.user?.role === "EMPLOYEE";

    const existing = await TaskRepository.findById(id!);

    // Role restrictions gating logic
    if (isEmployee) {
      // Employees are only authorized to change the current progress status field.
      const { status } = req.body;
      if (!status) {
        return res.status(400).json({ success: false, message: "Employees can only update task status." });
      }

      const statusSchema = z.enum(["UNASSIGNED", "ASSIGNED", "IN_PROGRESS", "COMPLETED", "OVERDUE", "ARCHIVED"]);
      const parsedStatus = statusSchema.safeParse(status);
      if (!parsedStatus.success) {
        return res.status(400).json({ success: false, message: "Invalid task status value." });
      }

      const updated = await TaskRepository.update(id!, {
        status: parsedStatus.data,
        updatedBy: req.user?.email || "system",
      });

      const ipAddress = req.ip || req.headers["x-forwarded-for"]?.toString() || undefined;

      // Register task state changes
      await Promise.all([
        audit.taskStatusChanged(id, existing.title, existing.status, parsedStatus.data, {
          performedById: req.user?.id,
          performedBy: req.user?.email || "system",
          ipAddress,
        }),
        activity.taskStatusChanged(id, existing.title, parsedStatus.data, {
          actorId: req.user?.id,
          actorName: req.user?.email || "system",
        }),
      ]);

      return res.status(200).json({ success: true, data: updated });
    }

    // Manager / Admin update sequence allowing full attribute changes.
    const updateTaskSchema = createTaskSchema.partial();
    const parsed = updateTaskSchema.safeParse(req.body);
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

    const updates = parsed.data;
    const updated = await TaskRepository.update(id!, {
      ...updates,
      updatedBy: req.user?.email || "system",
    });

    const ipAddress = req.ip || req.headers["x-forwarded-for"]?.toString() || undefined;

    await audit.taskUpdated(id!, updated.title, {}, updates, {
      performedById: req.user?.id,
      performedBy: req.user?.email || "system",
      ipAddress,
    });

    return res.status(200).json({ success: true, data: updated });
  } catch (err) {
    next(err);
  }
}

/**
 * Soft deletes task record.
 */
export async function deleteTask(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const id = req.params.id as string;

    if (req.user?.role !== "SUPER_ADMIN" && req.user?.role !== "ADMIN" && req.user?.role !== "MANAGER") {
      return res.status(403).json({ success: false, message: "Forbidden. Admin or Manager role required." });
    }

    const task = await TaskRepository.findById(id!);
    // Execute soft deletion (flips isActive status or registers deletion timestamp)
    await TaskRepository.softDelete(id!, req.user?.email || "system");

    const ipAddress = req.ip || req.headers["x-forwarded-for"]?.toString() || undefined;

    await audit.taskDeleted(id!, task.title, {
      performedById: req.user?.id,
      performedBy: req.user?.email || "system",
      ipAddress,
    });

    return res.status(200).json({ success: true, message: "Task successfully deleted." });
  } catch (err) {
    next(err);
  }
}

/**
 * Appends interactive discussion comments to a task profile.
 */
export async function addTaskComment(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const id = req.params.id as string;
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({ success: false, message: "Comment content is required." });
    }

    // Persist new comment node
    const comment = await prisma.comment.create({
      data: {
        taskId: id!,
        authorId: req.user?.id || null,
        authorName: req.user?.email || "System",
        content,
      },
    });

    return res.status(201).json({ success: true, data: comment });
  } catch (err) {
    next(err);
  }
}

/**
 * Resolves unified task-level statistics from PostgreSQL.
 * Scopes counts to the active employee if role is EMPLOYEE.
 */
export async function getTasksStatistics(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const filters = {
      search: req.query.search?.toString() || undefined,
      status: (req.query.status as any) || undefined,
      priority: (req.query.priority as any) || undefined,
      assigneeId: req.query.assigneeId?.toString() || undefined,
      departmentId: req.query.departmentId?.toString() || undefined,
      teamId: req.query.teamId?.toString() || undefined,
      projectId: req.query.projectId?.toString() || undefined,
      isOverdue: req.query.isOverdue !== undefined ? req.query.isOverdue === "true" : undefined,
      startDate: req.query.startDate?.toString() || undefined,
      endDate: req.query.endDate?.toString() || undefined,
    };

    const stats = await TaskStatisticsService.getTaskMetrics(filters, req.user);
    return res.status(200).json({ success: true, data: stats });
  } catch (err) {
    next(err);
  }
}
