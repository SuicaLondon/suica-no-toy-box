import type { ReactNode } from "react";

type PreviewStatProps = {
  label: string;
  value: ReactNode;
  /** A muted line under the value, such as how much smaller the file got. */
  note?: string;
};

/**
 * One figure under the preview: a label beside its value on phones, above it
 * from the sm breakpoint.
 */
export function PreviewStat({ label, value, note }: PreviewStatProps) {
  return (
    <div className="grid-cols-stat grid items-start gap-x-2 text-right sm:block sm:min-h-16 sm:text-left">
      <p className="text-toy-muted text-xs">{label}</p>
      <p className="mt-1 text-sm font-medium">{value}</p>
      {note === undefined ? null : (
        <p className="text-toy-muted col-start-2 mt-1 text-xs">{note}</p>
      )}
    </div>
  );
}
