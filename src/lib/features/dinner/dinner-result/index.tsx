import { Card, CardTitle, CardDescription } from "suica-ui/card";
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
    <Card className="p-6 max-[520px]:p-[18px]" aria-live="polite">
      <CardDescription>{label}</CardDescription>
      <CardTitle
        level={2}
        className="mt-2 block text-[clamp(1.5rem,3vw,2.25rem)] leading-[1.15] tracking-[-0.035em]"
      >
        {prefix} {result}
      </CardTitle>
    </Card>
  );
});
