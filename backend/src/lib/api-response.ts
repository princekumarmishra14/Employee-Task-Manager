/**
 * src/lib/api-response.ts
 * Standardized API response helpers for Express route handlers.
 * Ensures consistent JSON envelope: { success, data?, error?, meta? }
 */

import { Response } from "express";
import { toHttpError } from "./errors";

export interface ApiMeta {
  total?: number;
  page?: number;
  pageSize?: number;
  hasNextPage?: boolean;
  nextCursor?: string | null;
}

export interface ApiResponsePayload<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  meta?: ApiMeta;
  fields?: Record<string, string[]>;
}

export function successResponse<T>(
  data: T,
  meta?: ApiMeta,
  status?: number
): { status: number; body: ApiResponsePayload<T> };
export function successResponse<T>(
  res: Response,
  data: T,
  meta?: ApiMeta,
  status?: number
): Response;
export function successResponse<T>(
  resOrData: Response | T,
  dataOrMeta?: T | ApiMeta,
  metaOrStatus?: ApiMeta | number,
  status = 200
): Response | { status: number; body: ApiResponsePayload<T> } {
  if (
    resOrData &&
    typeof (resOrData as Response).status === "function" &&
    typeof (resOrData as Response).json === "function"
  ) {
    const res = resOrData as Response;
    const data = dataOrMeta as T;
    const meta = metaOrStatus as ApiMeta | undefined;
    const statusCode = typeof status === "number" ? status : 200;
    return res.status(statusCode).json({
      success: true,
      data,
      ...(meta ? { meta } : {}),
    });
  }

  const data = resOrData as T;
  const meta = dataOrMeta as ApiMeta | undefined;
  const statusCode = typeof metaOrStatus === "number" ? metaOrStatus : 200;
  return {
    status: statusCode,
    body: {
      success: true,
      data,
      ...(meta ? { meta } : {}),
    },
  };
}

export function createdResponse<T>(
  data: T
): { status: number; body: ApiResponsePayload<T> };
export function createdResponse<T>(res: Response, data: T): Response;
export function createdResponse<T>(
  resOrData: Response | T,
  data?: T
): Response | { status: number; body: ApiResponsePayload<T> } {
  if (
    resOrData &&
    typeof (resOrData as Response).status === "function" &&
    typeof (resOrData as Response).json === "function"
  ) {
    return (resOrData as Response).status(201).json({ success: true, data });
  }
  return {
    status: 201,
    body: { success: true, data: resOrData as T },
  };
}

export function noContentResponse(): { status: number };
export function noContentResponse(res: Response): Response;
export function noContentResponse(res?: Response): Response | { status: number } {
  if (res && typeof res.status === "function" && typeof res.send === "function") {
    return res.status(204).send();
  }
  return { status: 204 };
}

export function errorResponse(
  message: string,
  status?: number,
  details?: Record<string, string[]>
): { status: number; body: ApiResponsePayload<never> };
export function errorResponse(
  res: Response,
  message: string,
  status?: number,
  details?: Record<string, string[]>
): Response;
export function errorResponse(
  resOrMessage: Response | string,
  messageOrStatus?: string | number,
  statusOrDetails?: number | Record<string, string[]>,
  details?: Record<string, string[]>
): Response | { status: number; body: ApiResponsePayload<never> } {
  if (
    typeof resOrMessage !== "string" &&
    resOrMessage &&
    typeof resOrMessage.status === "function"
  ) {
    const res = resOrMessage;
    const message = (messageOrStatus as string) || "An unexpected error occurred.";
    const statusCode = typeof statusOrDetails === "number" ? statusOrDetails : 500;
    const fields = details;
    return res.status(statusCode).json({
      success: false,
      error: message,
      ...(fields ? { fields } : {}),
    });
  }

  const message = resOrMessage as string;
  const statusCode = typeof messageOrStatus === "number" ? messageOrStatus : 500;
  const fields = statusOrDetails as Record<string, string[]> | undefined;
  return {
    status: statusCode,
    body: {
      success: false,
      error: message,
      ...(fields ? { fields } : {}),
    },
  };
}

/**
 * Wraps an Express route handler, catching uncaught errors and converting them
 * to standardized error responses.
 */
export function withErrorHandler(
  handler: (res: Response, ...args: any[]) => Promise<any>
) {
  return async (res: Response, ...args: any[]) => {
    try {
      return await handler(res, ...args);
    } catch (err: unknown) {
      const { message, statusCode } = toHttpError(err);
      if (statusCode >= 500) {
        console.error("[API Error]", err);
      }
      return errorResponse(res, message, statusCode);
    }
  };
}
