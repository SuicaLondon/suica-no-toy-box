import { cn } from "@/utils/cn";
import type { CheckPhase } from "../../view/progress/check-phase";

/** Green while live, ink once done, muted when stopped, red when cut off. */
const BAR_COLOR: Record<CheckPhase, string> = {
  live: "bg-toy-accent",
  done: "bg-toy-text/80",
  lost: "bg-toy-error",
  stopped: "bg-toy-muted",
};

type RunProgressProps = {
  phase: CheckPhase;
  /** 0 to 1. */
  fraction: number;
  /** What the bar means, for screen readers. */
  label: string;
  className?: string;
};

/** The whole check's progress, from how long each source usually takes. */
export function RunProgress({
  phase,
  fraction,
  label,
  className,
}: RunProgressProps) {
  const percent = Math.round(Math.min(1, Math.max(0, fraction)) * 100);
  return (
    <div
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={percent}
      aria-valuetext={label}
      className={cn("bg-toy-text/8 h-1 overflow-hidden rounded-xs", className)}
    >
      <div
        className={cn(
          "h-full rounded-xs transition-all duration-1000 ease-linear motion-reduce:transition-none",
          BAR_COLOR[phase],
        )}
        style={{ width: `${percent}%` }}
      />
    </div>
  );
}
