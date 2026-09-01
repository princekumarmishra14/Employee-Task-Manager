/**
 * src/lib/errors.ts
 * Typed error classes for the service/repository layer.
 * API routes catch these and map them to HTTP status codes.
 */

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(message: string, statusCode = 500, isOperational = true) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string, id?: string) {
    super(id ? `${resource} with id '${id}' not found.` : `${resource} not found.`, 404);
  }
}

export class ValidationError extends AppError {
  public readonly fields?: Record<string, string[]>;
  constructor(message: string, fields?: Record<string, string[]>) {
    super(message, 400);
    this.fields = fields;
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, 409);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = "Authentication required. Please log in.") {
    super(message, 401);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = "You do not have permission to perform this action.") {
    super(message, 403);
  }
}

export class RateLimitError extends AppError {
  constructor() {
    super("Too many requests. Please try again later.", 429);
  }
}

/**
 * Maps any error to a consistent { message, statusCode } tuple.
 * Sensitive internal errors are masked in production.
 */
export function toHttpError(error: unknown): { message: string; statusCode: number } {
  if (error instanceof AppError) {
    return { message: error.message, statusCode: error.statusCode };
  }
  // Log internal errors but never expose stack traces to clients
  const message =
    process.env.NODE_ENV === "development"
      ? (error instanceof Error ? error.message : "Unknown error")
      : "An internal server error occurred. Please try again.";
  return { message, statusCode: 500 };
}
