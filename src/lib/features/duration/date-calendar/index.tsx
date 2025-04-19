import { Calendar } from "@/components/ui/calendar";
import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { DurationFormValues } from "@/schemas/duration";
import { addMonths, setYear, subMonths } from "date-fns";
import { useCallback, useState } from "react";
import { UseFormReturn } from "react-hook-form";
import { CalendarNavigator } from "./calendar-navigator";

type DateCalendarProps = {
  form: UseFormReturn<DurationFormValues>;
};

export function DateCalendar({ form }: DateCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

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
      render={({ field }) => (
        <FormItem className="flex min-h-[300px] flex-col items-center">
          <FormControl>
            <Calendar
              mode="single"
              selected={field.value}
              onSelect={field.onChange}
              month={currentDate}
              disableNavigation
              showOutsideDays
              components={{
                Caption: () => (
                  <CalendarNavigator
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
      )}
    />
  );
}
