"use client";

import type { ReactNode } from "react";
import { QueryProvider } from "./query-provider";
import { ToyThemeProvider } from "./toy-theme-provider";

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <QueryProvider>
      <ToyThemeProvider>{children}</ToyThemeProvider>
    </QueryProvider>
  );
}
