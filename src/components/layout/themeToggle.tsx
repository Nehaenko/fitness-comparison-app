"use client";

import { useSyncExternalStore } from "react";

import Icon from "@/components/layout/actionComponents/iconComponent";

type Theme = "light" | "dark";

const THEME_STORAGE_KEY = "forma:theme";
const THEME_CHANGE_EVENT = "forma-theme-change";
const THEME_COLORS: Record<Theme, string> = {
  light: "#f6f6f3",
  dark: "#09100c",
};

function getTheme(): Theme {
  if (typeof document === "undefined") return "light";
  return document.documentElement.dataset.theme === "dark" ? "dark" : "light";
}

function subscribe(onStoreChange: () => void) {
  window.addEventListener(THEME_CHANGE_EVENT, onStoreChange);
  return () => window.removeEventListener(THEME_CHANGE_EVENT, onStoreChange);
}

export default function ThemeToggle({ compact = false }: { compact?: boolean }) {
  const theme = useSyncExternalStore(subscribe, getTheme, () => "light");
  const isDark = theme === "dark";

  const toggleTheme = () => {
    const nextTheme: Theme = getTheme() === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = nextTheme;
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute("content", THEME_COLORS[nextTheme]);
    window.localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
    window.dispatchEvent(new Event(THEME_CHANGE_EVENT));
  };

  if (compact) {
    return (
      <button
        type="button"
        onClick={toggleTheme}
        aria-label={`Switch to ${isDark ? "light" : "dark"} theme`}
        title={`Switch to ${isDark ? "light" : "dark"} theme`}
        className="grid size-10 place-items-center rounded-control border border-border bg-surface text-primary transition hover:bg-surface-subtle focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
      >
        <Icon name={isDark ? "sun" : "moon"} className="size-5" strokeWidth={1.5} />
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-pressed={isDark}
      className="flex min-h-12 w-full items-center gap-4 rounded-control px-3 text-left font-semibold text-primary transition hover:bg-surface-subtle focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
    >
      <Icon name={isDark ? "sun" : "moon"} className="size-6" strokeWidth={1.25} />
      <span className="flex-1">{isDark ? "Light mode" : "Dark mode"}</span>
      <span
        aria-hidden="true"
        className={`flex h-6 w-11 items-center rounded-pill p-0.5 transition ${isDark ? "bg-brand" : "bg-surface-muted"}`}
      >
        <span
          className={`size-5 rounded-full bg-surface shadow-card transition-transform ${isDark ? "translate-x-5" : "translate-x-0"}`}
        />
      </span>
    </button>
  );
}
