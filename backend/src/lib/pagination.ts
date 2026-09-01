/**
 * src/lib/pagination.ts
 * Server-side pagination utilities for all list endpoints.
 * Supports both offset-based (page/pageSize) and cursor-based pagination.
 */

export interface PaginationParams {
  page?: number;
  pageSize?: number;
  cursor?: string;
}

export interface PaginationResult<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
    nextCursor: string | null;
  };
}

export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 1000;

/**
 * Parses and validates pagination parameters from URL search params.
 */
export function parsePaginationParams(searchParams: URLSearchParams): {
  skip: number;
  take: number;
  page: number;
  pageSize: number;
} {
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10) || 1);
  const pageSize = Math.min(
    MAX_PAGE_SIZE,
    Math.max(1, parseInt(searchParams.get("pageSize") ?? String(DEFAULT_PAGE_SIZE), 10) || DEFAULT_PAGE_SIZE)
  );
  return {
    skip: (page - 1) * pageSize,
    take: pageSize,
    page,
    pageSize,
  };
}

/**
 * Builds a PaginationResult from raw Prisma results.
 */
export function buildPaginationResult<T extends { id: string }>(
  data: T[],
  total: number,
  page: number,
  pageSize: number
): PaginationResult<T> {
  const totalPages = Math.ceil(total / pageSize);
  const hasNextPage = page < totalPages;
  const lastItem = data[data.length - 1];

  return {
    data,
    meta: {
      total,
      page,
      pageSize,
      totalPages,
      hasNextPage,
      hasPrevPage: page > 1,
      nextCursor: hasNextPage && lastItem ? lastItem.id : null,
    },
  };
}
