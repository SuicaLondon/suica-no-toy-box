import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { languages } from "@/constants/languages";
import type { Locale } from "@/i18n/locales";
import { Control, Controller, FieldPath, FieldValues } from "react-hook-form";

type LanguageSelectProps<T extends FieldValues> = {
  name: FieldPath<T>;
  control: Control<T>;
  locale?: Locale;
  placeholder?: string;
  ariaLabel?: string;
  disabled?: boolean;
  triggerClassName?: string;
};

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
      render={({ field }) => (
        <Select
          value={field.value}
          onValueChange={field.onChange}
          disabled={disabled}
        >
          <SelectTrigger className={triggerClassName} aria-label={ariaLabel}>
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent>
            {languages.map((lang) => (
              <SelectItem key={lang.code} value={lang.code}>
                {lang.name[locale]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    />
  );
}
