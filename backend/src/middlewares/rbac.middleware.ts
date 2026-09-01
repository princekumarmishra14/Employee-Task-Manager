/**
 * =============================================================================
 * ROLE-BASED ACCESS CONTROL (RBAC) AUTHORIZATION MIDDLEWARE
 * Project: Employee Task Manager (Enterprise Edition)
 * Role: Permission Authorization Gate
 * 
 * Description:
 * Implements granular, data-driven security controls by validating the authenticated
 * user's assigned role and matching permissions against target module and action limits.
 * Resolves permissions dynamically from the database to reflect administrative updates in real-time.
 * Supports complete bypass override for SUPER_ADMIN role.
 * =============================================================================
 */

import { Request, Response, NextFunction } from "express";
import prisma from "../lib/prisma";
import { AuthenticatedRequest } from "./auth.middleware";

/**
 * Creates an Express middleware to enforce a specific module-level action permission.
 * 
 * Flowchart of requirePermission:
 * [Verify Session] -> [Fetch Role & Permissions from DB] -> [Bypass Check: SUPER_ADMIN?] 
 *                                                                |
 *                                                          (No)  v  (Yes: call next())
 *                                                  [Check Module & Action Match]
 *                                                                |
 *                                                    +-----------+-----------+
 *                                               (No) |                       | (Yes)
 *                                                    v                       v
 *                                           [403 Denied]                [Call next()]
 * 
 * @param module The target system module boundary (e.g. 'employee', 'task', 'roles')
 * @param action The required operation access level (e.g. 'create', 'view', 'update', 'delete', 'manage')
 */
export function requirePermission(module: string, action: string) {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const user = req.user;
      if (!user || !user.id) {
        return res.status(401).json({ success: false, message: "Authentication required" });
      }

      // Fetch user role and permissions from DB to verify status and dynamic permission list
      const dbUser = await prisma.user.findUnique({
        where: { id: user.id },
        include: {
          role: {
            include: {
              rolePermissions: {
                include: {
                  permission: true,
                },
              },
            },
          },
        },
      });

      // Assert user exists and remains active on the platform
      if (!dbUser || !dbUser.isActive) {
        return res.status(403).json({ success: false, message: "Account inactive or not found" });
      }

      // Bypass checks for global SUPER_ADMIN identities
      if (dbUser.role?.name === "SUPER_ADMIN") {
        return next();
      }

      // Match permission rules against active action payload
      const hasPerm = dbUser.role?.rolePermissions.some(
        (rp) => rp.permission.module === module && rp.permission.action === action
      );

      // Return 403 Forbidden on missing permissions
      if (!hasPerm) {
        return res.status(403).json({ 
          success: false, 
          message: `Permission denied. Requires ${module}:${action}` 
        });
      }

      // Access granted
      next();
    } catch (error) {
      console.error("RBAC Middleware Error:", error);
      res.status(500).json({ success: false, message: "Internal Server Error" });
    }
  };
}
