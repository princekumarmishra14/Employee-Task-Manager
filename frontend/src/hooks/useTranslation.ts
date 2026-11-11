"use client";

import { useEffect, useState } from "react";
import { useDBStore } from "../store/dbStore";
import { en } from "../i18n/en";
import { ar } from "../i18n/ar";

export const useTranslation = () => {
  const storedLanguage = useDBStore((state) => state.currentLanguage);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // During SSR and initial client hydration, always match the server default ('en')
  // to avoid React hydration mismatch error #418. Once mounted on the client,
  // apply the user's persisted language selection.
  const currentLanguage = mounted ? storedLanguage : "en";
  const t = currentLanguage === "ar" ? ar : en;
  const isRtl = currentLanguage === "ar";
  const dir = isRtl ? "rtl" : "ltr";

  return { t, currentLanguage, isRtl, dir, mounted };
};
export type UseTranslationReturn = ReturnType<typeof useTranslation>;
