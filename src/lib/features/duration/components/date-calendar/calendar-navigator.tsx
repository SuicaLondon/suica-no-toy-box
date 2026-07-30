import { Button } from "@/components/ui/button";
import { useToolI18n } from "@/i18n/tool-i18n";
import { format } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { memo, RefObject } from "react";
import { getDurationDateLocale } from "../../date-locale";
import styles from "../../duration.module.css";
import { YearSelect } from "./year-select";

type CalendarNavigatorProps = {
  portalContainerRef?: RefObject<HTMLDivElement | null>;
  currentDate: Date;
  handleMonthChange: (months: number) => void;
  handleYearChange: (year: number) => void;
};

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
    <div className={styles.calendarNavigator}>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className={styles.menuTrigger}
        onClick={() => handleMonthChange(-1)}
        aria-label={durationCopy.previousMonth}
      >
        <ChevronLeft aria-hidden="true" />
      </Button>
      <span className={styles.calendarMonthLabel}>
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
        className={styles.menuTrigger}
        onClick={() => handleMonthChange(1)}
        aria-label={durationCopy.nextMonth}
      >
        <ChevronRight aria-hidden="true" />
      </Button>
    </div>
  );
});
