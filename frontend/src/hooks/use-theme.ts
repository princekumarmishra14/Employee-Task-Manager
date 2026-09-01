import { useEffect, useState } from "react";
import { useThemeStore, Theme } from "../store/theme-store";

export function useTheme() {
  const { theme, setTheme } = useThemeStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const getActiveTheme = (): "light" | "dark" => {
    if (!mounted) return "light"; // Return fallback during SSR
    if (theme === "system") {
      return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    }
    return theme === "dark" ? "dark" : "light";
  };

  return {
    theme,
    setTheme,
    activeTheme: getActiveTheme(),
    isDark: getActiveTheme() === "dark",
    mounted,
  };
}
export type { Theme };
