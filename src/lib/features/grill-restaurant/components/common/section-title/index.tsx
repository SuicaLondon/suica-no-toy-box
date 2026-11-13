import { cn } from "@/utils/cn";
import type { ComponentProps } from "react";

/**
 * A heading inside a source's result, set as a small label like the
 * verdict's, so it never reads as part of the text under it.
 */
export function SectionTitle({ className, ...props }: ComponentProps<"h4">) {
  return (
    <h4
      className={cn(
        "text-label text-toy-muted m-0 mt-6 mb-3 font-mono uppercase",
        className,
      )}
      {...props}
    />
  );
}
