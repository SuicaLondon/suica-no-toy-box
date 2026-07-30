"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useSyncExternalStore } from "react";
import styles from "../home.module.css";

type ToyThemeToggleProps = {
  switchToDarkLabel: string;
  switchToLightLabel: string;
};

function subscribeToTheme(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, {
    attributeFilter: ["data-toy-theme"],
    attributes: true,
  });

  return () => observer.disconnect();
}

function getThemeSnapshot() {
  return document.documentElement.dataset.toyTheme === "dark";
}

function getServerThemeSnapshot() {
  return false;
}

export function ToyThemeToggle({
  switchToDarkLabel,
  switchToLightLabel,
}: ToyThemeToggleProps) {
  const { setTheme } = useTheme();
  const isDark = useSyncExternalStore(
    subscribeToTheme,
    getThemeSnapshot,
    getServerThemeSnapshot,
  );
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
