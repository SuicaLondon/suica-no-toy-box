"use client";

import { getNextTheme, isDarkTheme } from "@/utils/theme";
import { useTheme } from "next-themes";
import { useSyncExternalStore } from "react";

const subscribe = () => () => {};
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

export function useToyTheme() {
  const { resolvedTheme, setTheme } = useTheme();
  // Keep the server and initial hydration render identical before reading preferences.
  const hydrated = useSyncExternalStore(
    subscribe,
    getClientSnapshot,
    getServerSnapshot,
  );
  const isDark = hydrated && isDarkTheme(resolvedTheme);

  return {
    isDark,
    toggleTheme: () => setTheme(getNextTheme(resolvedTheme)),
  };
}
