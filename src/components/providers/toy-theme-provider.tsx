"use client";

import { TOY_THEME } from "@/constants/theme";
import { ThemeProvider } from "next-themes";
import type { ReactNode } from "react";

interface ToyThemeProviderProps {
  children: ReactNode;
}

export function ToyThemeProvider({ children }: ToyThemeProviderProps) {
  return (
    <ThemeProvider
      attribute={TOY_THEME.attribute}
      defaultTheme="system"
      enableSystem
      storageKey={TOY_THEME.storageKey}
      disableTransitionOnChange
    >
      {children}
    </ThemeProvider>
  );
}
