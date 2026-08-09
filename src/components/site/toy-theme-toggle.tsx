"use client";

import { useToyTheme } from "@/hooks/use-toy-theme";
import { Moon, Sun } from "lucide-react";

interface ToyThemeToggleProps {
  switchToDarkLabel: string;
  switchToLightLabel: string;
}

export function ToyThemeToggle({
  switchToDarkLabel,
  switchToLightLabel,
}: ToyThemeToggleProps) {
  const { isDark, toggleTheme } = useToyTheme();
  const label = isDark ? switchToLightLabel : switchToDarkLabel;

  return (
    <button
      type="button"
      className="hover:text-toy-accent flex size-10 shrink-0 cursor-pointer items-center justify-center border-0 bg-transparent text-inherit transition-colors duration-180 motion-reduce:transition-none max-[767px]:h-11 max-[520px]:ml-auto"
      onClick={toggleTheme}
      aria-label={label}
      aria-pressed={isDark}
      title={label}
    >
      {isDark ? (
        <Sun className="size-[18px]" aria-hidden="true" />
      ) : (
        <Moon className="size-[18px]" aria-hidden="true" />
      )}
    </button>
  );
}
