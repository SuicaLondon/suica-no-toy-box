import { memo } from "react";

type DinnerSelectionsProps = {
  cuisines: string[];
  removeCuisine: (index: number) => void;
};

export const DinnerSelections = memo(function DinnerSelections({
  cuisines,
  removeCuisine,
}: DinnerSelectionsProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <h3 className="font-medium">Your Options:</h3>
        <div className="flex flex-wrap gap-2">
          {cuisines.map((cuisine, index) => (
            <div
              key={index}
              className="bg-secondary flex items-center gap-2 rounded-full px-3 py-1"
            >
              <span>{cuisine}</span>
              <button
                onClick={() => removeCuisine(index)}
                className="text-muted-foreground hover:text-foreground text-sm"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
});
