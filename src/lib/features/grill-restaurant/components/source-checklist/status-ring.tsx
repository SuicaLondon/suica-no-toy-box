import { cn } from "@/utils/cn";

type RingStatus = "running" | "waiting";

/** Green with a gap and turning while running; dashed and muted while waiting. */
const RING: Record<RingStatus, string> = {
  running:
    "border-toy-accent animate-toy-spin border-r-transparent motion-reduce:animate-none",
  waiting: "border-toy-muted border-dashed",
};

/** A 14px ring in the status mark's 16px box. */
export function StatusRing({ status }: { status: RingStatus }) {
  return (
    <span
      className="grid size-4 shrink-0 place-items-center"
      aria-hidden="true"
    >
      <span
        className={cn("block size-3.5 rounded-full border-2", RING[status])}
      />
    </span>
  );
}
