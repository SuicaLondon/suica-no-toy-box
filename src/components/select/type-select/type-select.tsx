import { Field } from "suica-ui/field";
import { Select } from "suica-ui/select";
import { typeOptions } from "@/constants/duration";
import { useToolI18n } from "@/i18n/tool-i18n";
import { AddDurationFormValues, DurationFormValues } from "@/schemas/duration";
import { memo } from "react";
import { Controller, UseFormReturn } from "react-hook-form";

export const TypeSelect = memo(function TypeSelect({
  form,
}: {
  form: UseFormReturn<DurationFormValues | AddDurationFormValues>;
}) {
  const { copy } = useToolI18n();

  return (
    <Controller
      control={form.control}
      name="type"
      render={({ field, fieldState }) => (
        <Field
          label={copy.duration.typeLabel}
          error={fieldState.error?.message}
        >
          <Select
            {...field}
            value={field.value ?? ""}
            className="min-h-11"
            onChange={(event) => {
              field.onChange(event.target.value);
              const value = event.target.value;
              form.setValue(
                "repeat",
                value === "anniversary" || value === "birthday"
                  ? "year"
                  : value === "bills"
                    ? "month"
                    : "never",
                { shouldDirty: true, shouldValidate: true, shouldTouch: true },
              );
            }}
          >
            <option value="" disabled>
              {copy.duration.typePlaceholder}
            </option>
            {typeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {copy.duration.typeOptions[option.value]}
              </option>
            ))}
          </Select>
        </Field>
      )}
    />
  );
});
