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
import { repeatOptions } from "@/constants/duration";
import { useToolI18n } from "@/i18n/tool-i18n";
import { AddDurationFormValues, DurationFormValues } from "@/schemas/duration";
import durationStyles from "@/lib/features/duration/duration.module.css";
import { memo, RefObject, useState } from "react";
import { UseFormReturn, useWatch } from "react-hook-form";

type RepeatSelectProps = {
  portalContainerRef?: RefObject<HTMLDivElement | null>;
  form: UseFormReturn<DurationFormValues | AddDurationFormValues>;
};

export const RepeatSelect = memo(function RepeatSelect({
  portalContainerRef,
  form,
}: RepeatSelectProps) {
  const { copy } = useToolI18n();
  const durationCopy = copy.duration;
  const selectedType = useWatch({
    control: form.control,
    name: "type",
  });
  const selectedRepeat = useWatch({
    control: form.control,
    name: "repeat",
  });

  const [isOpen, setIsOpen] = useState(false);
  return (
    <FormField
      control={form.control}
      name="repeat"
      render={({ field }) => (
        <FormItem className="min-w-0">
          <FormLabel>{durationCopy.repeatLabel}</FormLabel>
          <Select
            open={isOpen}
            disabled={selectedType !== "bills" && selectedType !== "none"}
            value={selectedRepeat ?? field.value}
            onOpenChange={setIsOpen}
            onValueChange={field.onChange}
          >
            <FormControl>
              <SelectTrigger
                className={toolStyles.selectTrigger}
                aria-label={durationCopy.repeatLabel}
              >
                <SelectValue placeholder={durationCopy.repeatPlaceholder} />
              </SelectTrigger>
            </FormControl>
            <SelectContent
              className={durationStyles.menuContent}
              container={portalContainerRef?.current}
            >
              {repeatOptions.map((option) => (
                <SelectItem
                  className={durationStyles.menuItem}
                  key={option.value}
                  value={option.value}
                >
                  {durationCopy.repeatOptions[option.value]}
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
