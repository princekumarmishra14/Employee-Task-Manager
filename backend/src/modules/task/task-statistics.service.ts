/**
 * =============================================================================
 * CENTRALIZED TASK STATISTICS SERVICE
 * Project: Employee Task Manager (Enterprise Edition)
 * Role: Single Source of Truth for Task Operational Statistics
 * 
 * Description:
 * This service calculates task statistics and counts directly from the PostgreSQL
 * database using Prisma ORM client. It ensures that the Dashboard, Tasks Workspace,
 * Analytics, and Reports pages always display identical numbers.
 * =============================================================================
 */

import prisma from "@/lib/prisma";
import { Prisma, TaskStatus, TaskPriority } from "@prisma/client";

export class TaskStatisticsService {
  /**
   * Constructs the Prisma where constraint object dynamically based on parameters and active user.
   */
  static buildWhereClause(
    filters: {
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
    },
    user?: { id: string; role: string }
  ): Prisma.TaskWhereInput {
    const isEmployee = user?.role === "EMPLOYEE";
    const now = new Date();

    const where: Prisma.TaskWhereInput = {
      deletedAt: null,
      isActive: true,
      ...(filters.status && { status: filters.status }),
      ...(filters.priority && { priority: filters.priority }),
      ...(isEmployee ? { assigneeId: user?.id } : (filters.assigneeId && { assigneeId: filters.assigneeId })),
      ...(filters.departmentId && { departmentId: filters.departmentId }),
      ...(filters.teamId && { teamId: filters.teamId }),
      ...(filters.projectId && { projectId: filters.projectId }),
      // Overdue definition: Exceeded dueDate and status is neither COMPLETED nor ARCHIVED
      ...(filters.isOverdue && { dueDate: { lt: now }, status: { notIn: [TaskStatus.COMPLETED, TaskStatus.ARCHIVED] } }),
      // Support date range filtering on dueDate
      ...((filters.startDate || filters.endDate) && {
        dueDate: {
          ...(filters.startDate && { gte: new Date(filters.startDate) }),
          ...(filters.endDate && { lte: new Date(filters.endDate) }),
        },
      }),
      // Full-text case-insensitive filters on searchable fields (including description, tags, and assignee name/email)
      ...(filters.search && {
        OR: [
          { title: { contains: filters.search } },
          { description: { contains: filters.search } },
          { tags: { contains: filters.search } },
          {
            assignee: {
              employee: {
                fullName: { contains: filters.search },
              },
            },
          },
          {
            assignee: {
              email: { contains: filters.search },
            },
          },
        ],
      }),
    };

    return where;
  }

  /**
   * Helper to fetch total tasks matching scope.
   */
  static async getTotalTasks(whereClause: Prisma.TaskWhereInput) {
    return prisma.task.count({ where: whereClause });
  }

  /**
   * Helper to fetch completed tasks count.
   */
  static async getCompletedTasks(whereClause: Prisma.TaskWhereInput) {
    return prisma.task.count({
      where: {
        ...whereClause,
        status: TaskStatus.COMPLETED,
      },
    });
  }

  /**
   * Helper to fetch pending tasks count (Unassigned, Assigned, or In Progress).
   */
  static async getPendingTasks(whereClause: Prisma.TaskWhereInput) {
    return prisma.task.count({
      where: {
        ...whereClause,
        status: { in: [TaskStatus.UNASSIGNED, TaskStatus.ASSIGNED, TaskStatus.IN_PROGRESS] },
      },
    });
  }

  /**
   * Helper to fetch assigned tasks count (Assignee ID is present).
   */
  static async getAssignedTasks(whereClause: Prisma.TaskWhereInput) {
    return prisma.task.count({
      where: {
        ...whereClause,
        assigneeId: { not: null },
      },
    });
  }

  /**
   * Helper to fetch unassigned tasks count.
   */
  static async getUnassignedTasks(whereClause: Prisma.TaskWhereInput) {
    return prisma.task.count({
      where: {
        ...whereClause,
        assigneeId: null,
      },
    });
  }

  /**
   * Helper to fetch in progress tasks count.
   */
  static async getInProgressTasks(whereClause: Prisma.TaskWhereInput) {
    return prisma.task.count({
      where: {
        ...whereClause,
        status: TaskStatus.IN_PROGRESS,
      },
    });
  }

  /**
   * Helper to fetch overdue tasks count (due_date exceeded and not completed/archived).
   */
  static async getOverdueTasks(whereClause: Prisma.TaskWhereInput) {
    const now = new Date();
    return prisma.task.count({
      where: {
        ...whereClause,
        dueDate: { lt: now },
        status: { notIn: [TaskStatus.COMPLETED, TaskStatus.ARCHIVED] },
      },
    });
  }

  /**
   * Helper to fetch escalated tasks count.
   */
  static async getEscalatedTasks(whereClause: Prisma.TaskWhereInput) {
    return prisma.task.count({
      where: {
        ...whereClause,
        priority: TaskPriority.ESCALATED,
      },
    });
  }

  /**
   * Department task productivity stats (grouped by department).
   */
  static async getDepartmentStatistics() {
    const departments = await prisma.department.findMany({
      where: { isActive: true, deletedAt: null },
      select: {
        id: true,
        name: true,
        _count: {
          select: {
            users: { where: { isActive: true, deletedAt: null } },
            tasks: { where: { isActive: true, deletedAt: null } },
          },
        },
      },
      orderBy: { name: "asc" },
    });

    const deptTaskCounts = await prisma.task.groupBy({
      by: ["departmentId", "status"],
      where: { isActive: true, deletedAt: null, departmentId: { not: null } },
      _count: true,
    });

    const deptMap: Record<string, { total: number; completed: number }> = {};
    deptTaskCounts.forEach((row) => {
      const dId = row.departmentId!;
      if (!deptMap[dId]) deptMap[dId] = { total: 0, completed: 0 };
      deptMap[dId].total += row._count;
      if (row.status === TaskStatus.COMPLETED) {
        deptMap[dId].completed += row._count;
      }
    });

    const breakdown = departments.map((dept) => {
      const counts = deptMap[dept.id] ?? { total: 0, completed: 0 };
      return {
        id: dept.id,
        name: dept.name,
        employeeCount: dept._count.users,
        taskCount: counts.total,
        completedTaskCount: counts.completed,
        completionRate: counts.total > 0 ? Math.round((counts.completed / counts.total) * 100) : 0,
      };
    });

    return breakdown;
  }

  /**
   * Priority distribution.
   */
  static async getPriorityStatistics(whereClause: Prisma.TaskWhereInput) {
    const tasks = await prisma.task.findMany({
      where: whereClause,
      select: { priority: true },
    });

    const priorityCounts = { low: 0, medium: 0, high: 0, escalated: 0 };
    tasks.forEach((t) => {
      if (t.priority === TaskPriority.LOW) priorityCounts.low++;
      else if (t.priority === TaskPriority.MEDIUM) priorityCounts.medium++;
      else if (t.priority === TaskPriority.HIGH) priorityCounts.high++;
      else if (t.priority === TaskPriority.ESCALATED) priorityCounts.escalated++;
    });

    return priorityCounts;
  }

  /**
   * Employee productivity statistics (leaderboard).
   */
  static async getEmployeeStatistics() {
    const employees = await prisma.user.findMany({
      where: { deletedAt: null, isActive: true },
      select: {
        id: true,
        email: true,
        employee: {
          select: { fullName: true, avatarUrl: true, title: true },
        },
      },
    });

    const breakdown = await Promise.all(
      employees.map(async (emp) => {
        const [total, completed, overdue] = await Promise.all([
          prisma.task.count({ where: { deletedAt: null, isActive: true, assigneeId: emp.id } }),
          prisma.task.count({ where: { deletedAt: null, isActive: true, assigneeId: emp.id, status: TaskStatus.COMPLETED } }),
          prisma.task.count({
            where: {
              deletedAt: null,
              isActive: true,
              assigneeId: emp.id,
              dueDate: { lt: new Date() },
              status: { notIn: [TaskStatus.COMPLETED, TaskStatus.ARCHIVED] },
            },
          }),
        ]);

        return {
          id: emp.id,
          name: emp.employee?.fullName || emp.email,
          avatarUrl: emp.employee?.avatarUrl || null,
          title: emp.employee?.title || "Employee",
          total,
          completed,
          overdue,
          completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
        };
      })
    );

    return breakdown;
  }

  /**
   * Returns complete stats object required by the dashboard.
   */
  static async getDashboardStatistics(filters: any, user?: { id: string; role: string }) {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const baseWhere = this.buildWhereClause(filters, user);

    const [
      totalEmployees,
      activeEmployees,
      totalDepartments,
      totalTeams,
      totalProjects,
      tasks,
      overdueTasks,
      completedToday,
      completedThisWeek,
      completedThisMonth,
      recentTasksRaw,
      recentActivitiesRaw,
      departmentsBreakdown,
    ] = await Promise.all([
      prisma.user.count({ where: { deletedAt: null } }),
      prisma.user.count({ where: { deletedAt: null, isActive: true } }),
      prisma.department.count({ where: { isActive: true, deletedAt: null } }),
      prisma.team.count({ where: { isActive: true, deletedAt: null } }),
      prisma.project.count({ where: { isActive: true, deletedAt: null } }),
      prisma.task.findMany({
        where: baseWhere,
        select: { status: true, priority: true },
      }),
      prisma.task.count({
        where: {
          ...baseWhere,
          dueDate: { lt: now },
          status: { notIn: [TaskStatus.COMPLETED, TaskStatus.ARCHIVED] },
        },
      }),
      prisma.task.count({
        where: {
          ...baseWhere,
          status: TaskStatus.COMPLETED,
          completedAt: { gte: startOfToday },
        },
      }),
      prisma.task.count({
        where: {
          ...baseWhere,
          status: TaskStatus.COMPLETED,
          completedAt: { gte: startOfWeek },
        },
      }),
      prisma.task.count({
        where: {
          ...baseWhere,
          status: TaskStatus.COMPLETED,
          completedAt: { gte: startOfMonth },
        },
      }),
      // Fetch recent 8 tasks for overview
      prisma.task.findMany({
        where: baseWhere,
        orderBy: { createdAt: "desc" },
        take: 8,
        select: {
          id: true,
          title: true,
          priority: true,
          status: true,
          dueDate: true,
          createdAt: true,
          assignee: {
            select: {
              id: true,
              email: true,
              employee: { select: { fullName: true, avatarUrl: true } },
            },
          },
          department: { select: { id: true, name: true } },
          project: { select: { id: true, name: true } },
        },
      }),
      // Fetch recent activities
      prisma.activity.findMany({
        orderBy: { createdAt: "desc" },
        take: 15,
        select: {
          id: true,
          type: true,
          title: true,
          description: true,
          actorName: true,
          actorAvatar: true,
          entityName: true,
          entityType: true,
          createdAt: true,
        },
      }),
      this.getDepartmentStatistics(),
    ]);

    const statusCounts: Record<string, number> = {
      UNASSIGNED: 0,
      ASSIGNED: 0,
      IN_PROGRESS: 0,
      COMPLETED: 0,
      OVERDUE: 0,
      ARCHIVED: 0,
    };

    const priorityCounts: Record<string, number> = {
      LOW: 0,
      MEDIUM: 0,
      HIGH: 0,
      ESCALATED: 0,
    };

    tasks.forEach((t) => {
      if (statusCounts[t.status] !== undefined) statusCounts[t.status]++;
      if (priorityCounts[t.priority] !== undefined) priorityCounts[t.priority]++;
    });

    const totalTasksCount = tasks.length;
    const completedTasksCount = statusCounts["COMPLETED"] || 0;
    const overallCompletionRate = totalTasksCount > 0 ? Math.round((completedTasksCount / totalTasksCount) * 100) : 0;

    const recentTasksFormatted = recentTasksRaw.map((t) => ({
      id: t.id,
      title: t.title,
      priority: t.priority,
      status: t.status,
      dueDate: t.dueDate.toISOString(),
      createdAt: t.createdAt.toISOString(),
      assigneeName: t.assignee?.employee?.fullName ?? t.assignee?.email ?? null,
      assigneeAvatar: t.assignee?.employee?.avatarUrl ?? null,
      departmentName: t.department?.name ?? null,
      projectName: t.project?.name ?? null,
    }));

    const recentActivitiesFormatted = recentActivitiesRaw.map((a) => ({
      id: a.id,
      type: a.type,
      title: a.title,
      description: a.description,
      actorName: a.actorName,
      actorAvatar: a.actorAvatar,
      entityName: a.entityName,
      entityType: a.entityType,
      createdAt: a.createdAt.toISOString(),
    }));

    return {
      employees: {
        total: totalEmployees,
        active: activeEmployees,
        inactive: totalEmployees - activeEmployees,
      },
      departments: {
        total: totalDepartments,
        breakdown: departmentsBreakdown,
      },
      teams: { total: totalTeams },
      projects: { total: totalProjects },
      tasks: {
        total: totalTasksCount,
        unassigned: statusCounts["UNASSIGNED"] || 0,
        assigned: totalTasksCount - (statusCounts["UNASSIGNED"] || 0),
        inProgress: statusCounts["IN_PROGRESS"] || 0,
        completed: completedTasksCount,
        overdue: overdueTasks,
        archived: statusCounts["ARCHIVED"] || 0,
        completedToday,
        completedThisWeek,
        completedThisMonth,
      },
      priorities: {
        low: priorityCounts["LOW"] || 0,
        medium: priorityCounts["MEDIUM"] || 0,
        high: priorityCounts["HIGH"] || 0,
        escalated: priorityCounts["ESCALATED"] || 0,
      },
      analytics: {
        overallCompletionRate,
      },
      recentTasks: recentTasksFormatted,
      recentActivities: recentActivitiesFormatted,
    };
  }

  /**
   * Generates task metrics for statistics page.
   */
  static async getTaskMetrics(filters: any, user?: { id: string; role: string }) {
    const baseWhere = this.buildWhereClause(filters, user);

    const [
      total,
      completed,
      assigned,
      unassigned,
      inProgress,
      overdue,
      escalated,
      priorities
    ] = await Promise.all([
      this.getTotalTasks(baseWhere),
      this.getCompletedTasks(baseWhere),
      this.getAssignedTasks(baseWhere),
      this.getUnassignedTasks(baseWhere),
      this.getInProgressTasks(baseWhere),
      this.getOverdueTasks(baseWhere),
      this.getEscalatedTasks(baseWhere),
      this.getPriorityStatistics(baseWhere)
    ]);

    return {
      total,
      completed,
      assigned,
      unassigned,
      inProgress,
      overdue,
      escalated,
      priorities
    };
  }
}
