import { useDBStore } from "../store/dbStore";
import { en } from "../i18n/en";
import { ar } from "../i18n/ar";

export const useTranslation = () => {
  const currentLanguage = useDBStore((state) => state.currentLanguage);
  
  const t = currentLanguage === "ar" ? ar : en;
  const isRtl = currentLanguage === "ar";
  const dir = isRtl ? "rtl" : "ltr";

  return { t, currentLanguage, isRtl, dir };
};
export type UseTranslationReturn = ReturnType<typeof useTranslation>;
