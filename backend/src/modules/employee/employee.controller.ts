/**
 * =============================================================================
 * EMPLOYEE CONTROLLER LAYER
 * Project: Employee Task Manager (Enterprise Edition)
 * Role: Employee API Endpoints Handler
 * 
 * Description:
 * Gathers, processes, validates, and serializes employee resources. Coordinates
 * user profile identities (linked 1:1 with authentication users) and manages
 * onboarding password generations, system codes, and metadata updates.
 * =============================================================================
 */

import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../../middlewares/auth.middleware";
import { EmployeeRepository } from "./employee.repository";
import { audit, writeAuditLog } from "../../lib/audit";
import { activity } from "../../lib/activity";
import bcrypt from "bcryptjs";
import { z } from "zod";
import prisma from "../../lib/prisma";

/**
 * Lists all active employees based on client filters.
 */
export async function getEmployees(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const filters = {
      search: req.query.search?.toString() || undefined,
      role: (req.query.role as string) || undefined,
      departmentId: req.query.departmentId?.toString() || undefined,
      teamId: req.query.teamId?.toString() || undefined,
      isActive: req.query.isActive !== undefined ? req.query.isActive === "true" : undefined,
    };

    const searchParams = new URLSearchParams();
    if (req.query.page) searchParams.set("page", req.query.page.toString());
    if (req.query.pageSize) searchParams.set("pageSize", req.query.pageSize.toString());

    const result = await EmployeeRepository.findMany(filters, searchParams);
    return res.status(200).json({ success: true, data: result.data, meta: result.meta });
  } catch (err) {
    next(err);
  }
}

/**
 * Resolves single employee profile by target ID.
 */
export async function getEmployeeById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const id = req.params.id as string;
    const employee = await EmployeeRepository.findById(id);
    return res.status(200).json({ success: true, data: employee });
  } catch (err) {
    next(err);
  }
}

/**
 * Onboards a new employee (creates User + Employee profile records).
 * 
 * Flowchart for createEmployee:
 * [1. Validate Administrator Role] -> Assert SUPER_ADMIN or ADMIN
 *                                           |
 *                                           v
 * [2. Parse & Format Fullname] -> Split firstName / lastName if fullName is sent
 *                                           |
 *                                           v
 * [3. Code & Password Generation] -> Generate code & cryptographically hash auto/manual password
 *                                           |
 *                                           v
 * [4. Database Record Creation] -> EmployeeRepository.create(...)
 *                                           |
 *                                           v
 * [5. Side-Effect Reporting] -> parallel async audit logs & activity feed push
 *                                           |
 *                                           v
 * [6. HTTP Response Serialization] -> Return 201 Created with employee payload
 */

function getGenderFromName(fullName: string): "male" | "female" | "neutral" {
  if (!fullName) return "neutral";
  const firstName = fullName.split(" ")[0].toLowerCase();
  const femaleNames = [
    "nitika", "jiya", "patricia", "mary", "linda", "barbara", "elizabeth", "jennifer", "maria", "susan",
    "margaret", "dorothy", "lisa", "nancy", "karen", "betty", "helen", "sandra", "donna", "carol",
    "ruth", "sharon", "michelle", "laura", "sarah", "kimberly", "deborah", "jessica", "shirley",
    "cynthia", "angela", "melissa", "brenda", "amy", "anna", "rebecca", "virginia", "kathleen",
    "pamela", "martha", "debra", "amanda", "stephanie", "carolyn", "christine", "marie", "janet",
    "catherine", "frances", "ann", "joyce", "diane", "alice", "julie", "heather", "teresa", "doris",
    "gloria", "evelyn", "jean", "cheryl", "mildred", "katherine", "joan", "ashley", "judith", "rose",
    "janice", "kelly", "nicole", "judy", "christina", "kathy", "theresa", "beverly", "denise", "tammy",
    "irene", "jane", "lori", "rachel", "marilyn", "andrea", "kathryn", "louise", "sara", "anne",
    "jacqueline", "wanda", "bonnie", "julia", "ruby", "lois", "tina", "phyllis", "norma", "paula",
    "diana", "annie", "lillian", "emily", "robin",
    "priya", "neha", "pooja", "anjali", "shruti", "swati", "sneha", "divya", "shikha", "shilpa",
    "kavita", "sunita", "meena", "geeta", "rekha", "rani", "jyoti", "nisha", "radha", "sita",
    "sonia", "ritu", "simran", "kajal", "mamta", "renu", "monika", "pinky", "preeti", "vandana",
    "aarti", "poonam", "sarita", "kiran", "deepa", "anju", "seema", "neelam", "asha", "ush"
  ];
  const maleNames = [
    "prince", "raj", "john", "james", "robert", "michael", "william", "david", "richard", "charles",
    "joseph", "thomas", "christopher", "daniel", "paul", "mark", "donald", "george", "kenneth", "steven",
    "edward", "brian", "ronald", "anthony", "kevin", "jason", "matthew", "gary", "timothy", "jose",
    "larry", "jeffrey", "frank", "scott", "eric", "stephen", "andrew", "raymond", "gregory", "joshua",
    "jerry", "dennis", "walter", "patrick", "peter", "harold", "douglas", "henry", "carl", "arthur",
    "ryan", "roger", "joe", "juan", "jack", "albert", "jonathan", "justin", "terry", "gerald",
    "keith", "samuel", "ralph", "lawrence", "nicholas", "roy", "benjamin", "bruce", "brandon", "adam",
    "harry", "fred", "wayne", "billy", "steve", "louis", "jeremy", "aaron", "randy", "howard",
    "eugene", "carlos", "russell", "bobby", "victor", "martin", "ernest", "phillip", "todd", "jesse",
    "craig", "alan", "shawn", "clarence", "sean", "philip", "chris", "johnny", "earl", "jimmy",
    "amit", "rahul", "rohit", "vikas", "sanjay", "sunil", "ajay", "anil", "praveen", "ravi",
    "sandeep", "manish", "ashok", "vijay", "rajeev", "ramesh", "suresh", "dinesh", "mahesh", "navin",
    "prakash", "deepak", "vikram", "surya", "tarun", "gourav", "sourabh", "vishal", "ankit", "mohit",
    "abhishek", "aditya", "akash", "aman", "amitabh", "anand", "anurag", "arun", "arvind", "ashish"
  ];

  if (femaleNames.includes(firstName)) return "female";
  if (maleNames.includes(firstName)) return "male";
  return "neutral";
}

function getAvatarForName(fullName: string): string {
  const gender = getGenderFromName(fullName);
  // Hash the name to get a consistent number between 0 and 99
  let hash = 0;
  for (let i = 0; i < fullName.length; i++) {
    hash = fullName.charCodeAt(i) + ((hash << 5) - hash);
  }
  const id = Math.abs(hash) % 100;

  if (gender === "female") return `https://randomuser.me/api/portraits/women/${id}.jpg`;
  if (gender === "male") return `https://randomuser.me/api/portraits/men/${id}.jpg`;
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=random`;
}

const employeeCreatePasswordSchema = z.string()
  .min(8, "Password must be at least 8 characters.")
  .max(32, "Password cannot exceed 32 characters.")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter.")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter.")
  .regex(/[0-9]/, "Password must contain at least one number.")
  .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character.");

export async function createEmployee(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    // Assert authorization clearances
    if (req.user?.role !== "SUPER_ADMIN" && req.user?.role !== "ADMIN") {
      return res.status(403).json({ success: false, message: "Forbidden. Admin privileges required." });
    }

    const { email, title, role, phone, avatarUrl, departmentId, teamId, password, confirmPassword } = req.body;
    let { firstName, lastName, fullName } = req.body;

    // 1. Validation of credentials inputs
    if (!email) {
      return res.status(400).json({ success: false, message: "Email address is required." });
    }
    if (!password || !confirmPassword) {
      return res.status(400).json({ success: false, message: "Password and Confirm Password are required." });
    }
    if (password !== confirmPassword) {
      return res.status(400).json({ success: false, message: "Passwords do not match." });
    }

    const passwordValidation = employeeCreatePasswordSchema.safeParse(password);
    if (!passwordValidation.success) {
      return res.status(400).json({
        success: false,
        message: passwordValidation.error.issues[0]?.message || "Password requirements not satisfied.",
      });
    }

    // 2. Case-insensitive email uniqueness validation
    const normalizedEmail = email.toLowerCase().trim();
    const existingUser = await prisma.user.findFirst({
      where: {
        email: {
          equals: normalizedEmail,
        },
        deletedAt: null,
      },
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists.",
      });
    }

    // Validate department existence if provided
    if (departmentId && departmentId !== "") {
      const deptExists = await prisma.department.findFirst({
        where: { id: departmentId, deletedAt: null },
      });
      if (!deptExists) {
        return res.status(400).json({ success: false, message: "Selected department does not exist." });
      }
    }

    // Validate team existence if provided
    if (teamId && teamId !== "") {
      const teamExists = await prisma.team.findFirst({
        where: { id: teamId, deletedAt: null },
      });
      if (!teamExists) {
        return res.status(400).json({ success: false, message: "Selected team does not exist." });
      }
    }

    // Standardize fullName formatting to resolve firstName/lastName split boundaries
    if (fullName && (!firstName || !lastName)) {
      const parts = fullName.trim().split(" ");
      firstName = parts[0] || "";
      lastName = parts.slice(1).join(" ") || "";
    }

    fullName = fullName || `${firstName} ${lastName}`.trim();

    // Generate unique corporate code prefix and hash password safely using 12 salt rounds
    const employeeCode = await EmployeeRepository.generateEmployeeCode();
    const passwordHash = await bcrypt.hash(password, 12);

    const finalRole = (role as string) || "EMPLOYEE";

    // 3. Store employee details & user authentication record within a transaction
    const employee = await EmployeeRepository.create({
      email: normalizedEmail,
      passwordHash,
      role: finalRole,
      departmentId: departmentId || null,
      teamId: teamId || null,
      fullName,
      firstName: firstName || "Unknown",
      lastName: lastName || "Unknown",
      title,
      phone: phone || null,
      avatarUrl: avatarUrl || null,
      employeeCode,
      createdBy: req.user?.email || "system",
    });

    const ipAddress = req.ip || req.headers["x-forwarded-for"]?.toString() || undefined;

    // 4. Custom security compliance audit log registration
    const formatRole = (roleName?: string) => {
      if (roleName === "SUPER_ADMIN") return "Super Admin";
      if (roleName === "ADMIN") return "Admin";
      if (roleName === "MANAGER") return "Manager";
      if (roleName === "EMPLOYEE") return "Employee";
      return roleName || "Employee";
    };

    const creatorRoleName = formatRole(req.user?.role);
    const logDetails = `${creatorRoleName} created employee ${fullName} and generated login credentials.`;

    await Promise.all([
      writeAuditLog({
        action: "CREATE",
        entity: "EMPLOYEE",
        entityId: employee.id,
        entityName: fullName,
        details: logDetails,
      }, {
        performedById: req.user?.id,
        performedBy: req.user?.email || "system",
        ipAddress,
      }),
      activity.employeeJoined(employee.id, (employee as any).employee?.fullName ?? email, title, {
        actorId: req.user?.id,
        actorName: req.user?.email || "system",
      }),
    ]);

    return res.status(201).json({ success: true, data: employee });
  } catch (err) {
    next(err);
  }
}

/**
 * Partially updates an employee's details.
 * Supports self-profile modification or global updates from administrators.
 */
export async function updateEmployee(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const id = req.params.id as string;

    // Verify requesting identity matches target update ID, or holds Admin privileges
    if (req.user?.role !== "SUPER_ADMIN" && req.user?.role !== "ADMIN" && req.user?.id !== id) {
      return res.status(403).json({ success: false, message: "Forbidden. Admin privileges or self-update required." });
    }

    const updates = req.body;

    // 1. Email uniqueness validation if email is being updated
    if (updates.email) {
      const normalizedEmail = updates.email.toLowerCase().trim();
      const existingUser = await prisma.user.findFirst({
        where: {
          email: {
            equals: normalizedEmail,
          },
          id: {
            not: id,
          },
          deletedAt: null,
        },
      });

      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: "An account with this email already exists.",
        });
      }
    }

    // 2. Department existence validation if departmentId is being updated
    if (updates.departmentId) {
      const deptExists = await prisma.department.findFirst({
        where: { id: updates.departmentId, deletedAt: null },
      });
      if (!deptExists) {
        return res.status(400).json({ success: false, message: "Selected department does not exist." });
      }
    }

    // 3. Team existence validation if teamId is being updated
    if (updates.teamId) {
      const teamExists = await prisma.team.findFirst({
        where: { id: updates.teamId, deletedAt: null },
      });
      if (!teamExists) {
        return res.status(400).json({ success: false, message: "Selected team does not exist." });
      }
    }

    // 4. Role validation if role is being updated
    if (updates.role) {
      const roleObj = await prisma.role.findFirst({
        where: { name: updates.role },
      });
      if (!roleObj) {
        return res.status(400).json({ success: false, message: "Selected role does not exist." });
      }
    }

    const employee = await EmployeeRepository.update(id!, {
      ...updates,
      updatedBy: req.user?.email || "system",
    });

    const ipAddress = req.ip || req.headers["x-forwarded-for"]?.toString() || undefined;

    // Audit compliance trace logging
    await audit.employeeUpdated(id!, employee.employee?.fullName ?? employee.email, {}, updates, {
      performedById: req.user?.id,
      performedBy: req.user?.email || "system",
      ipAddress,
    });

    return res.status(200).json({ success: true, data: employee });
  } catch (err) {
    next(err);
  }
}

/**
 * Soft deletes/Deactivates employee profile node.
 */
export async function deleteEmployee(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const id = req.params.id as string;

    if (req.user?.role !== "SUPER_ADMIN" && req.user?.role !== "ADMIN") {
      return res.status(403).json({ success: false, message: "Forbidden. Admin privileges required." });
    }

    const employee = await EmployeeRepository.findById(id!);
    // Flip active flags on both User and Employee profiles
    await EmployeeRepository.softDelete(id!, req.user?.email || "system");

    const ipAddress = req.ip || req.headers["x-forwarded-for"]?.toString() || undefined;

    await audit.employeeDeleted(id!, employee.employee?.fullName ?? employee.email, {
      performedById: req.user?.id,
      performedBy: req.user?.email || "system",
      ipAddress,
    });

    return res.status(200).json({ success: true, message: "Employee successfully deactivated." });
  } catch (err) {
    next(err);
  }
}
