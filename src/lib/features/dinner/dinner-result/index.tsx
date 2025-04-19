import { memo } from "react";

type DinnerResultProps = {
  result: string;
};

export const DinnerResult = memo(function DinnerResult({
  result,
}: DinnerResultProps) {
  return (
    <div className="inset-0 flex items-center justify-center">
      <div className="bg-primary/10 rounded-lg p-4 text-center">
        <p className="text-lg font-medium">Tonight, We are going to eat:</p>
        <p className="text-primary mt-2 text-2xl font-bold">{result}</p>
      </div>
    </div>
  );
});
