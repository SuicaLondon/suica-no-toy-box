"use client";

import toolStyles from "@/app/tool-shell.module.css";
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
import styles from "../../duration.module.css";
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
        className={styles.dialogContent}
        ref={portalContainerRef}
        closeLabel={copy.common.close}
      >
        <DialogHeader>
          <DialogTitle className={styles.dialogTitle}>
            {durationCopy.editTitle}
          </DialogTitle>
          <DialogDescription className="sr-only">
            {durationCopy.editTitle}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className={styles.dialogForm}
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
                      className={toolStyles.input}
                      placeholder={durationCopy.namePlaceholder}
                      autoComplete="off"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className={toolStyles.formPair}>
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
            <div className={styles.dialogActions}>
              <DialogClose asChild>
                <Button type="button" className={toolStyles.secondaryButton}>
                  {durationCopy.cancelAction}
                </Button>
              </DialogClose>
              <Button type="submit" className={toolStyles.primaryButton}>
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
