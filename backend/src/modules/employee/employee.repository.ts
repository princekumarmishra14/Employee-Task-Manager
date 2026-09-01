/**
 * =============================================================================
 * EMPLOYEE DATA ACCESS LAYER (REPOSITORY)
 * Project: Employee Task Manager (Enterprise Edition)
 * Role: Prisma Query Builder / Employee Relational Data Store
 * 
 * Description:
 * Implements standard SQL access methods for User and Employee records in a
 * 1:1 relation setup. Encapsulates transaction operations, code generation counters,
 * validation regex for UUID fields, and complex multi-table joins.
 * =============================================================================
 */

import prisma from "@/lib/prisma";
import { parsePaginationParams, buildPaginationResult, PaginationResult } from "@/lib/pagination";
import { NotFoundError, ConflictError } from "@/lib/errors";

export interface EmployeeFilters {
  search?: string;
  role?: string;
  departmentId?: string;
  teamId?: string;
  isActive?: boolean;
}

export type EmployeeWithProfile = Awaited<ReturnType<typeof EmployeeRepository.findById>>;

// Standard JSON selector payload to retrieve complete profile nodes without compiling password hashes.
const EMPLOYEE_SELECT = {
  id: true,
  email: true,
  roleId: true,
  role: { select: { name: true } },
  departmentId: true,
  teamId: true,
  isActive: true,
  isEmailVerified: true,
  failedLoginAttempts: true,
  lockedUntil: true,
  lastLoginAt: true,
  createdAt: true,
  updatedAt: true,
  employee: {
    select: {
      id: true,
      employeeCode: true,
      fullName: true,
      firstName: true,
      lastName: true,
      title: true,
      phone: true,
      avatarUrl: true,
      hireDate: true,
      bio: true,
      location: true,
    },
  },
  department: { select: { id: true, name: true } },
  team: { select: { id: true, name: true } },
} as const;

/**
 * Validates whether string maps to standard UUID formatting.
 * Prevents Prisma database exceptions on invalid/null identifiers.
 */
const isValidUUID = (id: string | null | undefined) => {
  if (!id) return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
};

export class EmployeeRepository {
  /**
   * Resolves list of users with corresponding employee profiles using paginated transactions.
   */
  static async findMany(
    filters: EmployeeFilters,
    searchParams: URLSearchParams
  ): Promise<PaginationResult<any>> {
    const { skip, take, page, pageSize } = parsePaginationParams(searchParams);

    // Build Prisma query condition object dynamically based on incoming parameters
    const where: any = {
      deletedAt: null,
      ...(filters.isActive !== undefined && { isActive: filters.isActive }),
      ...(filters.role && { role: { name: filters.role } }),
      ...(filters.departmentId && { departmentId: filters.departmentId }),
      ...(filters.teamId && { teamId: filters.teamId }),
      ...(filters.search && {
        OR: [
          { email: { contains: filters.search } },
          { employee: { fullName: { contains: filters.search } } },
          { employee: { employeeCode: { contains: filters.search } } },
          { employee: { title: { contains: filters.search } } },
        ],
      }),
    };

    // Retrieve records list and matching total count inside a database transaction
    const [data, total] = await prisma.$transaction([
      prisma.user.findMany({
        where,
        select: EMPLOYEE_SELECT,
        orderBy: [{ createdAt: "desc" }],
        skip,
        take,
      }),
      prisma.user.count({ where }),
    ]);

    return buildPaginationResult(data as any[], total, page, pageSize);
  }

  /**
   * Resolves detailed employee record based on target User UUID.
   */
  static async findById(id: string) {
    const user = await prisma.user.findFirst({
      where: { id, deletedAt: null },
      select: EMPLOYEE_SELECT,
    });
    if (!user) throw new NotFoundError("Employee", id);
    return user;
  }

  /**
   * Resolves profile details using email lookup.
   */
  static async findByEmail(email: string) {
    return prisma.user.findFirst({
      where: { email: email.toLowerCase(), deletedAt: null },
      select: EMPLOYEE_SELECT,
    });
  }

  /**
   * Creates a dual transaction to provision User identity and linked Profile.
   */
  static async create(data: {
    email: string;
    passwordHash: string;
    role: string;
    departmentId?: string | null;
    teamId?: string | null;
    fullName: string;
    firstName: string;
    lastName: string;
    title: string;
    phone?: string | null;
    avatarUrl?: string | null;
    employeeCode: string;
    hireDate?: Date;
    createdBy: string;
  }) {
    // Assert email uniqueness
    const existing = await prisma.user.findUnique({ where: { email: data.email } });
    if (existing) throw new ConflictError(`An employee with email '${data.email}' already exists.`);

    // Assert employee code uniqueness
    const existingCode = await prisma.employee.findUnique({ where: { employeeCode: data.employeeCode } });
    if (existingCode) throw new ConflictError(`Employee code '${data.employeeCode}' is already in use.`);

    // Resolve target RBAC role node mapping
    const roleObj = await prisma.role.findUnique({ where: { name: data.role } });
    const roleId = roleObj?.id || (await prisma.role.findFirst({ where: { name: "EMPLOYEE" } }))?.id;

    return prisma.user.create({
      data: {
        email: data.email.toLowerCase().trim(),
        passwordHash: data.passwordHash,
        roleId: roleId!,
        departmentId: isValidUUID(data.departmentId) ? data.departmentId : null,
        teamId: isValidUUID(data.teamId) ? data.teamId : null,
        isActive: true,
        createdBy: data.createdBy,
        updatedBy: data.createdBy,
        // Nested relation creation for Profile data
        employee: {
          create: {
            employeeCode: data.employeeCode,
            fullName: data.fullName?.trim() || "Unknown",
            firstName: data.firstName?.trim() || "Unknown",
            lastName: data.lastName?.trim() || "Unknown",
            title: data.title?.trim() || "Unknown",
            phone: data.phone || null,
            avatarUrl: data.avatarUrl || null,
            hireDate: data.hireDate ?? new Date(),
            isActive: true,
          },
        },
      },
      select: EMPLOYEE_SELECT,
    });
  }

  /**
   * Performs coordinated transactional updates targeting User nodes and Employee records.
   */
  static async update(id: string, data: {
    role?: string;
    departmentId?: string | null;
    teamId?: string | null;
    isActive?: boolean;
    isEmailVerified?: boolean;
    failedLoginAttempts?: number;
    lockedUntil?: Date | null;
    updatedBy: string;
    fullName?: string;
    firstName?: string;
    lastName?: string;
    title?: string;
    phone?: string | null;
    avatarUrl?: string | null;
    bio?: string | null;
    location?: string | null;
    email?: string;
  }) {
    const existing = await this.findById(id);

    console.log("EmployeeRepository.update called with:", { id, data });

    const {
      role,
      departmentId,
      teamId,
      isActive,
      isEmailVerified,
      failedLoginAttempts,
      lockedUntil,
      updatedBy,
      email,
      ...employeeFields
    } = data;

    console.log("Extracted employeeFields:", employeeFields);

    let roleId = undefined;
    if (role !== undefined) {
      const roleObj = await prisma.role.findUnique({ where: { name: role } });
      if (roleObj) roleId = roleObj.id;
    }

    // Coordinated database operations via transactional executions
    await prisma.$transaction([
      prisma.user.update({
        where: { id },
        data: {
          ...(roleId !== undefined && { roleId }),
          ...(departmentId !== undefined && { departmentId: isValidUUID(departmentId) ? departmentId : null }),
          ...(teamId !== undefined && { teamId: isValidUUID(teamId) ? teamId : null }),
          ...(isActive !== undefined && { isActive }),
          ...(isEmailVerified !== undefined && { isEmailVerified }),
          ...(failedLoginAttempts !== undefined && { failedLoginAttempts }),
          ...(lockedUntil !== undefined && { lockedUntil }),
          ...(email !== undefined && { email: email.toLowerCase() }),
          updatedBy,
          updatedAt: new Date(),
        },
      }),
      // Run profile updates only if fields are present and profile node exists
      ...(Object.keys(employeeFields).length > 0 && existing.employee
        ? [prisma.employee.update({
            where: { userId: id },
            data: {
              ...(employeeFields.fullName && { fullName: employeeFields.fullName.trim() }),
              ...(employeeFields.firstName && { firstName: employeeFields.firstName.trim() }),
              ...(employeeFields.lastName && { lastName: employeeFields.lastName.trim() }),
              ...(employeeFields.title && { title: employeeFields.title.trim() }),
              ...(employeeFields.phone !== undefined && { phone: employeeFields.phone }),
              ...(employeeFields.avatarUrl !== undefined && { avatarUrl: employeeFields.avatarUrl }),
              ...(employeeFields.bio !== undefined && { bio: employeeFields.bio }),
              ...(employeeFields.location !== undefined && { location: employeeFields.location }),
              updatedAt: new Date(),
            },
          })]
        : []),
    ]);

    return this.findById(id);
  }

  /**
   * Flags employee identity and profile record as inactive.
   */
  static async softDelete(id: string, deletedBy: string) {
    await this.findById(id); // Throws exception if employee does not exist
    await prisma.$transaction([
      prisma.user.update({
        where: { id },
        data: { isActive: false, deletedAt: new Date(), updatedBy: deletedBy },
      }),
      prisma.employee.updateMany({
        where: { userId: id },
        data: { isActive: false, deletedAt: new Date() },
      }),
    ]);
  }

  /** 
   * Auto-resolves counter limits to generate consecutive employee identifiers (EMP0001, etc.)
   */
  static async generateEmployeeCode(): Promise<string> {
    const last = await prisma.employee.findFirst({
      where: { employeeCode: { startsWith: "EMP" } },
      orderBy: { employeeCode: "desc" },
      select: { employeeCode: true },
    });
    
    let lastNum = 0;
    if (last && last.employeeCode) {
      const parsed = parseInt(last.employeeCode.replace("EMP", ""), 10);
      if (!isNaN(parsed)) {
        lastNum = parsed;
      }
    }
    
    return `EMP${String(lastNum + 1).padStart(4, "0")}`;
  }
}
