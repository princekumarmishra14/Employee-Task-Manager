/**
 * src/lib/activity.ts
 * Reusable Activity Feed service.
 * Writes to the `activities` table for real-time dashboard feeds.
 * Unlike AuditLog, activities have human-readable titles for display.
 */

import prisma from "@/lib/prisma";
import { ActivityType } from "@prisma/client";

export interface ActivityContext {
  actorId?: string;
  actorName: string;
  actorAvatar?: string | null;
}

export interface ActivityPayload {
  type: ActivityType;
  title: string;
  description?: string;
  entityId?: string;
  entityType?: string;
  entityName?: string;
  taskId?: string;
  metadata?: object;
}

/**
 * Write an activity feed entry. Silently swallowed on failure.
 */
export async function writeActivity(
  payload: ActivityPayload,
  ctx: ActivityContext
): Promise<void> {
  try {
    await prisma.activity.create({
      data: {
        type: payload.type,
        title: payload.title,
        description: payload.description,
        actorId: ctx.actorId,
        actorName: ctx.actorName,
        actorAvatar: ctx.actorAvatar,
        entityId: payload.entityId,
        entityType: payload.entityType,
        entityName: payload.entityName,
        taskId: payload.taskId,
        metadata: payload.metadata ? JSON.stringify(payload.metadata) : null,
      },
    });
  } catch (err) {
    console.error("[Activity] Failed to write activity:", err);
  }
}

// ─── Convenience wrappers ────────────────────────────────────────────────────

export const activity = {
  taskCreated: (taskId: string, taskTitle: string, ctx: ActivityContext) =>
    writeActivity({
      type: "TASK_CREATED",
      title: `${ctx.actorName} created a new task`,
      description: `"${taskTitle}"`,
      entityId: taskId,
      entityType: "task",
      entityName: taskTitle,
      taskId,
    }, ctx),

  taskStatusChanged: (
    taskId: string,
    taskTitle: string,
    newStatus: string,
    ctx: ActivityContext
  ) =>
    writeActivity({
      type: "TASK_STATUS_CHANGED",
      title: `${ctx.actorName} updated task status to ${newStatus}`,
      description: `"${taskTitle}"`,
      entityId: taskId,
      entityType: "task",
      entityName: taskTitle,
      taskId,
      metadata: { newStatus },
    }, ctx),

  taskAssigned: (
    taskId: string,
    taskTitle: string,
    assigneeName: string,
    ctx: ActivityContext
  ) =>
    writeActivity({
      type: "TASK_ASSIGNED",
      title: `${ctx.actorName} assigned a task to ${assigneeName}`,
      description: `"${taskTitle}"`,
      entityId: taskId,
      entityType: "task",
      entityName: taskTitle,
      taskId,
    }, ctx),

  taskCompleted: (taskId: string, taskTitle: string, ctx: ActivityContext) =>
    writeActivity({
      type: "TASK_COMPLETED",
      title: `${ctx.actorName} completed a task`,
      description: `"${taskTitle}"`,
      entityId: taskId,
      entityType: "task",
      entityName: taskTitle,
      taskId,
    }, ctx),

  taskDeleted: (taskId: string, taskTitle: string, ctx: ActivityContext) =>
    writeActivity({
      type: "TASK_DELETED",
      title: `${ctx.actorName} deleted a task`,
      description: `"${taskTitle}"`,
      entityId: taskId,
      entityType: "task",
      entityName: taskTitle,
    }, ctx),

  employeeJoined: (userId: string, name: string, title: string, ctx: ActivityContext) =>
    writeActivity({
      type: "EMPLOYEE_JOINED",
      title: `${name} joined the organization`,
      description: title,
      entityId: userId,
      entityType: "employee",
      entityName: name,
    }, ctx),

  employeeUpdated: (userId: string, name: string, ctx: ActivityContext) =>
    writeActivity({
      type: "EMPLOYEE_UPDATED",
      title: `${ctx.actorName} updated employee profile`,
      description: name,
      entityId: userId,
      entityType: "employee",
      entityName: name,
    }, ctx),

  projectCreated: (projectId: string, projectName: string, ctx: ActivityContext) =>
    writeActivity({
      type: "PROJECT_CREATED",
      title: `${ctx.actorName} created a new project`,
      description: `"${projectName}"`,
      entityId: projectId,
      entityType: "project",
      entityName: projectName,
    }, ctx),

  commentAdded: (taskId: string, taskTitle: string, ctx: ActivityContext) =>
    writeActivity({
      type: "COMMENT_ADDED",
      title: `${ctx.actorName} commented on a task`,
      description: `"${taskTitle}"`,
      entityId: taskId,
      entityType: "task",
      entityName: taskTitle,
      taskId,
    }, ctx),
};
