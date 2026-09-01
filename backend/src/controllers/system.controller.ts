/**
 * =============================================================================
 * SYSTEM-WIDE METADATA & TELEMETRY CONTROLLER
 * Project: Employee Task Manager (Enterprise Edition)
 * Role: Lookup Metadata & Analytical Stats Generator
 * 
 * Description:
 * Aggregates metadata lookups (departments, teams, projects), formats global audit feeds,
 * and compiles complex real-time dashboard stats. Runs concurrent data reads
 * inside single transactions to optimize PostgreSQL lookup round-trips.
 * =============================================================================
 */

import { Request, Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../middlewares/auth.middleware";
import prisma from "../lib/prisma";
import { TaskStatisticsService } from "../modules/task/task-statistics.service";
import { parsePaginationParams, buildPaginationResult } from "../lib/pagination";
import { AuditAction, AuditEntity } from "@prisma/client";

/**
 * Returns a list of active system departments.
 */
export async function getDepartments(req: Request, res: Response, next: NextFunction) {
  try {
    const departments = await prisma.department.findMany({
      where: { deletedAt: null, isActive: true },
      orderBy: { name: "asc" },
    });
    return res.status(200).json({ success: true, data: departments });
  } catch (err) {
    next(err);
  }
}

/**
 * Returns a list of active system teams alongside parent department.
 */
export async function getTeams(req: Request, res: Response, next: NextFunction) {
  try {
    const teams = await prisma.team.findMany({
      where: { deletedAt: null, isActive: true },
      include: { department: { select: { id: true, name: true } } },
      orderBy: { name: "asc" },
    });
    return res.status(200).json({ success: true, data: teams });
  } catch (err) {
    next(err);
  }
}

/**
 * Returns active corporate projects.
 */
export async function getProjects(req: Request, res: Response, next: NextFunction) {
  try {
    const projects = await prisma.project.findMany({
      where: { deletedAt: null, isActive: true },
      include: {
        department: { select: { id: true, name: true } },
        team: { select: { id: true, name: true } }
      },
      orderBy: { name: "asc" },
    });
    return res.status(200).json({ success: true, data: projects });
  } catch (err) {
    next(err);
  }
}

/**
 * Feeds recent activities for live dashboard tickers (e.g. log items, creation notifications).
 */
export async function getActivities(req: Request, res: Response, next: NextFunction) {
  try {
    const limit = Math.min(parseInt(req.query.limit?.toString() ?? "20", 10) || 20, 100);
    const activities = await prisma.activity.findMany({
      orderBy: { createdAt: "desc" },
      take: limit,
    });
    return res.status(200).json({ success: true, data: activities });
  } catch (err) {
    next(err);
  }
}

/**
 * Retrieves security and compliance audit logs.
 * Supports filters (action, performedBy, date boundaries) and uses transactional pagination.
 */
export async function getAuditLogs(req: Request, res: Response, next: NextFunction) {
  try {
    const searchParams = new URLSearchParams();
    Object.entries(req.query).forEach(([key, val]) => {
      if (val) searchParams.set(key, val.toString());
    });

    const { skip, take, page, pageSize } = parsePaginationParams(searchParams);

    const where: any = {
      ...(req.query.action && { action: req.query.action as AuditAction }),
      ...(req.query.entity && { entity: req.query.entity as AuditEntity }),
      ...(req.query.entityId && { entityId: req.query.entityId.toString() }),
      ...(req.query.performedBy && {
        performedBy: { contains: req.query.performedBy.toString() },
      }),
      ...(req.query.from && { createdAt: { gte: new Date(req.query.from.toString()) } }),
      ...(req.query.to && { createdAt: { lte: new Date(req.query.to.toString()) } }),
    };

    // Parallel db request via transaction to return logs and total count matching filter
    const [data, total] = await prisma.$transaction([
      prisma.auditLog.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take,
      }),
      prisma.auditLog.count({ where }),
    ]);

    const paginationResult = buildPaginationResult(data as any[], total, page, pageSize);

    return res.status(200).json({
      success: true,
      data,
      meta: paginationResult.meta,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Aggregates database stats, metrics, progress counters, and department completion trends.
 * 
 * Flowchart for getDashboardStats:
 * [1. Date Window Calculations] -> Compute start limits (Today, Week, Month)
 *                                         |
 *                                         v
 * [2. Transactional Queries] -> Run 15 concurrent count and list queries in PostgreSQL
 *                                         |
 *                                         v
 * [3. Aggregate Maps Compilation] -> Format status counts and priorities from query arrays
 *                                         |
 *                                         v
 * [4. Department Metric Calculations] -> Run SQL groupBy to calculate completion percentage per dept
 *                                         |
 *                                         v
 * [5. Response Serialization] -> Pack telemetry object (recentTasks, activities, KPIs) and return
 */
export async function getDashboardStats(req: AuthenticatedRequest, res: Response, next: NextFunction) {
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

    const stats = await TaskStatisticsService.getDashboardStatistics(filters, req.user);
    return res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Creates a new department in PostgreSQL.
 */
export async function createDepartment(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const { name, description } = req.body;
    if (!name) {
      return res.status(400).json({ success: false, message: "Department name is required." });
    }
    const existing = await prisma.department.findUnique({ where: { name } });
    if (existing) {
      return res.status(409).json({ success: false, message: `Department '${name}' already exists.` });
    }
    const dept = await prisma.department.create({
      data: {
        name,
        description,
        createdBy: req.user?.email || "system",
        updatedBy: req.user?.email || "system",
      }
    });
    return res.status(201).json({ success: true, data: dept });
  } catch (err) {
    next(err);
  }
}

/**
 * Updates an existing department's name and/or description in PostgreSQL.
 */
export async function updateDepartment(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const id = req.params.id as string;

    // Validate UUID format before hitting the DB
    const uuidRx = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRx.test(id)) {
      return res.status(404).json({ success: false, message: `Department '${id}' not found.` });
    }

    const { name, description, isActive } = req.body;

    if (name) {
      const conflict = await prisma.department.findFirst({
        where: { name, NOT: { id }, deletedAt: null },
      });
      if (conflict) {
        return res.status(409).json({ success: false, message: `Department name '${name}' is already in use.` });
      }
    }

    // Verify the department exists first
    const existing = await prisma.department.findFirst({ where: { id, deletedAt: null } });
    if (!existing) {
      return res.status(404).json({ success: false, message: `Department '${id}' not found.` });
    }

    const dept = await prisma.department.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description }),
        ...(isActive !== undefined && { isActive }),
        updatedBy: req.user?.email || "system",
      },
    });
    return res.status(200).json({ success: true, data: dept });
  } catch (err: any) {
    if (err?.code === "P2025") {
      return res.status(404).json({ success: false, message: "Department not found." });
    }
    next(err);
  }
}

/**
 * Soft-deletes a department in PostgreSQL (sets deletedAt + isActive=false).
 */
export async function deleteDepartment(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const id = req.params.id as string;

    // Validate UUID format
    const uuidRx = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRx.test(id)) {
      console.log(`[DELETE DEPT] Failed regex test for id: ${id}`);
      return res.status(404).json({ success: false, message: `Department '${id}' not found.` });
    }

    // Verify it exists before soft-deleting
    console.log(`[DELETE DEPT] Checking existence of id: ${id}`);
    const existing = await prisma.department.findFirst({ where: { id, deletedAt: null } });
    if (!existing) {
      console.log(`[DELETE DEPT] findFirst returned null for id: ${id}`);
      return res.status(404).json({ success: false, message: `Department '${id}' not found or already deleted.` });
    }
    console.log(`[DELETE DEPT] findFirst succeeded:`, existing.name);

    const dept = await prisma.department.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        isActive: false,
        updatedBy: req.user?.email || "system",
      },
    });
    console.log(`[DELETE DEPT] Prisma update succeeded for id: ${id}`);
    return res.status(200).json({ success: true, message: "Department deleted successfully.", data: dept });
  } catch (err: any) {
    console.error(`[DELETE DEPT] Error caught:`, err);
    if (err?.code === "P2025") {
      return res.status(404).json({ success: false, message: "Department not found." });
    }
    next(err);
  }
}

/**
 * Creates a new team in PostgreSQL.
 */
export async function createTeam(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const { name, departmentId, description } = req.body;
    if (!name || !departmentId) {
      return res.status(400).json({ success: false, message: "Team name and departmentId are required." });
    }
    const existing = await prisma.team.findFirst({
      where: { name, departmentId, deletedAt: null }
    });
    if (existing) {
      return res.status(409).json({ success: false, message: `Team '${name}' already exists under this department.` });
    }
    const team = await prisma.team.create({
      data: {
        name,
        departmentId,
        description,
        createdBy: req.user?.email || "system",
        updatedBy: req.user?.email || "system",
      },
      include: { department: { select: { id: true, name: true } } }
    });
    return res.status(201).json({ success: true, data: team });
  } catch (err) {
    next(err);
  }
}

/**
 * Creates a new project in PostgreSQL.
 */
export async function createProject(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const { name, description, departmentId, teamId } = req.body;
    if (!name) {
      return res.status(400).json({ success: false, message: "Project name is required." });
    }
    const project = await prisma.project.create({
      data: {
        name,
        description,
        departmentId: departmentId || null,
        teamId: teamId || null,
        createdBy: req.user?.email || "system",
        updatedBy: req.user?.email || "system",
      },
      include: {
        department: { select: { id: true, name: true } },
        team: { select: { id: true, name: true } }
      }
    });
    return res.status(201).json({ success: true, data: project });
  } catch (err) {
    next(err);
  }
}

/**
 * Updates an existing team in PostgreSQL.
 */
export async function updateTeam(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const id = req.params.id as string;
    const { name, departmentId, description, isActive } = req.body;
    
    const team = await prisma.team.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(departmentId !== undefined && { departmentId }),
        ...(description !== undefined && { description }),
        ...(isActive !== undefined && { isActive }),
        updatedBy: req.user?.email || "system",
      },
      include: { department: { select: { id: true, name: true } } }
    });
    return res.status(200).json({ success: true, data: team });
  } catch (err) {
    next(err);
  }
}

/**
 * Soft deletes a team in PostgreSQL.
 */
export async function deleteTeam(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const id = req.params.id as string;
    const team = await prisma.team.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        isActive: false,
        updatedBy: req.user?.email || "system",
      }
    });
    return res.status(200).json({ success: true, message: "Team deleted successfully", data: team });
  } catch (err) {
    next(err);
  }
}

/**
 * Updates an existing project in PostgreSQL.
 */
export async function updateProject(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const id = req.params.id as string;
    const { name, description, departmentId, teamId, isActive } = req.body;
    
    const project = await prisma.project.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description }),
        ...(departmentId !== undefined && { departmentId: departmentId || null }),
        ...(teamId !== undefined && { teamId: teamId || null }),
        ...(isActive !== undefined && { isActive }),
        updatedBy: req.user?.email || "system",
      },
      include: {
        department: { select: { id: true, name: true } },
        team: { select: { id: true, name: true } }
      }
    });
    return res.status(200).json({ success: true, data: project });
  } catch (err) {
    next(err);
  }
}

/**
 * Soft deletes a project in PostgreSQL.
 */
export async function deleteProject(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const id = req.params.id as string;
    const project = await prisma.project.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        isActive: false,
        updatedBy: req.user?.email || "system",
      }
    });
    return res.status(200).json({ success: true, message: "Project deleted successfully", data: project });
  } catch (err) {
    next(err);
  }
}


