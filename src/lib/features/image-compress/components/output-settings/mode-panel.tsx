import { cn } from "@/utils/cn";
import type { ReactNode } from "react";

type ModePanelProps = {
  /** The chosen mode's panel; the other is hidden and disabled. */
  active: boolean;
  children: ReactNode;
};

/**
 * One mode's settings. The mode panels share one grid cell, so switching
 * never shifts the layout.
 */
export function ModePanel({ active, children }: ModePanelProps) {
  return (
    <fieldset
      disabled={!active}
      aria-hidden={!active}
      className={cn(
        "col-start-1 row-start-1 grid content-start gap-3",
        !active && "invisible",
      )}
    >
      {children}
    </fieldset>
  );
}
