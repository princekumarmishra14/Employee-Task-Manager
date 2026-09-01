import axios from "axios";
import { ApiError } from "../utils/apiErrors";
import { ERROR_CODES, ERROR_MESSAGES } from "../constants/error.constants";

export class TaskErrorHandler {
  /**
   * Parses any thrown exception and returns a localized, readable error message.
   */
  static getReadableMessage(error: unknown, locale: "en" | "ar" = "en"): string {
    if (axios.isAxiosError(error)) {
      const data = error.response?.data as { message?: string; error?: string } | undefined;
      return data?.message || data?.error || error.message || "A network error occurred.";
    }

    if (error instanceof ApiError) {
      const code = error.errorCode;
      const mapped = ERROR_MESSAGES[code];
      if (mapped) {
        return locale === "ar" ? mapped.ar : mapped.en;
      }
      return error.message;
    }

    if (error instanceof Error) {
      return error.message;
    }

    return locale === "ar" 
      ? "حدث خطأ غير متوقع. يرجى المحاولة لاحقاً." 
      : "An unexpected error occurred. Please try again later.";
  }
}

