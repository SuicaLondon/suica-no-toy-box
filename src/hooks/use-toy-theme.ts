"use client";

import { getNextTheme, isDarkTheme } from "@/utils/theme";
import { useTheme } from "next-themes";

export function useToyTheme() {
  const { resolvedTheme, setTheme } = useTheme();
  const isDark = isDarkTheme(resolvedTheme);

  return {
    isDark,
    toggleTheme: () => setTheme(getNextTheme(resolvedTheme)),
  };
}
