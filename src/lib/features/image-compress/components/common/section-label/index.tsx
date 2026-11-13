import { cn } from "@/utils/cn";
import type { ComponentProps } from "react";

/** A section heading in the studio, such as "Source image". */
export function SectionLabel({ className, ...props }: ComponentProps<"p">) {
  return (
    <p
      className={cn(
        "text-toy-muted font-mono text-xs tracking-widest uppercase",
        className,
      )}
      {...props}
    />
  );
}
