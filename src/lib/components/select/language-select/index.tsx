import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { languages } from "@/lib/constants/languages";
import {
  Control,
  Controller,
  FieldPath,
  FieldValues,
  Path,
} from "react-hook-form";

type LanguageSelectProps<T extends FieldValues> = {
  name: FieldPath<T>;
  control: Control<T>;
};

export default function LanguageSelect<T extends FieldValues>({
  name,
  control,
}: LanguageSelectProps<T>) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <Select value={field.value} onValueChange={field.onChange}>
          <SelectTrigger>
            <SelectValue placeholder="Select language" />
          </SelectTrigger>
          <SelectContent>
            {languages.map((lang) => (
              <SelectItem key={lang.code} value={lang.code}>
                {lang.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    />
  );
}
