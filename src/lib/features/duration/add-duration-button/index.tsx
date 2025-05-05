"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
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
import {
  durationFormSchema,
  RepeatOptionType,
  TypeOptionType,
} from "@/schemas/duration";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus } from "lucide-react";
import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { DateCalendar } from "../date-calendar";
import { RepeatSelect } from "./repeat-select";
import { TypeSelect } from "./type-select";
import { DurationWidget } from "../duration.type";

type FormValues = z.infer<typeof durationFormSchema>;

type AddDurationButtonProps = {
  addWidget: (widget: DurationWidget) => void;
};

export function AddDurationButton({ addWidget }: AddDurationButtonProps) {
  const [open, setOpen] = useState(false);
  const portalContainerRef = useRef<HTMLDivElement>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(durationFormSchema),
    defaultValues: {
      name: "",
      date: new Date(),
      type: "none",
      repeat: "none",
    },
  });

  const selectedType = form.watch("type");

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add date
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]" ref={portalContainerRef}>
        <DialogHeader>
          <DialogTitle>Add New Duration</DialogTitle>
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
              <TypeSelect portalContainerRef={portalContainerRef} form={form} />
              {selectedType === "none" && (
                <RepeatSelect
                  portalContainerRef={portalContainerRef}
                  form={form}
                />
              )}
            </div>

            <DateCalendar portalContainerRef={portalContainerRef} form={form} />
            <Button type="submit" className="w-full">
              Add Duration
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
        return "month";
      default:
        return repeat;
    }
  }

  function onSubmit(values: FormValues) {
    console.log(values);
    const newWidget: DurationWidget = {
      id: crypto.randomUUID(),
      name: values.name,
      date: values.date,
      repeat: calculateRepeat(values.type, values.repeat),
      type: values.type,
    };

    addWidget(newWidget);
    form.reset();
    setOpen(false);
  }
}
