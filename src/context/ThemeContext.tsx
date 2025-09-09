"use client";
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

export type ThemeMode = "light" | "dark";

type ThemeContextType = {
  theme: ThemeMode;
  setTheme: (mode: ThemeMode) => void;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

function applyThemeClass(mode: ThemeMode) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  if (mode === "dark") root.classList.add("dark");
  else root.classList.remove("dark");
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeMode>("light");

  useEffect(() => {
    try {
      const saved = (localStorage.getItem("theme") as ThemeMode | null) ?? null;
      const mediaDark = window.matchMedia?.("(prefers-color-scheme: dark)").matches ?? false;
      const initial: ThemeMode = saved ?? (mediaDark ? "dark" : "light");
      setThemeState(initial);
      applyThemeClass(initial);
    } catch {
      applyThemeClass("light");
    }
  }, []);

  const setTheme = useCallback((mode: ThemeMode) => {
    setThemeState(mode);
    applyThemeClass(mode);
    try {
      localStorage.setItem("theme", mode);
    } catch {
      /* noop */
    }
  }, []);

  const toggleTheme = useCallback(() => {
    const next: ThemeMode = theme === "dark" ? "light" : "dark";
    setTheme(next);
  }, [theme, setTheme]);

  const value = useMemo(
    () => ({ theme, setTheme, toggleTheme }),
    [theme, setTheme, toggleTheme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextType {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme deve ser usado dentro de <ThemeProvider>");
  return ctx;
}
