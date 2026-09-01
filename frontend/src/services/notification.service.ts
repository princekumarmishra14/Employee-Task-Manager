/**
 * frontend/src/services/notification.service.ts
 * Consolidated service for notifications.
 */

import { apiGet } from "@/lib/axios";
import { ApiResponse } from "../types/response.types";
import { createApiResponseSuccess, createApiResponseError } from "@/utils/apiResponse";

export class NotificationService {
  static async getNotifications(): Promise<ApiResponse<any[]>> {
    try {
      const list = await apiGet<any[]>("/notifications");
      return createApiResponseSuccess(list, "Notifications loaded successfully");
    } catch (err: any) {
      return createApiResponseError(err.message || "Failed to load notifications");
    }
  }
}
