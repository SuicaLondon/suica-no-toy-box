import { cn } from "@/utils/cn";
import Link from "next/link";
import type { ComponentProps } from "react";

/** A link in the header: a 40px touch target, 44px on phones. */
export function NavLink({ className, ...props }: ComponentProps<typeof Link>) {
  return (
    <Link
      className={cn(
        "hover:text-toy-accent flex min-h-10 shrink-0 items-center gap-1.5 transition-colors duration-180 motion-reduce:transition-none max-md:min-h-11",
        className,
      )}
      {...props}
    />
  );
}
