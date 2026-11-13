import { cn } from "@/utils/cn";
import type { ComponentProps } from "react";
import { Input } from "suica-ui/input";

/**
 * A text box in the link box: tall enough to tap, with a green caret, and no
 * autocomplete, capitals or spell check on what is pasted into it.
 */
export function ComposerInput({
  className,
  ...props
}: ComponentProps<typeof Input>) {
  return (
    <Input
      autoComplete="off"
      autoCapitalize="none"
      spellCheck={false}
      className={cn(
        "caret-toy-accent min-h-12 w-full min-w-0 px-3.5",
        className,
      )}
      {...props}
    />
  );
}
