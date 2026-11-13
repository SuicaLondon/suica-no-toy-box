import { cn } from "@/utils/cn";
import type { ComponentProps } from "react";
import { Card } from "suica-ui/card";

/** A card whose padding matches the page gutter: 24px, 18px on phones. */
export function PaddedCard({
  className,
  ...props
}: ComponentProps<typeof Card>) {
  return <Card className={cn("p-6 max-md:p-4.5", className)} {...props} />;
}
