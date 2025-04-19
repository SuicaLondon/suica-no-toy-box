import { ChevronLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";
import { YearSelect } from "./year-select";
import { memo } from "react";
import { format } from "date-fns";

type CalendarNavigatorProps = {
  currentDate: Date;
  handleMonthChange: (months: number) => void;
  handleYearChange: (year: number) => void;
};

export const CalendarNavigator = memo(function CalendarNavigator({
  currentDate,
  handleMonthChange,
  handleYearChange,
}: CalendarNavigatorProps) {
  return (
    <div className="flex min-w-[250px] items-center justify-between gap-2">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={() => handleMonthChange(-1)}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      <span className="text-sm">{format(currentDate, "MMMM")}</span>
      <YearSelect
        currentDate={currentDate}
        handleYearChange={handleYearChange}
      />
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={() => handleMonthChange(1)}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
});
