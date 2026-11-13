import { cn } from "@/utils/cn";
import type { ComponentProps } from "react";

/** A small green text button, such as "Show all" or "Show original". */
export function TextButton({ className, ...props }: ComponentProps<"button">) {
  return (
    <button
      type="button"
      className={cn(
        "text-toy-accent text-data block cursor-pointer bg-transparent p-0 font-mono underline decoration-1 underline-offset-4 hover:decoration-2",
        className,
      )}
      {...props}
    />
  );
}
