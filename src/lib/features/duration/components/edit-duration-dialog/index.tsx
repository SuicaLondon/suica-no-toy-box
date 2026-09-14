"use client";

import { Button } from "suica-ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field } from "suica-ui/field";
import { Controller } from "react-hook-form";
import { Input } from "suica-ui/input";
import { useToolI18n } from "@/i18n/tool-i18n";
import {
  AddDurationFormValues,
  createDurationFormSchema,
  DurationFormValues,
  RepeatOptionType,
  TypeOptionType,
} from "@/schemas/duration";
import { zodResolver } from "@hookform/resolvers/zod";
import { memo, useEffect, useMemo } from "react";
import { useForm, UseFormReturn } from "react-hook-form";
import { RepeatSelect } from "../../../../../components/select/repeat-select";
import { TypeSelect } from "../../../../../components/select/type-select/type-select";
import { useDurationStore } from "../../stores/duration.store";
import { DurationWidget } from "../../type/duration.type";
import { DateCalendar } from "../date-calendar";

interface EditDurationDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  id: string;
  name: string;
  date: Date;
  type?: TypeOptionType;
  repeat?: RepeatOptionType;
}

export const EditDurationDialog = memo(function EditDurationDialog({
  open,
  setOpen,
  id,
  name,
  date,
  type,
  repeat,
}: EditDurationDialogProps) {
  const { copy } = useToolI18n();
  const durationCopy = copy.duration;
  const schema = useMemo(
    () =>
      createDurationFormSchema({
        nameRequired: durationCopy.nameRequired,
        dateRequired: durationCopy.dateRequired,
      }),
    [durationCopy.dateRequired, durationCopy.nameRequired],
  );
  const form = useForm<DurationFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      id,
      name,
      date,
      type: type ?? "none",
      repeat: repeat ?? "never",
    },
  });

  const editWidget = useDurationStore((state) => state.editWidget);

  useEffect(() => {
    if (open) {
      form.reset({
        id,
        name,
        date,
        type: type ?? "none",
        repeat: repeat ?? "never",
      });
    }
  }, [date, form, id, name, open, repeat, type]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-h-[calc(100svh_-_32px)] w-[min(540px,calc(100%_-_32px))] gap-[22px] overflow-y-auto p-6 font-sans max-[640px]:p-5"
        closeLabel={copy.common.close}
      >
        <DialogHeader>
          <DialogTitle className="text-[1.375rem] tracking-[-0.025em]">
            {durationCopy.editTitle}
          </DialogTitle>
          <DialogDescription className="sr-only">
            {durationCopy.editTitle}
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="[&_[data-slot=field-label]]:text-toy-muted [&_[data-slot=field-error]]:text-toy-error grid gap-4 [&_[data-slot=field-error]]:text-xs [&_[data-slot=field-label]]:font-mono [&_[data-slot=field-label]]:text-[0.6875rem] [&_[data-slot=field-label]]:font-medium [&_[data-slot=field-label]]:tracking-[0.1em] [&_[data-slot=field-label]]:uppercase [&_[data-slot=field]]:min-w-0"
        >
          <Controller
            control={form.control}
            name="name"
            render={({ field, fieldState }) => (
              <Field
                label={durationCopy.nameLabel}
                error={fieldState.error?.message}
              >
                <Input
                  {...field}
                  className="min-h-12 w-full px-3.5"
                  placeholder={durationCopy.namePlaceholder}
                  autoComplete="off"
                />
              </Field>
            )}
          />
          <div className="grid grid-cols-2 gap-3 max-[767px]:grid-cols-1">
            <TypeSelect
              form={
                form as UseFormReturn<
                  DurationFormValues | AddDurationFormValues
                >
              }
            />
            <RepeatSelect
              form={
                form as UseFormReturn<
                  DurationFormValues | AddDurationFormValues
                >
              }
            />
          </div>

          <DateCalendar
            form={
              form as UseFormReturn<DurationFormValues | AddDurationFormValues>
            }
          />
          <div className="flex items-center justify-end gap-2.5 pt-1 max-[420px]:flex-col-reverse max-[420px]:items-stretch max-[420px]:[&>*]:w-full">
            <DialogClose
              render={(props) => (
                <Button
                  variant="outline"
                  {...props}
                  type="button"
                  className="min-h-10 font-mono text-xs tracking-[0.08em] uppercase max-[520px]:w-full"
                />
              )}
            >
              {durationCopy.cancelAction}
            </DialogClose>
            <Button
              type="submit"
              className="min-h-11 font-mono text-xs tracking-[0.08em] uppercase max-[520px]:w-full"
            >
              {durationCopy.saveAction}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
  function onOpenChange(open: boolean) {
    setOpen(open);
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
      name: values.name.trim(),
      date: values.date,
      repeat: calculateRepeat(values.type, values.repeat),
      type: values.type,
    };

    editWidget(newWidget);
    form.reset();
    setOpen(false);
  }
});
