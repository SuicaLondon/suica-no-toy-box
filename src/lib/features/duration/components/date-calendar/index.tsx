import { DatePicker } from "suica-ui/date-picker";
import { useToolI18n } from "@/i18n/tool-i18n";
import { AddDurationFormValues, DurationFormValues } from "@/schemas/duration";
import { memo } from "react";
import { Controller, UseFormReturn } from "react-hook-form";
import { getDurationDateLocale } from "../../date-locale";

export const DateCalendar = memo(function DateCalendar({
  form,
}: {
  form: UseFormReturn<DurationFormValues | AddDurationFormValues>;
}) {
  const { copy, locale } = useToolI18n();
  return (
    <Controller
      control={form.control}
      name="date"
      render={({ field, fieldState }) => (
        <fieldset className="grid min-w-0 gap-2">
          <legend className="text-toy-muted mb-2 font-mono text-xs">
            {copy.duration.dateLabel}
          </legend>
          <DatePicker
            locale={getDurationDateLocale(locale)}
            selected={field.value}
            onSelect={field.onChange}
            onDayBlur={field.onBlur}
            className="max-w-none"
            classNames={{
              selected: "calendar-selected [&_button:hover]:text-surface",
            }}
          />
          {fieldState.error && (
            <p role="alert" className="text-toy-error text-sm">
              {fieldState.error.message}
            </p>
          )}
        </fieldset>
      )}
    />
  );
});
