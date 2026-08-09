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
import { repeatOptions } from "@/constants/duration";
import { useToolI18n } from "@/i18n/tool-i18n";
import { AddDurationFormValues, DurationFormValues } from "@/schemas/duration";
import { memo, RefObject, useState } from "react";
import { UseFormReturn, useWatch } from "react-hook-form";

interface RepeatSelectProps {
  portalContainerRef?: RefObject<HTMLDivElement | null>;
  form: UseFormReturn<DurationFormValues | AddDurationFormValues>;
}

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
                className="border-toy-line-strong text-toy-text focus-visible:border-toy-accent focus-visible:ring-toy-accent min-h-11 w-full justify-between rounded-[2px] bg-transparent shadow-none focus-visible:ring-1 focus-visible:ring-offset-2"
                aria-label={durationCopy.repeatLabel}
              >
                <SelectValue placeholder={durationCopy.repeatPlaceholder} />
              </SelectTrigger>
            </FormControl>
            <SelectContent
              className="border-toy-line-strong bg-toy-bg text-toy-text min-w-[190px] rounded-[2px] p-[5px] font-sans shadow-[0_18px_44px_rgb(0_0_0_/_14%)]"
              container={portalContainerRef?.current}
            >
              {repeatOptions.map((option) => (
                <SelectItem
                  className="focus:bg-toy-hover focus:text-toy-accent min-h-[38px] cursor-pointer rounded-[1px]"
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
