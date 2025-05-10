import { z } from "zod";

export const durationFormSchema = z.object({
  name: z
    .string({
      required_error: "Please enter a name",
    })
    .min(1, {
      message: "Name is required",
    }),
  date: z.date({
    required_error: "Please select a date",
  }),
  repeat: z.enum(["none", "week", "month", "year"], {
    required_error: "Please select a repeat option",
  }),
  type: z.enum(["none", "anniversary", "birthday", "bills"], {
    required_error: "Please select a type",
  }),
});

export type DurationFormValues = z.infer<typeof durationFormSchema>;
export type TypeOptionType = "none" | "anniversary" | "birthday" | "bills";
export type RepeatOptionType = "week" | "month" | "year" | "none";
export type IntervalType = "anniversary" | "birthday";
export const intervalTypeOptions: IntervalType[] = [
  "anniversary",
  "birthday",
] as const;
