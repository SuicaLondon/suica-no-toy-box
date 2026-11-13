import { cn } from "@/utils/cn";
import type { ComponentProps } from "react";

/** A muted note under a control. */
export function Hint({ className, ...props }: ComponentProps<"p">) {
  return (
    <p
      className={cn("text-toy-muted text-xs leading-relaxed", className)}
      {...props}
    />
  );
}
