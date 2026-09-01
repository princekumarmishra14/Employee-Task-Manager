/**
 * backend/src/modules/rbac/rbac.controller.ts
 */
import { Request, Response, NextFunction } from "express";
import prisma from "../../lib/prisma";

export async function getRoles(req: Request, res: Response, next: NextFunction) {
  try {
    const roles = await prisma.role.findMany({
      include: {
        rolePermissions: {
          include: { permission: true }
        },
        _count: { select: { users: true } }
      },
      orderBy: { createdAt: "asc" }
    });
    
    // Format response to be easier to consume on frontend
    const formattedRoles = roles.map(r => ({
      id: r.id,
      name: r.name,
      description: r.description,
      isSystem: r.isSystem,
      userCount: r._count.users,
      permissions: r.rolePermissions.map(rp => ({
        id: rp.permission.id,
        module: rp.permission.module,
        action: rp.permission.action
      }))
    }));

    return res.status(200).json({ success: true, data: formattedRoles });
  } catch (err) {
    next(err);
  }
}

export async function getPermissions(req: Request, res: Response, next: NextFunction) {
  try {
    const permissions = await prisma.permission.findMany({
      orderBy: [{ module: "asc" }, { action: "asc" }]
    });
    return res.status(200).json({ success: true, data: permissions });
  } catch (err) {
    next(err);
  }
}
