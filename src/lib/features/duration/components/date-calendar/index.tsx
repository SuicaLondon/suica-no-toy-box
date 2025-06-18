import { Calendar } from "@/components/ui/calendar";
import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { AddDurationFormValues, DurationFormValues } from "@/schemas/duration";
import { addMonths, setYear, subMonths } from "date-fns";
import { memo, RefObject, useCallback, useEffect, useState } from "react";
import { UseFormReturn } from "react-hook-form";
import { CalendarNavigator } from "./calendar-navigator";

type DateCalendarProps = {
  portalContainerRef?: RefObject<HTMLDivElement | null>;
  form: UseFormReturn<DurationFormValues | AddDurationFormValues>;
};

export const DateCalendar = memo(function DateCalendar({
  portalContainerRef,
  form,
}: DateCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    const date = form.getValues("date");
    if (date) {
      setCurrentDate(new Date(date.toString()));
    }
  }, [form]);

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
          <FormItem className="flex min-h-[300px] flex-col items-center">
            <FormControl>
              <Calendar
                mode="single"
                className="flex h-full w-full"
                classNames={{
                  months:
                    "flex w-full flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0 flex-1",
                  month: "space-y-4 w-full flex flex-col",
                  table: "w-full h-full border-collapse space-y-1",
                  head_row: "",
                  row: "w-full mt-2",
                  cell: "h-8 w-8 text-center text-sm p-0",
                  day: "cursor-pointer w-8 h-8 rounded-full overflow-hidden",
                  day_disabled: "hover:bg-none select-none cursor-not-allowed",
                  day_selected:
                    "cursor-pointer w-8 h-8 rounded-full bg-black text-white overflow-hidden",
                }}
                selected={field.value}
                onSelect={field.onChange}
                month={currentDate}
                disableNavigation
                showOutsideDays
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
