import { Button } from "@/components/ui/button";
import { useToolI18n } from "@/i18n/tool-i18n";
import { format } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { memo, RefObject } from "react";
import { getDurationDateLocale } from "../../date-locale";
import { YearSelect } from "./year-select";

interface CalendarNavigatorProps {
  portalContainerRef?: RefObject<HTMLDivElement | null>;
  currentDate: Date;
  handleMonthChange: (months: number) => void;
  handleYearChange: (year: number) => void;
}

export const CalendarNavigator = memo(function CalendarNavigator({
  portalContainerRef,
  currentDate,
  handleMonthChange,
  handleYearChange,
}: CalendarNavigatorProps) {
  const { copy, locale } = useToolI18n();
  const durationCopy = copy.duration;
  const dateLocale = getDurationDateLocale(locale);

  return (
    <div className="grid w-full grid-cols-[40px_minmax(0,1fr)_96px_40px] items-center gap-1.5 max-[420px]:grid-cols-[36px_minmax(0,1fr)_86px_36px] max-[420px]:gap-0.5">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="shrink-0"
        onClick={() => handleMonthChange(-1)}
        aria-label={durationCopy.previousMonth}
      >
        <ChevronLeft aria-hidden="true" />
      </Button>
      <span className="text-center text-sm font-semibold">
        {format(currentDate, "LLLL", { locale: dateLocale })}
      </span>
      <YearSelect
        portalContainerRef={portalContainerRef}
        currentDate={currentDate}
        handleYearChange={handleYearChange}
      />
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="shrink-0"
        onClick={() => handleMonthChange(1)}
        aria-label={durationCopy.nextMonth}
      >
        <ChevronRight aria-hidden="true" />
      </Button>
    </div>
  );
});
