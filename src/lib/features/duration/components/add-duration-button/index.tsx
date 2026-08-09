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
import { useDurationStore } from "../../stores/duration.store";
import { DurationWidget } from "../../type/duration.type";
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
        <Button className="border-toy-accent bg-toy-accent text-toy-bg hover:text-toy-bg min-h-11 rounded-[2px] border font-mono text-xs tracking-[0.08em] uppercase shadow-none hover:bg-[color-mix(in_srgb,var(--toy-accent)_88%,var(--toy-text))] max-[520px]:w-full">
          <Plus aria-hidden="true" />
          {durationCopy.addDate}
        </Button>
      </DialogTrigger>
      <DialogContent
        className="border-toy-line-strong bg-toy-bg text-toy-text max-h-[calc(100svh_-_32px)] w-[min(540px,calc(100%_-_32px))] gap-[22px] overflow-y-auto rounded-[2px] p-6 font-sans max-[640px]:p-5"
        ref={portalContainerRef}
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
              <TypeSelect portalContainerRef={portalContainerRef} form={form} />
              <RepeatSelect
                portalContainerRef={portalContainerRef}
                form={form}
              />
            </div>

            <DateCalendar portalContainerRef={portalContainerRef} form={form} />
            <Button
              type="submit"
              className="border-toy-accent bg-toy-accent text-toy-bg hover:text-toy-bg min-h-11 rounded-[2px] border font-mono text-xs tracking-[0.08em] uppercase shadow-none hover:bg-[color-mix(in_srgb,var(--toy-accent)_88%,var(--toy-text))] max-[520px]:w-full"
            >
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
