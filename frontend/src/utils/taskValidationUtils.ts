import { ZodError } from "zod";

/**
 * Maps a ZodError to a simple key-value error dictionary.
 */
export function formatZodErrors(error: ZodError): Record<string, string> {
  const errorMap: Record<string, string> = {};
  
  error.issues.forEach((issue) => {
    const fieldName = issue.path.join(".");
    if (fieldName) {
      errorMap[fieldName] = issue.message;
    }
  });

  return errorMap;
}
