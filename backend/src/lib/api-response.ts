/**
 * src/lib/api-response.ts
 * Standardized API response helpers for all Next.js route handlers.
 * Ensures consistent JSON envelope: { success, data?, error?, meta? }
 */

import { NextResponse } from "next/server";
import { toHttpError } from "./errors";

export interface ApiMeta {
  total?: number;
  page?: number;
  pageSize?: number;
  hasNextPage?: boolean;
  nextCursor?: string | null;
}

export function successResponse<T>(
  data: T,
  meta?: ApiMeta,
  status = 200
): NextResponse {
  return NextResponse.json(
    { success: true, data, ...(meta ? { meta } : {}) },
    { status }
  );
}

export function createdResponse<T>(data: T): NextResponse {
  return NextResponse.json({ success: true, data }, { status: 201 });
}

export function noContentResponse(): NextResponse {
  return new NextResponse(null, { status: 204 });
}

export function errorResponse(
  message: string,
  status = 500,
  details?: Record<string, string[]>
): NextResponse {
  return NextResponse.json(
    {
      success: false,
      error: message,
      ...(details ? { fields: details } : {}),
    },
    { status }
  );
}

/**
 * Wraps an async route handler, catching all errors and converting them
 * to standardized error responses. Use in every API route:
 *
 *   export const GET = withErrorHandler(async (req) => { ... });
 */
export function withErrorHandler(
  handler: (...args: Parameters<typeof NextResponse.json>[]) => Promise<NextResponse>
) {
  return async (...args: Parameters<typeof NextResponse.json>[]) => {
    try {
      return await handler(...args);
    } catch (err: unknown) {
      const { message, statusCode } = toHttpError(err);
      // Don't log 4xx — those are client errors, not server errors
      if (statusCode >= 500) {
        console.error("[API Error]", err);
      }
      return errorResponse(message, statusCode);
    }
  };
}
