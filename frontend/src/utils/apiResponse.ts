import { ApiResponse } from "../types/response.types";

export function createApiResponseSuccess<T>(data: T, message?: string): ApiResponse<T> {
  return {
    success: true,
    data,
    message,
  };
}

export function createApiResponseError<T = unknown>(error: string, message?: string): ApiResponse<T> {
  return {
    success: false,
    error,
    message,
  };
}
