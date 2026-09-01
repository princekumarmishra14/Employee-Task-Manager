"use client";

import React from "react";
import { Sun, Moon, Monitor } from "lucide-react";
import { useTheme, Theme } from "@/hooks/use-theme";
import { useTranslation } from "@/hooks/useTranslation";

export default function ThemeToggle() {
  const { theme, setTheme, mounted } = useTheme();
  const { t } = useTranslation();

  if (!mounted) {
    return <div className="h-9 w-9 rounded-lg bg-gray-100 dark:bg-gray-800" />;
  }

  const themes: { id: Theme; icon: React.ReactNode; label: string }[] = [
    { id: "light", icon: <Sun className="h-4 w-4" />, label: "Light" },
    { id: "dark", icon: <Moon className="h-4 w-4" />, label: "Dark" },
    { id: "system", icon: <Monitor className="h-4 w-4" />, label: "System" },
  ];

  return (
    <div className="flex items-center space-x-1 rounded-lg bg-gray-100 p-1 dark:bg-gray-800 dir-ltr">
      {themes.map((th) => {
        const isActive = theme === th.id;
        return (
          <button
            key={th.id}
            onClick={() => setTheme(th.id)}
            title={`${t.themeLabel || "Theme"}: ${th.label}`}
            className={`rounded-md p-1.5 transition-all focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer ${
              isActive
                ? "bg-white text-indigo-600 shadow-sm dark:bg-gray-750 dark:text-indigo-400"
                : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
            }`}
          >
            {th.icon}
          </button>
        );
      })}
    </div>
  );
}
