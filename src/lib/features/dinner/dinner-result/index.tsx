import { memo } from "react";

interface DinnerResultProps {
  result: string;
  label: string;
  prefix: string;
}

export const DinnerResult = memo(function DinnerResult({
  result,
  label,
  prefix,
}: DinnerResultProps) {
  return (
    <div
      className="border-toy-line text-toy-text rounded-[2px] border bg-[color-mix(in_srgb,var(--toy-bg)_96%,transparent)] p-6 max-[520px]:p-[18px]"
      aria-live="polite"
    >
      <span className="text-toy-accent font-mono text-[0.6875rem] font-medium tracking-[0.12em] uppercase">
        {label}
      </span>
      <strong className="mt-2 block text-[clamp(1.5rem,3vw,2.25rem)] leading-[1.15] tracking-[-0.035em]">
        {prefix} {result}
      </strong>
    </div>
  );
});
