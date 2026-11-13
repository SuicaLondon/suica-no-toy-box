import { cn } from "@/utils/cn";
import type { ComponentProps } from "react";

/** A muted note under a result, in the Body Small role. */
export function Note({ className, ...props }: ComponentProps<"p">) {
  return (
    <p
      className={cn("text-body-sm text-toy-muted max-w-measure m-0", className)}
      {...props}
    />
  );
}
