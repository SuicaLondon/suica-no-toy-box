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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { durationFormSchema } from "@/schemas/duration";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { DateCalendar } from "../date-calendar";

type FormValues = z.infer<typeof durationFormSchema>;

type DurationWidget = {
  id: string;
  name: string;
  date: Date;
  repeat?: "week" | "month" | "year";
};

type AddDurationButtonProps = {
  addWidget: (widget: DurationWidget) => void;
};

export function AddDurationButton({ addWidget }: AddDurationButtonProps) {
  const [open, setOpen] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(durationFormSchema),
    defaultValues: {
      name: "",
      date: new Date(),
      repeat: "none",
    },
  });

  const onSubmit = (values: FormValues) => {
    console.log(values);
    const newWidget: DurationWidget = {
      id: crypto.randomUUID(),
      name: values.name,
      date: values.date,
      repeat: values.repeat === "none" ? undefined : values.repeat,
    };

    addWidget(newWidget);
    form.reset();
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add date
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
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
            <FormField
              control={form.control}
              name="repeat"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Repeat</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select repeat option" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="none">No Repeat</SelectItem>
                      <SelectItem value="week">Every Week</SelectItem>
                      <SelectItem value="month">Every Month</SelectItem>
                      <SelectItem value="year">Every Year</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DateCalendar form={form} />
            <Button type="submit" className="w-full">
              Add Duration
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
