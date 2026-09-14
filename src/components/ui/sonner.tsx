"use client";

import { useToyTheme } from "@/hooks/use-toy-theme";
import { Toaster as Sonner, ToasterProps } from "sonner";

const Toaster = ({ ...props }: ToasterProps) => {
  const { isDark } = useToyTheme();

  return (
    <Sonner
      theme={isDark ? "dark" : "light"}
      className="toaster group"
      style={
        {
          "--normal-bg": "var(--sui-theme-surface-elevated)",
          "--normal-text": "var(--sui-theme-foreground)",
          "--normal-border": "var(--sui-theme-line)",
        } as React.CSSProperties
      }
      {...props}
    />
  );
};

export { Toaster };
