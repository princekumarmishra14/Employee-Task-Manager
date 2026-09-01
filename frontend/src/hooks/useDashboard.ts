/**
 * frontend/src/hooks/useDashboard.ts
 * Enterprise dashboard data hook — fetches all stats from PostgreSQL via REST API.
 * Auto-refreshes every 30 seconds. Exposes a manual refresh trigger.
 */

import { useState, useEffect, useCallback, useMemo } from "react";
import { useDBStore } from "@/store/dbStore";
import { DashboardStats, DepartmentBreakdown } from "@/services/dashboard.service";

const REFRESH_INTERVAL_MS = 30_000; // 30 seconds

export interface UseDashboardReturn {
  stats: DashboardStats | null;
  isLoading: boolean;
  error: string | null;
  refresh: () => void;
  lastUpdated: Date | null;
}

export function useDashboard(): UseDashboardReturn {
  const { tasks, employees, departments, teams, projects, auditLogs, syncOperationalData } = useDBStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      await syncOperationalData();
      setLastUpdated(new Date());
    } catch (err: any) {
      setError(err.message || "Failed to load dashboard data");
    } finally {
      setIsLoading(false);
    }
  }, [syncOperationalData]);

  // Initial trigger to load Operational Data if empty
  useEffect(() => {
    if (tasks.length === 0) {
      refresh();
    }
  }, [tasks.length, refresh]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      syncOperationalData().catch(() => { });
    }, REFRESH_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [syncOperationalData]);

  // Derive stats dynamically from Zustand collections (Single Source of Truth)
  const stats = useMemo<DashboardStats | null>(() => {
    if (employees.length === 0 && tasks.length === 0) {
      return null;
    }

    const empTotal = employees.length;
    const empActive = employees.filter(e => e.isActive).length;
    const empInactive = empTotal - empActive;

    const activeTasks = tasks.filter(t => !t.isDeleted);

    const statusCounts = {
      unassigned: activeTasks.filter(t => !t.assignedTo).length,
      assigned: activeTasks.filter(t => t.assignedTo).length,
      inProgress: activeTasks.filter(t => t.status === "IN_PROGRESS").length,
      completed: activeTasks.filter(t => t.status === "COMPLETED").length,
      overdue: activeTasks.filter(t => new Date(t.dueDate).getTime() < Date.now() && t.status !== "COMPLETED" && t.status !== "ARCHIVED").length,
      archived: activeTasks.filter(t => t.status === "ARCHIVED").length,
    };

    const priorities = {
      low: activeTasks.filter(t => t.priority === "LOW").length,
      medium: activeTasks.filter(t => t.priority === "MEDIUM").length,
      high: activeTasks.filter(t => t.priority === "HIGH").length,
      escalated: activeTasks.filter(t => t.priority === "ESCALATED").length,
    };

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const completedToday = activeTasks.filter(t => t.status === "COMPLETED" && new Date(t.updatedAt) >= startOfToday).length;
    const completedThisWeek = activeTasks.filter(t => t.status === "COMPLETED" && new Date(t.updatedAt) >= startOfWeek).length;
    const completedThisMonth = activeTasks.filter(t => t.status === "COMPLETED" && new Date(t.updatedAt) >= startOfMonth).length;

    const overallCompletionRate = activeTasks.length > 0 ? Math.round((statusCounts.completed / activeTasks.length) * 100) : 0;

    const recentTasks = activeTasks.slice(0, 8).map(t => ({
      id: t.id,
      title: t.title,
      priority: t.priority,
      status: t.status,
      dueDate: t.dueDate,
      createdAt: t.createdAt,
      assigneeName: t.assignedTo?.name || null,
      assigneeAvatar: t.assignedTo?.avatarUrl || null,
      departmentName: departments.find(d => d.id === t.department)?.name || null,
      projectName: projects.find(p => p.id === t.projectId)?.name || null,
    }));

    // Map recentActivities from auditLogs in Zustand
    const recentActivities = auditLogs.slice(0, 15).map(a => ({
      id: a.id,
      type: a.action,
      title: a.action,
      description: a.details,
      actorName: a.performedBy,
      actorAvatar: null,
      entityName: a.entityId,
      entityType: a.entity,
      createdAt: a.createdAt,
    }));

    // Department breakdowns
    const deptMap: Record<string, { total: number; completed: number }> = {};
    activeTasks.filter(t => t.department).forEach(t => {
      const dId = t.department!;
      if (!deptMap[dId]) deptMap[dId] = { total: 0, completed: 0 };
      deptMap[dId].total++;
      if (t.status === "COMPLETED") {
        deptMap[dId].completed++;
      }
    });

    const breakdown: DepartmentBreakdown[] = departments.map(dept => {
      const counts = deptMap[dept.id] ?? { total: 0, completed: 0 };
      const employeeCount = employees.filter(e => e.departmentId === dept.id && e.isActive).length;
      return {
        id: dept.id,
        name: dept.name,
        employeeCount,
        taskCount: counts.total,
        completedTaskCount: counts.completed,
        completionRate: counts.total > 0 ? Math.round((counts.completed / counts.total) * 100) : 0,
      };
    });

    return {
      employees: {
        total: empTotal,
        active: empActive,
        inactive: empInactive,
      },
      departments: {
        total: departments.length,
        breakdown,
      },
      teams: { total: teams.length },
      projects: { total: projects.length },
      tasks: {
        total: activeTasks.length,
        unassigned: statusCounts.unassigned,
        assigned: statusCounts.assigned,
        inProgress: statusCounts.inProgress,
        completed: statusCounts.completed,
        overdue: statusCounts.overdue,
        archived: statusCounts.archived,
        completedToday,
        completedThisWeek,
        completedThisMonth,
      },
      priorities,
      analytics: {
        overallCompletionRate,
      },
      recentTasks,
      recentActivities,
    };
  }, [tasks, employees, departments, teams, projects, auditLogs]);

  return { stats, isLoading, error, refresh, lastUpdated };
}
