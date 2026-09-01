/**
 * =============================================================================
 * FRONTEND DASHBOARD SERVICE LAYER
 * Project: Employee Task Manager (Enterprise Edition)
 * Role: Dashboard Stats Axios API Client Proxy
 * 
 * Description:
 * Interfaces with backend `/dashboard/stats` telemetry aggregators. Contains
 * typing declarations for task previews, activity nodes, department ratios, and
 * compile counters returned by PostgreSQL.
 * =============================================================================
 */

import { apiGet } from "@/lib/axios";
import { ApiResponse } from "../types/response.types";
import { createApiResponseSuccess, createApiResponseError } from "@/utils/apiResponse";

// =============================================================================
// TYPE DEFINITIONS & SCHEMAS
// =============================================================================

/**
 * Task preview node for dashboard listing.
 */
export interface DashboardTask {
  id: string;
  title: string;
  priority: "LOW" | "MEDIUM" | "HIGH" | "ESCALATED";
  status: string;
  dueDate: string;
  createdAt: string;
  assigneeName: string | null;
  assigneeAvatar: string | null;
  departmentName: string | null;
  projectName: string | null;
}

/**
 * Activity log row item for live tickers.
 */
export interface DashboardActivity {
  id: string;
  type: string;
  title: string;
  description: string | null;
  actorName: string;
  actorAvatar: string | null;
  entityName: string | null;
  entityType: string | null;
  createdAt: string;
}

/**
 * Productivity breakdown stats for individual departments.
 */
export interface DepartmentBreakdown {
  id: string;
  name: string;
  employeeCount: number;
  taskCount: number;
  completedTaskCount: number;
  completionRate: number; // calculated percentage [0 - 100]
}

/**
 * Complete stats package returned by telemetry API.
 */
export interface DashboardStats {
  employees: {
    total: number;
    active: number;
    inactive: number;
  };
  departments: {
    total: number;
    breakdown: DepartmentBreakdown[];
  };
  teams: { total: number };
  projects: { total: number };
  tasks: {
    total: number;
    unassigned: number;
    assigned: number;
    inProgress: number;
    completed: number;
    overdue: number;
    archived: number;
    completedToday: number;
    completedThisWeek: number;
    completedThisMonth: number;
  };
  priorities: {
    low: number;
    medium: number;
    high: number;
    escalated: number;
  };
  analytics: {
    overallCompletionRate: number;
  };
  recentTasks: DashboardTask[];
  recentActivities: DashboardActivity[];
}

// =============================================================================
// API PROXY DISPATCHER
// =============================================================================

export class DashboardService {
  /** 
   * Fetches the complete aggregated dashboard stats object from PostgreSQL.
   */
  static async getFullStats(): Promise<ApiResponse<DashboardStats>> {
    try {
      const stats = await apiGet<DashboardStats>("/dashboard/stats");
      return createApiResponseSuccess(stats, "Dashboard stats loaded successfully");
    } catch (err: any) {
      return createApiResponseError(err.message || "Failed to load dashboard stats");
    }
  }

  /** 
   * Deprecated legacy proxy method. Use getFullStats() instead.
   * @deprecated Use getFullStats() instead 
   */
  static async getStats(): Promise<ApiResponse<any>> {
    return DashboardService.getFullStats();
  }
}
