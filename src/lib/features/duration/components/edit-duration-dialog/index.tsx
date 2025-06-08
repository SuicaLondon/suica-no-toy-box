"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  AddDurationFormValues,
  durationFormSchema,
  DurationFormValues,
  RepeatOptionType,
  TypeOptionType,
} from "@/schemas/duration";
import { zodResolver } from "@hookform/resolvers/zod";
import { memo, useRef } from "react";
import { useForm, UseFormReturn } from "react-hook-form";
import { RepeatSelect } from "../../../../../components/select/repeat-select";
import { TypeSelect } from "../../../../../components/select/type-select/type-select";
import { useDurationStore } from "../../stores/duration.store";
import { DurationWidget } from "../../type/duration.type";
import { DateCalendar } from "../date-calendar";

type EditDurationDialogProps = {
  open: boolean;
  setOpen: (open: boolean) => void;
  id: string;
  name: string;
  date: Date;
  type?: TypeOptionType;
  repeat?: RepeatOptionType;
};

export const EditDurationDialog = memo(function EditDurationDialog({
  open,
  setOpen,
  id,
  name,
  date,
  type,
  repeat,
}: EditDurationDialogProps) {
  const portalContainerRef = useRef<HTMLDivElement>(null);
  const form = useForm<DurationFormValues>({
    resolver: zodResolver(durationFormSchema),
    defaultValues: {
      id,
      name,
      date,
      type,
      repeat,
    },
  });

  const editWidget = useDurationStore((state) => state.editWidget);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]" ref={portalContainerRef}>
        <DialogHeader>
          <DialogTitle>Edit Duration</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex items-center gap-2">
              <TypeSelect
                form={
                  form as UseFormReturn<
                    DurationFormValues | AddDurationFormValues
                  >
                }
                portalContainerRef={portalContainerRef}
              />
              <RepeatSelect
                form={
                  form as UseFormReturn<
                    DurationFormValues | AddDurationFormValues
                  >
                }
                portalContainerRef={portalContainerRef}
              />
            </div>

            <DateCalendar
              form={
                form as UseFormReturn<
                  DurationFormValues | AddDurationFormValues
                >
              }
              portalContainerRef={portalContainerRef}
            />
            <Button type="submit" className="w-full">
              Add Duration
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
  function onOpenChange(open: boolean) {
    setOpen(open);
    form.reset();
  }

  function calculateRepeat(
    type: TypeOptionType,
    repeat: RepeatOptionType,
  ): RepeatOptionType {
    switch (type) {
      case "anniversary":
        return "year";
      case "birthday":
        return "year";
      case "bills":
        return repeat;
      default:
        return repeat;
    }
  }

  function onSubmit(values: DurationFormValues) {
    const newWidget: DurationWidget = {
      id,
      name: values.name,
      date: values.date,
      repeat: calculateRepeat(values.type, values.repeat),
      type: values.type,
    };

    editWidget(newWidget);
    form.reset();
    setOpen(false);
  }
});
