import { Calendar } from "@/components/ui/calendar";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useToolI18n } from "@/i18n/tool-i18n";
import { AddDurationFormValues, DurationFormValues } from "@/schemas/duration";
import { addMonths, setYear, subMonths } from "date-fns";
import { memo, RefObject, useCallback, useEffect, useState } from "react";
import { UseFormReturn, useWatch } from "react-hook-form";
import { getDurationDateLocale } from "../../date-locale";
import styles from "../../duration.module.css";
import { CalendarNavigator } from "./calendar-navigator";

type DateCalendarProps = {
  portalContainerRef?: RefObject<HTMLDivElement | null>;
  form: UseFormReturn<DurationFormValues | AddDurationFormValues>;
};

export const DateCalendar = memo(function DateCalendar({
  portalContainerRef,
  form,
}: DateCalendarProps) {
  const { copy, locale } = useToolI18n();
  const durationCopy = copy.duration;
  const dateLocale = getDurationDateLocale(locale);
  const [currentDate, setCurrentDate] = useState(new Date());
  const selectedDate = useWatch({
    control: form.control,
    name: "date",
  });

  useEffect(() => {
    if (selectedDate) {
      setCurrentDate(new Date(selectedDate.toString()));
    }
  }, [selectedDate]);

  const handleMonthChange = useCallback(
    (months: number) => {
      setCurrentDate((prev) =>
        months > 0
          ? addMonths(prev, months)
          : subMonths(prev, Math.abs(months)),
      );
    },
    [setCurrentDate],
  );

  const handleYearChange = useCallback(
    (year: number) => {
      setCurrentDate((prev) => setYear(prev, year));
    },
    [setCurrentDate],
  );

  return (
    <FormField
      control={form.control}
      name="date"
      render={({ field }) => {
        return (
          <FormItem>
            <FormLabel>{durationCopy.dateLabel}</FormLabel>
            <FormControl>
              <Calendar
                mode="single"
                locale={dateLocale}
                className={styles.calendarFrame}
                classNames={{
                  months: styles.calendarMonths,
                  month: styles.calendarMonth,
                  table: styles.calendarTable,
                  head_row: styles.calendarHeadRow,
                  head_cell: styles.calendarHeadCell,
                  row: styles.calendarRow,
                  cell: styles.calendarCell,
                  day: styles.calendarDay,
                  day_disabled: styles.calendarDisabled,
                  day_selected: styles.calendarSelected,
                  day_today: styles.calendarToday,
                  day_outside: styles.calendarOutside,
                }}
                selected={field.value}
                onSelect={field.onChange}
                month={currentDate}
                disableNavigation
                showOutsideDays={false}
                components={{
                  Caption: () => (
                    <CalendarNavigator
                      portalContainerRef={portalContainerRef}
                      currentDate={currentDate}
                      handleMonthChange={handleMonthChange}
                      handleYearChange={handleYearChange}
                    />
                  ),
                }}
                onMonthChange={setCurrentDate}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        );
      }}
    />
  );
});
