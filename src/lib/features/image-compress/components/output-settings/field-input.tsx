import { cn } from "@/utils/cn";
import type { ComponentProps } from "react";

/** A native input in the settings panel, styled like its selects. */
export function FieldInput({ className, ...props }: ComponentProps<"input">) {
  return (
    <input
      className={cn(
        "border-toy-line bg-background focus-visible:outline-toy-accent w-full rounded-md border px-3 text-sm focus-visible:outline-2 focus-visible:outline-offset-2",
        className,
      )}
      {...props}
    />
  );
}
