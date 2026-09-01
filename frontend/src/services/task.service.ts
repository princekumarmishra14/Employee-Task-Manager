/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * =============================================================================
 * FRONTEND TASK SERVICE LAYER
 * Project: Employee Task Manager (Enterprise Edition)
 * Role: Axios API Proxy Service for Tasks
 * 
 * Description:
 * Aggregates client-side operations targeting backend `/tasks` REST endpoints.
 * Provides schema validation (via Zod), payload structure transformation mappings
 * (`mapBackendTaskToFrontend`), multilanguage locale error decoding, and standard Response envelopes.
 * =============================================================================
 */

import { Task, TaskStatus, TaskPriority } from "../types/task.types";
import { apiGet, apiPost, apiPatch, apiDelete } from "@/lib/axios";
import { ApiResponse } from "../types/response.types";
import { taskValidationSchema } from "@/validators/task.schema";
import { createApiResponseSuccess, createApiResponseError } from "@/utils/apiResponse";
import { TaskErrorHandler } from "./taskErrorHandler";
import { useDBStore } from "@/store/dbStore";

/**
 * Transforms raw database/API entities into clean TypeScript schemas matching frontend controls.
 * Normalizes user avatar URLs, tags formats (splits CSV string to array), and overdue statuses.
 */
function mapBackendTaskToFrontend(task: any): Task & { comments?: any[] } {
  return {
    id: task.id,
    title: task.title,
    description: task.description || "",
    status: task.status as TaskStatus,
    priority: task.priority as TaskPriority,
    dueDate: task.dueDate,
    createdAt: task.createdAt,
    updatedAt: task.updatedAt,
    assignedTo: task.assignee
      ? {
          id: task.assignee.id,
          name: task.assignee.employee?.fullName || task.assignee.email,
          email: task.assignee.email,
          avatarUrl: task.assignee.employee?.avatarUrl || null,
        }
      : null,
    department: task.departmentId || null,
    team: task.teamId || null,
    estimatedHours: task.estimatedHours || null,
    tags: typeof task.tags === "string" ? task.tags.split(",").filter(Boolean) : (Array.isArray(task.tags) ? task.tags : []),
    isOverdue: new Date(task.dueDate).getTime() < Date.now() && task.status !== "COMPLETED",
    isDeleted: !task.isActive,
    comments: task.comments || [],
  };
}

export class TaskService {
  /**
   * Resolves the active user locale (e.g. English 'en' or Arabic 'ar') from Zustand state.
   */
  private static getLocale(): "en" | "ar" {
    const store = useDBStore.getState();
    return store.currentLanguage || "en";
  }

  /**
   * Fetch paginated and filtered tasks from REST backend.
   */
  static async getTasks(filters?: Record<string, string>): Promise<ApiResponse<Task[]>> {
    try {
      const query = filters ? `?${new URLSearchParams(filters).toString()}` : "";
      const data = await apiGet<any[]>(`/tasks${query}`);
      const list = data.map(mapBackendTaskToFrontend);
      return createApiResponseSuccess(list, "Tasks loaded successfully");
    } catch (err) {
      const locale = this.getLocale();
      const readable = TaskErrorHandler.getReadableMessage(err, locale);
      return createApiResponseError(readable);
    }
  }

  /**
   * Fetch task-specific statistics from backend.
   */
  static async getTaskStatistics(filters?: Record<string, string>): Promise<ApiResponse<any>> {
    try {
      const query = filters ? `?${new URLSearchParams(filters).toString()}` : "";
      const data = await apiGet<any>(`/tasks/statistics${query}`);
      return createApiResponseSuccess(data, "Task statistics loaded successfully");
    } catch (err) {
      const locale = this.getLocale();
      const readable = TaskErrorHandler.getReadableMessage(err, locale);
      return createApiResponseError(readable);
    }
  }

  /**
   * Fetch single task metadata alongside comments lists.
   */
  static async getTaskById(id: string): Promise<ApiResponse<Task & { comments?: any[] }>> {
    try {
      const data = await apiGet<any>(`/tasks/${id}`);
      const task = mapBackendTaskToFrontend(data);
      return createApiResponseSuccess(task, "Task loaded successfully");
    } catch (err) {
      const locale = this.getLocale();
      const readable = TaskErrorHandler.getReadableMessage(err, locale);
      return createApiResponseError(readable);
    }
  }

  /**
   * Appends comment logs to task thread.
   */
  static async addComment(id: string, content: string): Promise<ApiResponse<any>> {
    try {
      const data = await apiPost<any>(`/tasks/${id}/comments`, { content });
      return createApiResponseSuccess(data, "Comment posted successfully");
    } catch (err) {
      const locale = this.getLocale();
      const readable = TaskErrorHandler.getReadableMessage(err, locale);
      return createApiResponseError(readable);
    }
  }

  /**
   * Validates form body with Zod and issues POST payload to backend.
   */
  static async createTask(formData: any): Promise<ApiResponse<Task>> {
    try {
      // Validate schema structures prior to execution
      const validation = taskValidationSchema.safeParse(formData);
      if (!validation.success) {
        throw new Error(validation.error.issues[0]?.message || "Validation failed.");
      }
      const validatedData = validation.data;

      const data = await apiPost<any>("/tasks", {
        title: validatedData.title,
        description: validatedData.description,
        status: validatedData.status,
        priority: validatedData.priority,
        dueDate: validatedData.dueDate,
        startDate: formData.startDate || new Date().toISOString(),
        assigneeId: validatedData.assigneeId || null,
        departmentId: formData.departmentId || null,
        teamId: formData.teamId || null,
        projectId: formData.projectId || null,
        estimatedHours: validatedData.estimatedHours || null,
        tags: validatedData.tags ? validatedData.tags.join(",") : null,
      });

      const newTask = mapBackendTaskToFrontend(data);
      await useDBStore.getState().syncOperationalData();
      return createApiResponseSuccess(newTask, "Task created successfully");
    } catch (err) {
      const locale = this.getLocale();
      const readable = TaskErrorHandler.getReadableMessage(err, locale);
      return createApiResponseError(readable);
    }
  }

  /**
   * Partially updates task state on backend.
   */
  static async updateTask(id: string, updates: Partial<any>): Promise<ApiResponse<Task>> {
    try {
      const validation = taskValidationSchema.partial().safeParse(updates);
      if (!validation.success) {
        throw new Error(validation.error.issues[0]?.message || "Validation failed.");
      }
      const validatedUpdates = validation.data;

      const body: any = {
        ...(validatedUpdates.title !== undefined && { title: validatedUpdates.title }),
        ...(validatedUpdates.description !== undefined && { description: validatedUpdates.description }),
        ...(validatedUpdates.status !== undefined && { status: validatedUpdates.status }),
        ...(validatedUpdates.priority !== undefined && { priority: validatedUpdates.priority }),
        ...(validatedUpdates.dueDate !== undefined && { dueDate: validatedUpdates.dueDate }),
        ...(updates.assigneeId !== undefined && { assigneeId: updates.assigneeId }),
        ...(updates.departmentId !== undefined && { departmentId: updates.departmentId }),
        ...(updates.teamId !== undefined && { teamId: updates.teamId }),
        ...(validatedUpdates.estimatedHours !== undefined && { estimatedHours: validatedUpdates.estimatedHours }),
        ...(validatedUpdates.tags !== undefined && { tags: validatedUpdates.tags ? validatedUpdates.tags.join(",") : null }),
      };

      const data = await apiPatch<any>(`/tasks/${id}`, body);
      const updated = mapBackendTaskToFrontend(data);
      await useDBStore.getState().syncOperationalData();
      return createApiResponseSuccess(updated, "Task updated successfully");
    } catch (err) {
      const locale = this.getLocale();
      const readable = TaskErrorHandler.getReadableMessage(err, locale);
      return createApiResponseError(readable);
    }
  }

  /**
   * Sends DELETE request to remove/archive target task.
   */
  static async deleteTask(id: string): Promise<ApiResponse<boolean>> {
    try {
      await apiDelete<any>(`/tasks/${id}`);
      await useDBStore.getState().syncOperationalData();
      return createApiResponseSuccess(true, "Task deleted successfully");
    } catch (err) {
      const locale = this.getLocale();
      const readable = TaskErrorHandler.getReadableMessage(err, locale);
      return createApiResponseError(readable);
    }
  }
}
