"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import styles from "../home.module.css";

type ToyThemeToggleProps = {
  switchToDarkLabel: string;
  switchToLightLabel: string;
};

export function ToyThemeToggle({
  switchToDarkLabel,
  switchToLightLabel,
}: ToyThemeToggleProps) {
  const { resolvedTheme, setTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const nextTheme = isDark ? "light" : "dark";
  const label = isDark ? switchToLightLabel : switchToDarkLabel;

  return (
    <button
      type="button"
      className={styles.themeToggle}
      onClick={() => setTheme(nextTheme)}
      aria-label={label}
      aria-pressed={isDark}
      title={label}
    >
      <Sun className={styles.sunIcon} aria-hidden="true" />
      <Moon className={styles.moonIcon} aria-hidden="true" />
    </button>
  );
}
