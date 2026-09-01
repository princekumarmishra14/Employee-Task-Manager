export const ERROR_CODES = {
  INTERNAL_SERVER_ERROR: "INTERNAL_SERVER_ERROR",
  UNAUTHORIZED: "UNAUTHORIZED",
  BAD_REQUEST: "BAD_REQUEST",
  SERVICE_UNAVAILABLE: "SERVICE_UNAVAILABLE",
  NOT_FOUND: "NOT_FOUND",
};

export const ERROR_MESSAGES = {
  [ERROR_CODES.INTERNAL_SERVER_ERROR]: {
    en: "An internal server error occurred. Please try again later.",
    ar: "حدث خطأ داخلي في الخادم. يرجى المحاولة مرة أخرى لاحقاً.",
  },
  [ERROR_CODES.UNAUTHORIZED]: {
    en: "You are not authorized to perform this operation.",
    ar: "غير مصرح لك بإجراء هذه العملية.",
  },
  [ERROR_CODES.BAD_REQUEST]: {
    en: "Invalid request payload or parameters.",
    ar: "بيانات الطلب غير صالحة.",
  },
  [ERROR_CODES.SERVICE_UNAVAILABLE]: {
    en: "The server is currently unavailable. Retry soon.",
    ar: "الخادم غير متوفر حالياً. أعد المحاولة قريباً.",
  },
  [ERROR_CODES.NOT_FOUND]: {
    en: "Requested task or resource could not be found.",
    ar: "تعذر العثور على المهمة أو المورد المطلوب.",
  },
};
