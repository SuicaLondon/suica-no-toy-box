import { cn } from "@/utils/cn";
import type { ComponentProps } from "react";

/** A native select in the settings panel. */
export function FieldSelect({ className, ...props }: ComponentProps<"select">) {
  return (
    <select
      className={cn(
        "border-toy-line bg-background focus-visible:outline-toy-accent w-full rounded-md border px-3 text-sm focus-visible:outline-2 focus-visible:outline-offset-2",
        className,
      )}
      {...props}
    />
  );
}
