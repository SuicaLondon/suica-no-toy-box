import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import toolStyles from "@/app/tool-shell.module.css";
import { typeOptions } from "@/constants/duration";
import { useToolI18n } from "@/i18n/tool-i18n";
import durationStyles from "@/lib/features/duration/duration.module.css";
import { AddDurationFormValues, DurationFormValues } from "@/schemas/duration";
import { memo, RefObject, useState } from "react";
import { UseFormReturn } from "react-hook-form";

const formOptions = {
  shouldDirty: true,
  shouldValidate: true,
  shouldTouch: true,
} as const;

type TypeSelectProps = {
  portalContainerRef?: RefObject<HTMLDivElement | null>;
  form: UseFormReturn<DurationFormValues | AddDurationFormValues>;
};

export const TypeSelect = memo(function TypeSelect({
  portalContainerRef,
  form,
}: TypeSelectProps) {
  const { copy } = useToolI18n();
  const durationCopy = copy.duration;
  const [isOpen, setIsOpen] = useState(false);
  return (
    <FormField
      control={form.control}
      name="type"
      render={({ field }) => (
        <FormItem className="min-w-0">
          <FormLabel>{durationCopy.typeLabel}</FormLabel>
          <Select
            open={isOpen}
            onOpenChange={setIsOpen}
            onValueChange={(value) => {
              field.onChange(value);
              switch (value) {
                case "anniversary":
                  form.setValue("repeat", "year", formOptions);
                  break;
                case "birthday":
                  form.setValue("repeat", "year", formOptions);
                  break;
                case "bills":
                  form.setValue("repeat", "month", formOptions);
                  break;
                case "none":
                  form.setValue("repeat", "never", formOptions);
              }
            }}
            value={field.value}
          >
            <FormControl>
              <SelectTrigger
                className={toolStyles.selectTrigger}
                aria-label={durationCopy.typeLabel}
              >
                <SelectValue placeholder={durationCopy.typePlaceholder} />
              </SelectTrigger>
            </FormControl>
            <SelectContent
              className={durationStyles.menuContent}
              container={portalContainerRef?.current}
            >
              {typeOptions.map((option) => (
                <SelectItem
                  className={durationStyles.menuItem}
                  key={option.value}
                  value={option.value}
                >
                  {durationCopy.typeOptions[option.value]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  );
});
