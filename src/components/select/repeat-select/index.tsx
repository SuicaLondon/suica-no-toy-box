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
import { AddDurationFormValues, DurationFormValues } from "@/schemas/duration";
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
        <FormItem>
          <FormLabel>Repeat</FormLabel>
          <Select
            open={isOpen}
            disabled={selectedType !== "bills" && selectedType !== "none"}
            value={selectedRepeat}
            onOpenChange={setIsOpen}
            onValueChange={field.onChange}
            defaultValue={field.value}
          >
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Select repeat option" />
              </SelectTrigger>
            </FormControl>
            <SelectContent container={portalContainerRef?.current}>
              {repeatOptions.map((option) => (
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
