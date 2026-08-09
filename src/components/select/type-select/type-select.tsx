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
import { typeOptions } from "@/constants/duration";
import { useToolI18n } from "@/i18n/tool-i18n";
import { AddDurationFormValues, DurationFormValues } from "@/schemas/duration";
import { memo, RefObject, useState } from "react";
import { UseFormReturn } from "react-hook-form";

const formOptions = {
  shouldDirty: true,
  shouldValidate: true,
  shouldTouch: true,
} as const;

interface TypeSelectProps {
  portalContainerRef?: RefObject<HTMLDivElement | null>;
  form: UseFormReturn<DurationFormValues | AddDurationFormValues>;
}

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
                className="border-toy-line-strong text-toy-text focus-visible:border-toy-accent focus-visible:ring-toy-accent min-h-11 w-full justify-between rounded-[2px] bg-transparent shadow-none focus-visible:ring-1 focus-visible:ring-offset-2"
                aria-label={durationCopy.typeLabel}
              >
                <SelectValue placeholder={durationCopy.typePlaceholder} />
              </SelectTrigger>
            </FormControl>
            <SelectContent
              className="border-toy-line-strong bg-toy-bg text-toy-text min-w-[190px] rounded-[2px] p-[5px] font-sans shadow-[0_18px_44px_rgb(0_0_0_/_14%)]"
              container={portalContainerRef?.current}
            >
              {typeOptions.map((option) => (
                <SelectItem
                  className="focus:bg-toy-hover focus:text-toy-accent min-h-[38px] cursor-pointer rounded-[1px]"
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
