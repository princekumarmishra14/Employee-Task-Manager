/**
 * backend/src/modules/profile/profile.controller.ts
 * Controller for fetching the authenticated user's profile.
 */

import { Request, Response, NextFunction } from "express";
import prisma from "../../lib/prisma";

export async function getMyProfile(req: any, res: Response, next: NextFunction) {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        employee: true,
        department: true,
        team: true,
        role: {
          include: {
            rolePermissions: {
              include: {
                permission: true
              }
            }
          }
        }
      },
    });

    if (!user || !user.isActive) {
      return res.status(404).json({ success: false, message: "User profile not found or inactive." });
    }

    // Omit sensitive fields
    const { passwordHash, ...safeUser } = user;

    // Extract permissions into a flat array of "module:action"
    const permissions = safeUser.role?.rolePermissions.map(rp => `${rp.permission.module}:${rp.permission.action}`) || [];

    return res.status(200).json({
      success: true,
      data: {
        ...safeUser,
        permissions,
      },
    });
  } catch (err) {
    next(err);
  }
}
