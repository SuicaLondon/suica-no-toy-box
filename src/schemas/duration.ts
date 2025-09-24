import { isValid, parseISO } from "date-fns";
import { z } from "zod";

export const durationFormSchema = z.object({
  id: z.string().uuid(),
  name: z
    .string({
      required_error: "Please enter a name",
    })
    .min(1, {
      message: "Name is required",
    }),
  date: z.preprocess(
    (val) => {
      if (typeof val === "string") {
        const parsed = parseISO(val);
        return isValid(parsed) ? parsed : undefined;
      }
      return val;
    },
    z.date({
      required_error: "Please select a date",
    }),
  ),
  repeat: z.enum(["none", "week", "month", "year"], {
    required_error: "Please select a repeat option",
  }),
  type: z.enum(["none", "anniversary", "birthday", "bills"], {
    required_error: "Please select a type",
  }),
});

export const addDurationFormSchema = durationFormSchema.omit({ id: true });

export type AddDurationFormValues = z.infer<typeof addDurationFormSchema>;
export type DurationFormValues = z.infer<typeof durationFormSchema>;

export type TypeOptionType = "none" | "anniversary" | "birthday" | "bills";
export type RepeatOptionType = "week" | "month" | "year" | "none";
