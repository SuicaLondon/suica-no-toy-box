import { z } from "zod";

export const durationFormSchema = z.object({
  name: z.string({
    required_error: "Please enter a name",
  }),
  date: z.date({
    required_error: "Please select a date",
  }),
  repeat: z.enum(["none", "week", "month", "year"], {
    required_error: "Please select a repeat option",
  }),
});

export type DurationFormValues = z.infer<typeof durationFormSchema>;
