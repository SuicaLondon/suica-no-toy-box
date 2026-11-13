import { cn } from "@/utils/cn";
import type { ComponentProps } from "react";

/**
 * A link to the converted image. Until there is a result to open it is
 * dimmed, skipped by the keyboard and announced as disabled.
 */
export function ResultLink({ href, className, ...props }: ComponentProps<"a">) {
  const ready = Boolean(href);
  return (
    <a
      href={href}
      aria-disabled={!ready}
      tabIndex={ready ? 0 : -1}
      className={cn(className, !ready && "pointer-events-none opacity-40")}
      {...props}
    />
  );
}
