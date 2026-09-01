/**
 * =============================================================================
 * FRONTEND DEPARTMENT & TEAM LOOKUPS SERVICE
 * Project: Employee Task Manager (Enterprise Edition)
 * Role: Lookup Metadata REST Proxy Client
 * 
 * Description:
 * Interacts with system metadata endpoints to retrieve organizational lists
 * (departments, teams) for populating dashboard filters and edit form dropdowns.
 * =============================================================================
 */

import { apiGet } from "@/lib/axios";
import { ApiResponse } from "../types/response.types";
import { createApiResponseSuccess, createApiResponseError } from "@/utils/apiResponse";

export class DepartmentService {
  /**
   * Retrieves active department nodes list for selection options.
   */
  static async getDepartments(): Promise<ApiResponse<any[]>> {
    try {
      const list = await apiGet<any[]>("/departments");
      return createApiResponseSuccess(list, "Departments loaded successfully");
    } catch (err: any) {
      return createApiResponseError(err.message || "Failed to load departments");
    }
  }

  /**
   * Retrieves active team nodes list.
   */
  static async getTeams(): Promise<ApiResponse<any[]>> {
    try {
      const list = await apiGet<any[]>("/teams");
      return createApiResponseSuccess(list, "Teams loaded successfully");
    } catch (err: any) {
      return createApiResponseError(err.message || "Failed to load teams");
    }
  }
}
