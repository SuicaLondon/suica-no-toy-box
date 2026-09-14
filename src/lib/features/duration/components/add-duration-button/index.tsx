"use client";

import { RepeatSelect } from "@/components/select/repeat-select";
import { TypeSelect } from "@/components/select/type-select/type-select";
import { Button } from "suica-ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Field } from "suica-ui/field";
import { Controller } from "react-hook-form";
import { Input } from "suica-ui/input";
import { useToolI18n } from "@/i18n/tool-i18n";
import {
  createAddDurationFormSchema,
  RepeatOptionType,
  TypeOptionType,
} from "@/schemas/duration";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus } from "lucide-react";
import { memo, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useDurationStore } from "../../stores/duration.store";
import { DurationWidget } from "../../type/duration.type";
import { DateCalendar } from "../date-calendar";

export const AddDurationButton = memo(function AddDurationButton() {
  const { copy } = useToolI18n();
  const durationCopy = copy.duration;
  const addWidget = useDurationStore((state) => state.addWidget);
  const [open, setOpen] = useState(false);
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
      <DialogTrigger
        render={(props) => (
          <Button
            {...props}
            className="min-h-11 font-mono text-xs tracking-[0.08em] uppercase max-[520px]:w-full"
          />
        )}
      >
        <Plus aria-hidden="true" />
        {durationCopy.addDate}
      </DialogTrigger>
      <DialogContent
        className="max-h-[calc(100svh_-_32px)] w-[min(540px,calc(100%_-_32px))] gap-[22px] overflow-y-auto p-6 font-sans max-[640px]:p-5"
        closeLabel={copy.common.close}
      >
        <DialogHeader>
          <DialogTitle className="text-[1.375rem] tracking-[-0.025em]">
            {durationCopy.addTitle}
          </DialogTitle>
          <DialogDescription className="text-toy-muted leading-[1.55]">
            {durationCopy.emptyDescription}
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
            <TypeSelect form={form} />
            <RepeatSelect form={form} />
          </div>

          <DateCalendar form={form} />
          <Button
            type="submit"
            className="min-h-11 font-mono text-xs tracking-[0.08em] uppercase max-[520px]:w-full"
          >
            {durationCopy.addDate}
          </Button>
        </form>
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
