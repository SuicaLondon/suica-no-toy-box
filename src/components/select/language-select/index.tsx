import { Field } from "suica-ui/field";
import { Select } from "suica-ui/select";
import { languages } from "@/constants/languages";
import type { Locale } from "@/i18n/locales";
import { Control, Controller, FieldPath, FieldValues } from "react-hook-form";

interface LanguageSelectProps<T extends FieldValues> {
  name: FieldPath<T>;
  control: Control<T>;
  locale?: Locale;
  placeholder?: string;
  ariaLabel?: string;
  disabled?: boolean;
  triggerClassName?: string;
}

export default function LanguageSelect<T extends FieldValues>({
  name,
  control,
  locale = "en",
  placeholder = "Select language",
  ariaLabel,
  disabled,
  triggerClassName,
}: LanguageSelectProps<T>) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <Field
          label={ariaLabel ?? placeholder}
          error={fieldState.error?.message}
        >
          <Select
            {...field}
            value={field.value ?? ""}
            className={triggerClassName}
            aria-label={ariaLabel ?? placeholder}
            disabled={disabled}
          >
            <option value="" disabled>
              {placeholder}
            </option>
            {languages.map((lang) => (
              <option key={lang.code} value={lang.code}>
                {lang.name[locale]}
              </option>
            ))}
          </Select>
        </Field>
      )}
    />
  );
}
