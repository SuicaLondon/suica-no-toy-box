import { cn } from "@/utils/cn";
import type { ReactNode } from "react";

type DataTextProps = {
  children: ReactNode;
  /** A date's machine-readable value: the text is then a time element. */
  dateTime?: string;
  className?: string;
};

/** Figures beside a result, in the Data role: dates, ratings, counts. */
export function DataText({ children, dateTime, className }: DataTextProps) {
  const classes = cn(
    "text-data text-toy-muted font-mono tabular-nums",
    className,
  );
  if (dateTime) {
    return (
      <time dateTime={dateTime} className={classes}>
        {children}
      </time>
    );
  }
  return <span className={classes}>{children}</span>;
}
