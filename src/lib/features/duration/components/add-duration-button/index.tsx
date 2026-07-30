"use client";

import { RepeatSelect } from "@/components/select/repeat-select";
import { TypeSelect } from "@/components/select/type-select/type-select";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
  createAddDurationFormSchema,
  RepeatOptionType,
  TypeOptionType,
} from "@/schemas/duration";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus } from "lucide-react";
import { memo, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import toolStyles from "@/app/tool-shell.module.css";
import { useDurationStore } from "../../stores/duration.store";
import { DurationWidget } from "../../type/duration.type";
import styles from "../../duration.module.css";
import { DateCalendar } from "../date-calendar";

export const AddDurationButton = memo(function AddDurationButton() {
  const { copy } = useToolI18n();
  const durationCopy = copy.duration;
  const addWidget = useDurationStore((state) => state.addWidget);
  const [open, setOpen] = useState(false);
  const portalContainerRef = useRef<HTMLDivElement>(null);
  const schema = useMemo(
    () =>
      createAddDurationFormSchema({
        nameRequired: durationCopy.nameRequired,
        dateRequired: durationCopy.dateRequired,
      }),
    [durationCopy.dateRequired, durationCopy.nameRequired],
  );
  type FormValues = z.infer<typeof schema>;

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      date: new Date(),
      type: "none",
      repeat: "never",
    },
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className={toolStyles.primaryButton}>
          <Plus aria-hidden="true" />
          {durationCopy.addDate}
        </Button>
      </DialogTrigger>
      <DialogContent
        className={styles.dialogContent}
        ref={portalContainerRef}
        closeLabel={copy.common.close}
      >
        <DialogHeader>
          <DialogTitle className={styles.dialogTitle}>
            {durationCopy.addTitle}
          </DialogTitle>
          <DialogDescription className={styles.dialogDescription}>
            {durationCopy.emptyDescription}
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
              <TypeSelect portalContainerRef={portalContainerRef} form={form} />
              <RepeatSelect
                portalContainerRef={portalContainerRef}
                form={form}
              />
            </div>

            <DateCalendar portalContainerRef={portalContainerRef} form={form} />
            <Button type="submit" className={toolStyles.primaryButton}>
              {durationCopy.addDate}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );

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
      id: crypto.randomUUID(),
      name: values.name.trim(),
      date: values.date,
      repeat: calculateRepeat(values.type, values.repeat),
      type: values.type,
    };

    addWidget(newWidget);
    form.reset({
      name: "",
      date: new Date(),
      type: "none",
      repeat: "never",
    });
    setOpen(false);
  }
});
