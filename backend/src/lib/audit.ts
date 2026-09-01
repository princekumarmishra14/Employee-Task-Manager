/**
 * src/lib/audit.ts
 * Centralized, reusable Audit Log service.
 * Called by repositories after every data mutation.
 * Records are IMMUTABLE — never updated or deleted.
 */

import prisma from "@/lib/prisma";
import { AuditAction, AuditEntity } from "@prisma/client";

export interface AuditContext {
  performedById?: string;
  performedBy: string;
  ipAddress?: string;
  userAgent?: string;
}

export interface AuditPayload {
  action: AuditAction;
  entity: AuditEntity;
  entityId: string;
  entityName?: string;
  details: string;
  previousValue?: object | string | null;
  newValue?: object | string | null;
}

/**
 * Write an immutable audit log entry.
 * Failures are silently swallowed so a logging failure never breaks a transaction.
 */
export async function writeAuditLog(
  payload: AuditPayload,
  ctx: AuditContext
): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        action: payload.action,
        entity: payload.entity,
        entityId: payload.entityId,
        entityName: payload.entityName,
        details: payload.details,
        previousValue: payload.previousValue
          ? typeof payload.previousValue === "string"
            ? payload.previousValue
            : JSON.stringify(payload.previousValue)
          : null,
        newValue: payload.newValue
          ? typeof payload.newValue === "string"
            ? payload.newValue
            : JSON.stringify(payload.newValue)
          : null,
        performedById: ctx.performedById,
        performedBy: ctx.performedBy,
        ipAddress: ctx.ipAddress,
        userAgent: ctx.userAgent,
      },
    });
  } catch (err) {
    // Never let audit failures surface to the user
    console.error("[AuditLog] Failed to write audit log:", err);
  }
}

// ─── Convenience wrappers ────────────────────────────────────────────────────

export const audit = {
  employeeCreated: (employeeId: string, name: string, ctx: AuditContext) =>
    writeAuditLog({
      action: "CREATE",
      entity: "EMPLOYEE",
      entityId: employeeId,
      entityName: name,
      details: `New employee profile created for '${name}'.`,
    }, ctx),

  employeeUpdated: (
    employeeId: string,
    name: string,
    prev: object,
    next: object,
    ctx: AuditContext
  ) =>
    writeAuditLog({
      action: "UPDATE",
      entity: "EMPLOYEE",
      entityId: employeeId,
      entityName: name,
      details: `Employee profile updated for '${name}'.`,
      previousValue: prev,
      newValue: next,
    }, ctx),

  employeeDeleted: (employeeId: string, name: string, ctx: AuditContext) =>
    writeAuditLog({
      action: "DELETE",
      entity: "EMPLOYEE",
      entityId: employeeId,
      entityName: name,
      details: `Employee '${name}' soft-deleted (deactivated).`,
    }, ctx),

  employeeStatusChanged: (
    employeeId: string,
    name: string,
    isActive: boolean,
    ctx: AuditContext
  ) =>
    writeAuditLog({
      action: isActive ? "ACTIVATION" : "DEACTIVATION",
      entity: "EMPLOYEE",
      entityId: employeeId,
      entityName: name,
      details: `Employee '${name}' ${isActive ? "activated" : "deactivated"}.`,
    }, ctx),

  taskCreated: (taskId: string, title: string, ctx: AuditContext) =>
    writeAuditLog({
      action: "CREATE",
      entity: "TASK",
      entityId: taskId,
      entityName: title,
      details: `Task '${title}' created.`,
    }, ctx),

  taskUpdated: (
    taskId: string,
    title: string,
    prev: object,
    next: object,
    ctx: AuditContext
  ) =>
    writeAuditLog({
      action: "UPDATE",
      entity: "TASK",
      entityId: taskId,
      entityName: title,
      details: `Task '${title}' updated.`,
      previousValue: prev,
      newValue: next,
    }, ctx),

  taskStatusChanged: (
    taskId: string,
    title: string,
    from: string,
    to: string,
    ctx: AuditContext
  ) =>
    writeAuditLog({
      action: "STATUS_CHANGE",
      entity: "TASK",
      entityId: taskId,
      entityName: title,
      details: `Task '${title}' status changed from '${from}' to '${to}'.`,
      previousValue: { status: from },
      newValue: { status: to },
    }, ctx),

  taskDeleted: (taskId: string, title: string, ctx: AuditContext) =>
    writeAuditLog({
      action: "DELETE",
      entity: "TASK",
      entityId: taskId,
      entityName: title,
      details: `Task '${title}' soft-deleted.`,
    }, ctx),

  taskAssigned: (
    taskId: string,
    title: string,
    assigneeName: string,
    ctx: AuditContext
  ) =>
    writeAuditLog({
      action: "ASSIGNMENT_CHANGE",
      entity: "TASK",
      entityId: taskId,
      entityName: title,
      details: `Task '${title}' assigned to '${assigneeName}'.`,
    }, ctx),

  userLogin: (userId: string, email: string, ctx: AuditContext) =>
    writeAuditLog({
      action: "LOGIN",
      entity: "USER",
      entityId: userId,
      entityName: email,
      details: `User '${email}' logged in successfully.`,
    }, ctx),

  userLogout: (userId: string, email: string, ctx: AuditContext) =>
    writeAuditLog({
      action: "LOGOUT",
      entity: "USER",
      entityId: userId,
      entityName: email,
      details: `User '${email}' logged out.`,
    }, ctx),

  roleChanged: (
    userId: string,
    name: string,
    from: string,
    to: string,
    ctx: AuditContext
  ) =>
    writeAuditLog({
      action: "ROLE_CHANGE",
      entity: "USER",
      entityId: userId,
      entityName: name,
      details: `Role changed for '${name}' from '${from}' to '${to}'.`,
      previousValue: { role: from },
      newValue: { role: to },
    }, ctx),
};
