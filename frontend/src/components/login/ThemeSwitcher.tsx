"use client";

import React from "react";
import { Sun, Moon, Monitor } from "lucide-react";
import { useTheme, Theme } from "@/hooks/use-theme";

export default function ThemeSwitcher() {
  const { theme, setTheme, mounted } = useTheme();

  if (!mounted) {
    return <div className="h-7 w-20 rounded-lg bg-bg-secondary animate-pulse" />;
  }

  const themes: { id: Theme; icon: React.ComponentType<any>; label: string }[] = [
    { id: "light", icon: Sun, label: "Light" },
    { id: "dark", icon: Moon, label: "Dark" },
    { id: "system", icon: Monitor, label: "System" },
  ];

  return (
    <div className={`flex items-center gap-0.5 bg-bg-secondary dark:bg-bg-tertiary p-1 border border-border-clean rounded-xl dir-ltr select-none`}>
      {themes.map((th) => {
        const Icon = th.icon;
        const isActive = theme === th.id;
        return (
          <button
            key={th.id}
            type="button"
            onClick={() => setTheme(th.id)}
            title={`Theme: ${th.label}`}
            aria-label={`Switch theme to ${th.label}`}
            className={`rounded-md p-1 transition-all focus:outline-none focus:ring-1 focus:ring-brand-primary cursor-pointer ${
              isActive
                ? "bg-white text-brand-primary shadow-sm dark:bg-bg-primary dark:text-brand-secondary"
                : "text-text-muted hover:text-text-primary"
            }`}
          >
            <Icon className="h-3 w-3" />
          </button>
        );
      })}
    </div>
  );
}
