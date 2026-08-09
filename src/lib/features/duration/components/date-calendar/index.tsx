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
import { CalendarNavigator } from "./calendar-navigator";

interface DateCalendarProps {
  portalContainerRef?: RefObject<HTMLDivElement | null>;
  form: UseFormReturn<DurationFormValues | AddDurationFormValues>;
}

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
                className="text-toy-text pt-1"
                classNames={{
                  months: "w-full",
                  month: "grid w-full gap-3",
                  table: "w-full border-collapse",
                  head_row: "flex justify-between",
                  head_cell:
                    "w-9 text-center font-mono text-[0.6875rem] font-normal text-toy-muted max-[420px]:w-8",
                  row: "mt-1.5 flex justify-between",
                  cell: "w-9 text-center max-[420px]:w-8",
                  day: "inline-flex size-9 items-center justify-center rounded-full bg-transparent text-[0.8125rem] text-toy-text transition-colors duration-150 hover:bg-toy-hover motion-reduce:transition-none max-[420px]:size-8",
                  day_disabled: "cursor-not-allowed opacity-30",
                  day_selected:
                    "bg-toy-accent text-toy-bg hover:bg-toy-accent hover:text-toy-bg",
                  day_today:
                    "outline outline-1 -outline-offset-1 outline-toy-line-strong",
                  day_outside: "text-toy-muted opacity-45",
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
