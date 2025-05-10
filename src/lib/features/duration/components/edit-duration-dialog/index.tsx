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
  durationFormSchema,
  RepeatOptionType,
  TypeOptionType,
} from "@/schemas/duration";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { RepeatSelect } from "../../../../../components/select/repeat-select";
import { TypeSelect } from "../../../../../components/select/type-select/type-select";
import { DateCalendar } from "../date-calendar";
import { DurationWidget } from "../../type/duration.type";
import { useRef } from "react";
import { useDurationStore } from "../../stores/duration.store";

type FormValues = z.infer<typeof durationFormSchema>;

type EditDurationDialogProps = {
  open: boolean;
  setOpen: (open: boolean) => void;
  widget: DurationWidget;
};

export function EditDurationDialog({
  open,
  setOpen,
  widget,
}: EditDurationDialogProps) {
  const portalContainerRef = useRef<HTMLDivElement>(null);
  const form = useForm<FormValues>({
    resolver: zodResolver(durationFormSchema),
    defaultValues: {
      name: widget.name,
      date: widget.date,
      type: widget.type,
      repeat: widget.repeat,
    },
  });

  const { editWidget } = useDurationStore();

  const selectedType = form.watch("type");

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
              <TypeSelect form={form} portalContainerRef={portalContainerRef} />
              {(selectedType === "none" || selectedType === "bills") && (
                <RepeatSelect
                  form={form}
                  portalContainerRef={portalContainerRef}
                />
              )}
            </div>

            <DateCalendar form={form} portalContainerRef={portalContainerRef} />
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

  function onSubmit(values: FormValues) {
    const newWidget: DurationWidget = {
      id: widget.id,
      name: values.name,
      date: values.date,
      repeat: calculateRepeat(values.type, values.repeat),
      type: values.type,
    };

    editWidget(newWidget);
    form.reset();
    setOpen(false);
  }
}
