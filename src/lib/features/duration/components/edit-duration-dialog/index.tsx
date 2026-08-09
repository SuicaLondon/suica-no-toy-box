"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
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
import { useToolI18n } from "@/i18n/tool-i18n";
import {
  AddDurationFormValues,
  createDurationFormSchema,
  DurationFormValues,
  RepeatOptionType,
  TypeOptionType,
} from "@/schemas/duration";
import { zodResolver } from "@hookform/resolvers/zod";
import { memo, useEffect, useMemo, useRef } from "react";
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
  const portalContainerRef = useRef<HTMLDivElement>(null);
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
        className="border-toy-line-strong bg-toy-bg text-toy-text max-h-[calc(100svh_-_32px)] w-[min(540px,calc(100%_-_32px))] gap-[22px] overflow-y-auto rounded-[2px] p-6 font-sans max-[640px]:p-5"
        ref={portalContainerRef}
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
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="[&_[data-slot=form-label]]:text-toy-muted [&_[data-slot=form-message]]:text-toy-error grid gap-4 [&_[data-slot=form-item]]:min-w-0 [&_[data-slot=form-label]]:font-mono [&_[data-slot=form-label]]:text-[0.6875rem] [&_[data-slot=form-label]]:font-medium [&_[data-slot=form-label]]:tracking-[0.1em] [&_[data-slot=form-label]]:uppercase [&_[data-slot=form-message]]:text-xs"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{durationCopy.nameLabel}</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      className="border-toy-line-strong text-toy-text placeholder:text-toy-muted/75 focus-visible:border-toy-accent focus-visible:ring-toy-accent min-h-12 w-full rounded-[2px] bg-transparent px-3.5 shadow-none focus-visible:ring-1 focus-visible:ring-offset-2"
                      placeholder={durationCopy.namePlaceholder}
                      autoComplete="off"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-3 max-[767px]:grid-cols-1">
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
            <div className="flex items-center justify-end gap-2.5 pt-1 max-[420px]:flex-col-reverse max-[420px]:items-stretch max-[420px]:[&>*]:w-full">
              <DialogClose asChild>
                <Button
                  type="button"
                  className="border-toy-line-strong text-toy-text hover:bg-toy-hover hover:text-toy-accent min-h-10 rounded-[2px] bg-transparent font-mono text-xs tracking-[0.08em] uppercase shadow-none max-[520px]:w-full"
                >
                  {durationCopy.cancelAction}
                </Button>
              </DialogClose>
              <Button
                type="submit"
                className="border-toy-accent bg-toy-accent text-toy-bg hover:text-toy-bg min-h-11 rounded-[2px] border font-mono text-xs tracking-[0.08em] uppercase shadow-none hover:bg-[color-mix(in_srgb,var(--toy-accent)_88%,var(--toy-text))] max-[520px]:w-full"
              >
                {durationCopy.saveAction}
              </Button>
            </div>
          </form>
        </Form>
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
