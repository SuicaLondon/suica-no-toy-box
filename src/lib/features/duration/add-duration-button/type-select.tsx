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

const typeOptions = [
  {
    label: "No Type",
    value: "none",
  },
  {
    label: "Anniversary",
    value: "anniversary",
  },
  {
    label: "Birthday",
    value: "birthday",
  },
  {
    label: "Bills",
    value: "bills",
  },
];

type TypeSelectProps = {
  portalContainerRef: RefObject<HTMLDivElement | null>;
  form: UseFormReturn<DurationFormValues>;
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
            onValueChange={field.onChange}
            defaultValue={field.value}
          >
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
            </FormControl>
            <SelectContent container={portalContainerRef.current}>
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
