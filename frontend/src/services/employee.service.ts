/**
 * =============================================================================
 * FRONTEND EMPLOYEE SERVICE LAYER
 * Project: Employee Task Manager (Enterprise Edition)
 * Role: Axios API Proxy Service for Employees
 * 
 * Description:
 * Aggregates client-side operations targeting backend `/employees` REST endpoints.
 * Handles employee credential validation rules (Zod schemas), name splitting
 * algorithms, profile conversions, and response translations.
 * =============================================================================
 */

import { Employee, EmployeeRole } from "../types/employee.types";
import { apiGet, apiPost, apiPatch, apiDelete } from "@/lib/axios";
import { ApiResponse } from "../types/response.types";
import { employeeValidationSchema, EmployeeValidationInput } from "@/validators/employee.schema";
import { createApiResponseSuccess, createApiResponseError } from "@/utils/apiResponse";
import { TaskErrorHandler } from "./taskErrorHandler";
import { useDBStore } from "@/store/dbStore";

interface BackendEmployee {
  id: string;
  email: string;
  role: string | { name: string };
  departmentId?: string | null;
  teamId?: string | null;
  isActive?: boolean;
  createdAt: string;
  department?: { id: string; name: string } | null;
  team?: { id: string; name: string } | null;
  avatarUrl?: string | null;
  employeeCode?: string;
  employee?: {
    id: string;
    employeeCode?: string;
    fullName?: string;
    firstName?: string;
    lastName?: string;
    title?: string;
    phone?: string | null;
    avatarUrl?: string | null;
    hireDate?: string;
    bio?: string | null;
    location?: string | null;
    isActive?: boolean;
  } | null;
}

export class EmployeeService {
  /**
   * Resolves active user language settings from Zustand store.
   */
  private static getLocale(): "en" | "ar" {
    const store = useDBStore.getState();
    return store.currentLanguage || "en";
  }

  private static resolveRoleName(roleRaw: unknown): EmployeeRole {
    if (!roleRaw) return "EMPLOYEE";
    let name = "EMPLOYEE";
    if (typeof roleRaw === "string") {
      name = roleRaw;
    } else if (typeof roleRaw === "object" && roleRaw !== null && "name" in roleRaw) {
      name = String((roleRaw as { name: unknown }).name || "EMPLOYEE");
    }
    
    const validRoles: EmployeeRole[] = ["SUPER_ADMIN", "ADMIN", "MANAGER", "EMPLOYEE", "VIEWER"];
    if (validRoles.includes(name as any)) {
      return name as EmployeeRole;
    }
    return "EMPLOYEE";
  }

  static getAvatarForName(fullName: string): string {
    const name = fullName.toLowerCase();
    const femaleNames = ["mary", "patricia", "linda", "barbara", "elizabeth", "jennifer", "maria", "susan", "margaret", "dorothy", "lisa", "nancy", "karen", "betty", "helen", "sandra", "donna", "carol", "ruth", "sharon"];
    const maleNames = ["james", "john", "robert", "michael", "william", "david", "richard", "charles", "joseph", "thomas", "christopher", "daniel", "paul", "mark", "donald", "george", "kenneth", "steven", "edward", "brian"];

    const firstName = name.split(" ")[0];
    let gender = "neutral";
    if (femaleNames.includes(firstName)) gender = "female";
    if (maleNames.includes(firstName)) gender = "male";

    let hash = 0;
    for (let i = 0; i < fullName.length; i++) hash = fullName.charCodeAt(i) + ((hash << 5) - hash);
    const id = Math.abs(hash) % 100;

    if (gender === "female") return `https://randomuser.me/api/portraits/women/${id}.jpg`;
    if (gender === "male") return `https://randomuser.me/api/portraits/men/${id}.jpg`;
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=random`;
  }

  /**
   * Fetch all employees from PostgreSQL.
   */
  static async getEmployees(): Promise<ApiResponse<Employee[]>> {
    try {
      const data = await apiGet<BackendEmployee[]>("/employees?pageSize=1000");
      const list = data.map((emp) => {
        // Fallback names formatting logic
        const name = emp.employee?.fullName || `${emp.employee?.firstName} ${emp.employee?.lastName}`.trim() || emp.email;
        return {
          id: emp.id,
          employeeCode: emp.employee?.employeeCode || emp.employeeCode || "",
          fullName: name,
          name: name,
          email: emp.email,
          phone: emp.employee?.phone || null,
          role: this.resolveRoleName(emp.role),
          title: emp.employee?.title || "",
          departmentId: emp.department?.id || emp.departmentId || "",
          teamId: emp.team?.id || emp.teamId || "",
          avatarUrl: emp.employee?.avatarUrl || emp.avatarUrl || this.getAvatarForName(name),
          isActive: emp.employee?.isActive ?? true,
          createdAt: emp.createdAt,
        };
      });
      return createApiResponseSuccess(list, "Employees loaded successfully");
    } catch (err) {
      const locale = this.getLocale();
      const readable = TaskErrorHandler.getReadableMessage(err, locale);
      return createApiResponseError(readable);
    }
  }

  /**
   * Fetch a single employee by ID from PostgreSQL.
   */
  static async getEmployeeById(id: string): Promise<ApiResponse<Employee>> {
    try {
      const emp = await apiGet<BackendEmployee>(`/employees/${id}`);
      const name = emp.employee?.fullName || `${emp.employee?.firstName} ${emp.employee?.lastName}`.trim() || emp.email;
      const mapped = {
        id: emp.id,
        employeeCode: emp.employee?.employeeCode || emp.employeeCode || "",
        fullName: name,
        name: name,
        email: emp.email,
        phone: emp.employee?.phone || null,
        role: this.resolveRoleName(emp.role),
        departmentId: emp.departmentId || null,
        teamId: emp.teamId || null,
        isActive: emp.isActive ?? true,
        createdAt: emp.createdAt,
        avatarUrl: emp.employee?.avatarUrl || emp.avatarUrl || this.getAvatarForName(name),
        title: emp.employee?.title || "",
      };
      return createApiResponseSuccess(mapped, "Employee profile loaded successfully");
    } catch (err) {
      const locale = this.getLocale();
      const readable = TaskErrorHandler.getReadableMessage(err, locale);
      return createApiResponseError(readable);
    }
  }

  /**
   * Create a new employee in PostgreSQL (restricted to Admin/Super Admin).
   */
  static async createEmployee(formData: EmployeeValidationInput): Promise<ApiResponse<Employee>> {
    try {
      // Validate schema format parameters prior to API dispatch
      const validation = employeeValidationSchema.safeParse(formData);
      if (!validation.success) {
        throw new Error(validation.error.issues[0]?.message || "Validation failed.");
      }

      // Deconstruct display names into distinct first and last keys
      const names = formData.fullName.trim().split(/\s+/);
      const firstName = names[0] || "";
      const lastName = names.slice(1).join(" ") || "Employee";

      const data = await apiPost<BackendEmployee>("/employees", {
        email: formData.email,
        firstName,
        lastName,
        title: formData.title,
        role: formData.role,
        phone: formData.phone,
        avatarUrl: formData.avatarUrl,
        departmentId: formData.departmentId,
        teamId: formData.teamId,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
      });

      const newEmp = {
        id: data.id,
        employeeCode: data.employee?.employeeCode || data.employeeCode || "",
        fullName: data.employee?.fullName || `${firstName} ${lastName}`.trim(),
        name: data.employee?.fullName || `${firstName} ${lastName}`.trim(),
        email: data.email,
        phone: data.employee?.phone || null,
        role: this.resolveRoleName(data.role),
        departmentId: data.departmentId || null,
        teamId: data.teamId || null,
        isActive: data.isActive ?? true,
        createdAt: data.createdAt,
        avatarUrl: data.employee?.avatarUrl || this.getAvatarForName(data.employee?.fullName || `${firstName} ${lastName}`.trim()),
        title: data.employee?.title || "",
      };

      return createApiResponseSuccess(newEmp, "Employee profile registered successfully");
    } catch (err) {
      const locale = this.getLocale();
      const readable = TaskErrorHandler.getReadableMessage(err, locale);
      return createApiResponseError(readable);
    }
  }

  /**
   * Update an employee in PostgreSQL.
   */
  static async updateEmployee(id: string, updates: Partial<EmployeeValidationInput>): Promise<ApiResponse<Employee>> {
    try {
      // Validate schema parameters prior to API patch
      const validation = employeeValidationSchema.partial().safeParse(updates);
      if (!validation.success) {
        throw new Error(validation.error.issues[0]?.message || "Validation failed.");
      }

      const body: Record<string, unknown> = {};
      if (updates.fullName !== undefined) {
        const names = updates.fullName.trim().split(/\s+/);
        body.fullName = updates.fullName.trim();
        body.firstName = names[0] || "";
        body.lastName = names.slice(1).join(" ") || "";
      }
      if (updates.email !== undefined) body.email = updates.email;
      if (updates.role !== undefined) body.role = updates.role;
      if (updates.title !== undefined) body.title = updates.title;
      if (updates.phone !== undefined) body.phone = updates.phone;
      if (updates.avatarUrl !== undefined) body.avatarUrl = updates.avatarUrl;
      if (updates.departmentId !== undefined) body.departmentId = updates.departmentId;
      if (updates.teamId !== undefined) body.teamId = updates.teamId;
      if (updates.isActive !== undefined) body.isActive = updates.isActive;

      console.log("Sending update to backend:", { id, body });
      const data = await apiPatch<BackendEmployee>(`/employees/${id}`, body);
      console.log("Received update from backend:", data);

      const updated = {
        id: data.id,
        employeeCode: data.employee?.employeeCode || data.employeeCode || "",
        fullName: data.employee?.fullName || `${data.employee?.firstName} ${data.employee?.lastName}`.trim(),
        name: data.employee?.fullName || `${data.employee?.firstName} ${data.employee?.lastName}`.trim(),
        email: data.email,
        phone: data.employee?.phone || null,
        role: this.resolveRoleName(data.role),
        departmentId: data.departmentId || null,
        teamId: data.teamId || null,
        isActive: data.isActive ?? true,
        createdAt: data.createdAt,
        avatarUrl: data.employee?.avatarUrl || this.getAvatarForName(data.employee?.fullName || data.email),
        title: data.employee?.title || "",
      };

      return createApiResponseSuccess(updated, "Employee profile updated successfully");
    } catch (err) {
      const locale = this.getLocale();
      const readable = TaskErrorHandler.getReadableMessage(err, locale);
      return createApiResponseError(readable);
    }
  }

  /**
   * Deactivate/Soft-delete an employee in PostgreSQL (Admin/Super Admin only).
   */
  static async deactivateEmployee(id: string): Promise<ApiResponse<boolean>> {
    try {
      await apiDelete<{ success: boolean }>(`/employees/${id}`);
      return createApiResponseSuccess(true, "Employee account deactivated successfully");
    } catch (err) {
      const locale = this.getLocale();
      const readable = TaskErrorHandler.getReadableMessage(err, locale);
      return createApiResponseError(readable);
    }
  }
}
