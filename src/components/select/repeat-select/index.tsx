import { Field } from "suica-ui/field";
import { Select } from "suica-ui/select";
import { repeatOptions } from "@/constants/duration";
import { useToolI18n } from "@/i18n/tool-i18n";
import { AddDurationFormValues, DurationFormValues } from "@/schemas/duration";
import { memo } from "react";
import { Controller, UseFormReturn, useWatch } from "react-hook-form";

export const RepeatSelect = memo(function RepeatSelect({
  form,
}: {
  form: UseFormReturn<DurationFormValues | AddDurationFormValues>;
}) {
  const { copy } = useToolI18n();
  const selectedType = useWatch({ control: form.control, name: "type" });
  return (
    <Controller
      control={form.control}
      name="repeat"
      render={({ field, fieldState }) => (
        <Field
          label={copy.duration.repeatLabel}
          error={fieldState.error?.message}
        >
          <Select
            {...field}
            value={field.value ?? ""}
            className="min-h-11"
            disabled={selectedType !== "bills" && selectedType !== "none"}
            onChange={(event) => {
              field.onChange(event.target.value);
            }}
          >
            <option value="" disabled>
              {copy.duration.repeatPlaceholder}
            </option>
            {repeatOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {copy.duration.repeatOptions[option.value]}
              </option>
            ))}
          </Select>
        </Field>
      )}
    />
  );
});
