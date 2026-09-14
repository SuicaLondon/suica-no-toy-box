import { Button } from "suica-ui/button";
import { Badge } from "suica-ui/badge";
import { memo } from "react";

interface DinnerSelectionsProps {
  options: string[];
  removeOption: (index: number) => void;
  removeLabel: (option: string) => string;
  disabled?: boolean;
}

export const DinnerSelections = memo(function DinnerSelections({
  options,
  removeOption,
  removeLabel,
  disabled,
}: DinnerSelectionsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option, index) => (
        <Badge
          variant="outline"
          key={`${option}-${index}`}
          className="border-toy-line text-toy-text inline-flex min-h-9 items-center gap-[9px] border bg-transparent py-[7px] pr-2.5 pl-[13px]"
        >
          <span>{option}</span>
          <Button
            variant="ghost"
            size="icon"
            type="button"
            onClick={() => removeOption(index)}
            aria-label={removeLabel(option)}
            title={removeLabel(option)}
            disabled={disabled}
            className="text-toy-muted hover:text-toy-accent inline-flex size-6 min-h-0 items-center justify-center p-0"
          >
            <span aria-hidden="true">×</span>
          </Button>
        </Badge>
      ))}
    </div>
  );
});
