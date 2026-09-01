/**
 * =============================================================================
 * TASK DATA ACCESS LAYER (REPOSITORY)
 * Project: Employee Task Manager (Enterprise Edition)
 * Role: Prisma Query Builder / Task Relational Data Store
 * 
 * Description:
 * Serves as the exclusive interface executing SQL queries via Prisma Client for the
 * `tasks` schema table. Encapsulates pagination math, search text filtering, overdue thresholds,
 * nested relations (assignee, department, projects), status transition automation (completedAt logs),
 * and aggregate counter math.
 * =============================================================================
 */

import prisma from "@/lib/prisma";
import { Prisma, TaskStatus, TaskPriority } from "@prisma/client";
import { parsePaginationParams, buildPaginationResult, PaginationResult } from "@/lib/pagination";
import { NotFoundError } from "@/lib/errors";
import { TaskStatisticsService } from "./task-statistics.service";

/**
 * Valid search and constraint fields passed from controller handlers.
 */
export interface TaskFilters {
  search?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  assigneeId?: string;
  departmentId?: string;
  teamId?: string;
  projectId?: string;
  isOverdue?: boolean;
  startDate?: string;
  endDate?: string;
}

// Strict selection fields mapped to frontend models to optimize memory and exclude password hashes.
const TASK_SELECT = {
  id: true,
  title: true,
  description: true,
  priority: true,
  status: true,
  dueDate: true,
  startDate: true,
  completedAt: true,
  estimatedHours: true,
  tags: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
  createdBy: true,
  assigneeId: true,
  departmentId: true,
  teamId: true,
  projectId: true,
  assignee: {
    select: {
      id: true,
      email: true,
      employee: {
        select: { fullName: true, avatarUrl: true, employeeCode: true, title: true },
      },
    },
  },
  department: { select: { id: true, name: true } },
  team: { select: { id: true, name: true } },
  project: { select: { id: true, name: true } },
} as const;

export class TaskRepository {
  /**
   * Performs dynamic query building for tasks search.
   * Leverages Prisma transactions to fetch data and count records in a single round-trip.
   */
  static async findMany(
    filters: TaskFilters,
    searchParams: URLSearchParams,
    user?: { id: string; role: string }
  ): Promise<PaginationResult<Record<string, unknown>>> {
    const { skip, take, page, pageSize } = parsePaginationParams(searchParams);

    // Construct the Prisma where constraint object dynamically using the centralized stats service
    const where = TaskStatisticsService.buildWhereClause(filters, user);

    const isUnpaginated = searchParams.get("unpaginated") === "true";

    // Parallel promise resolution to calculate pagination count
    const [data, total] = await prisma.$transaction([
      prisma.task.findMany({
        where,
        select: TASK_SELECT,
        orderBy: [{ createdAt: "desc" }],
        ...(!isUnpaginated && { skip, take }),
      }),
      prisma.task.count({ where }),
    ]);

    const finalPageSize = isUnpaginated ? total || 1 : pageSize;
    const finalPage = isUnpaginated ? 1 : page;

    return buildPaginationResult(data as unknown as { id: string }[], total, finalPage, finalPageSize);
  }

  /**
   * Retrieves single task by unique identifier alongside complete comment thread.
   */
  static async findById(id: string) {
    const task = await prisma.task.findFirst({
      where: { id, deletedAt: null },
      select: {
        ...TASK_SELECT,
        comments: {
          orderBy: { createdAt: "desc" },
          select: { id: true, content: true, authorName: true, authorId: true, createdAt: true },
        },
      },
    });
    if (!task) throw new NotFoundError("Task", id);
    return task;
  }

  /**
   * Persists a new task entry in Postgres database.
   */
  static async create(data: {
    title: string;
    description: string;
    status: TaskStatus;
    priority: TaskPriority;
    dueDate: Date;
    startDate?: Date;
    estimatedHours?: number | null;
    tags?: string;
    assigneeId?: string | null;
    departmentId?: string | null;
    teamId?: string | null;
    projectId?: string | null;
    createdBy: string;
  }) {
    return prisma.task.create({
      data: {
        title: data.title.trim(),
        description: data.description.trim(),
        status: data.status,
        priority: data.priority,
        dueDate: data.dueDate,
        startDate: data.startDate ?? new Date(),
        estimatedHours: data.estimatedHours ?? null,
        tags: data.tags ?? null,
        assigneeId: data.assigneeId || null,
        departmentId: data.departmentId || null,
        teamId: data.teamId || null,
        projectId: data.projectId || null,
        isActive: true,
        createdBy: data.createdBy,
        updatedBy: data.createdBy,
      },
      select: TASK_SELECT,
    });
  }

  /**
   * Updates an existing task by ID with changed values.
   */
  static async update(id: string, data: {
    title?: string;
    description?: string;
    status?: TaskStatus;
    priority?: TaskPriority;
    dueDate?: Date;
    estimatedHours?: number | null;
    tags?: string;
    assigneeId?: string | null;
    departmentId?: string | null;
    teamId?: string | null;
    projectId?: string | null;
    updatedBy: string;
  }) {
    await this.findById(id); // Throws exception if record is missing or soft-deleted

    const { updatedBy, ...fields } = data;

    // Automated state hook: register current date if state is transition to completed
    const completedAt = fields.status === "COMPLETED" ? new Date() : undefined;

    return prisma.task.update({
      where: { id },
      data: {
        ...fields,
        ...(completedAt && { completedAt }),
        updatedBy,
        updatedAt: new Date(),
      },
      select: TASK_SELECT,
    });
  }

  /**
   * Applies a soft delete to keep historical logs.
   */
  static async softDelete(id: string, deletedBy: string) {
    await this.findById(id);
    return prisma.task.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        isActive: false,
        updatedBy: deletedBy,
      },
    });
  }

  /**
   * Gathers analytical counts of tasks status/priority buckets for dashboard cards.
   */
  static async getStats() {
    const now = new Date();
    const [total, tasks, overdue] = await prisma.$transaction([
      prisma.task.count({ where: { deletedAt: null, isActive: true } }),
      prisma.task.findMany({
        where: { deletedAt: null, isActive: true },
        select: { status: true, priority: true },
      }),
      prisma.task.count({
        where: {
          deletedAt: null,
          isActive: true,
          dueDate: { lt: now },
          status: { notIn: ["COMPLETED", "ARCHIVED"] },
        },
      }),
    ]);

    const statusCounts: Record<string, number> = {};
    const priorityCounts: Record<string, number> = {};

    // Group items in memory to minimize SQL query complexity overheads
    tasks.forEach((t) => {
      statusCounts[t.status] = (statusCounts[t.status] || 0) + 1;
      priorityCounts[t.priority] = (priorityCounts[t.priority] || 0) + 1;
    });

    const byStatus = Object.entries(statusCounts).map(([status, count]) => ({
      status: status as any,
      _count: count,
    }));

    const byPriority = Object.entries(priorityCounts).map(([priority, count]) => ({
      priority: priority as any,
      _count: count,
    }));

    return { total, byStatus, byPriority, overdue };
  }
}
