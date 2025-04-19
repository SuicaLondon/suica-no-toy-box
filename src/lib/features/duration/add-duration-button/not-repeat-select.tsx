import {
  SelectContent,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FormControl, FormItem, FormMessage } from "@/components/ui/form";
import { FormLabel } from "@/components/ui/form";
import { FormField } from "@/components/ui/form";
import { Select, SelectItem } from "@/components/ui/select";
import { memo, RefObject, useState } from "react";
import { UseFormReturn } from "react-hook-form";
import { DurationFormValues } from "@/schemas/duration";

type NotRepeatSelectProps = {
  portalContainerRef: RefObject<HTMLDivElement | null>;
  form: UseFormReturn<DurationFormValues>;
};

export const NotRepeatSelect = memo(function NotRepeatSelect({
  portalContainerRef,
  form,
}: NotRepeatSelectProps) {
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
            onOpenChange={setIsOpen}
            onValueChange={field.onChange}
            defaultValue={field.value}
          >
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Select repeat option" />
              </SelectTrigger>
            </FormControl>
            <SelectContent container={portalContainerRef.current}>
              <SelectItem value="none">No Repeat</SelectItem>
              <SelectItem value="week">Every Week</SelectItem>
              <SelectItem value="month">Every Month</SelectItem>
              <SelectItem value="year">Every Year</SelectItem>
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  );
});
