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
  const [isOpen, setIsOpen] = useState(false);
  return (
    <FormField
      control={form.control}
      name="type"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Type</FormLabel>
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
            defaultValue={field.value}
          >
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
            </FormControl>
            <SelectContent container={portalContainerRef?.current}>
              {typeOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
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
