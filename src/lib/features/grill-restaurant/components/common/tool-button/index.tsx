import { cn } from "@/utils/cn";
import type { ComponentProps } from "react";
import { Button } from "suica-ui/button";

/**
 * suica-ui's Button with its label in the Button type role. It uses the
 * built-in text-xs, which suica-ui's own class merging understands, rather
 * than a theme text token.
 */
export function ToolButton({
  className,
  ...props
}: ComponentProps<typeof Button>) {
  return (
    <Button
      className={cn("tracking-button font-mono text-xs uppercase", className)}
      {...props}
    />
  );
}
