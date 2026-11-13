import { cn } from "@/utils/cn";
import type { ReactNode } from "react";

type Side = "left" | "right";

const SIDE: Record<Side, string> = {
  left: "left-3",
  right: "right-3",
};

/** A label on top of the preview image: the original, or the result. */
export function PreviewBadge({
  side,
  children,
}: {
  side: Side;
  children: ReactNode;
}) {
  return (
    <span
      className={cn(
        "pointer-events-none absolute top-3 rounded-sm bg-black/65 px-2 py-1 text-xs text-white",
        SIDE[side],
      )}
    >
      {children}
    </span>
  );
}
