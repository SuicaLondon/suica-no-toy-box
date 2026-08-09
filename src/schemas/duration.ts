import { isValid, parseISO } from "date-fns";
import { z } from "zod";

type DurationValidationMessages = {
  nameRequired: string;
  dateRequired: string;
};

const defaultValidationMessages: DurationValidationMessages = {
  nameRequired: "Enter a name.",
  dateRequired: "Select a date.",
};

export function createDurationFormSchema(
  messages: DurationValidationMessages = defaultValidationMessages,
) {
  return z.object({
    id: z.string().uuid(),
    name: z
      .string({
        required_error: messages.nameRequired,
      })
      .trim()
      .min(1, {
        message: messages.nameRequired,
      }),
    date: z.preprocess(
      (value) => {
        if (typeof value === "string") {
          const parsed = parseISO(value);
          return isValid(parsed) ? parsed : undefined;
        }
        return value;
      },
      z.date({
        required_error: messages.dateRequired,
        invalid_type_error: messages.dateRequired,
      }),
    ),
    repeat: z.preprocess(
      (value) => {
        if (value === "none" || value === undefined || value === null) {
          return "never";
        }
        return value;
      },
      z.enum(["never", "week", "month", "year"]),
    ),
    type: z.enum(["none", "anniversary", "birthday", "bills"]),
  });
}

export const durationFormSchema = createDurationFormSchema();

export function createAddDurationFormSchema(
  messages: DurationValidationMessages = defaultValidationMessages,
) {
  return createDurationFormSchema(messages).omit({ id: true });
}

export const addDurationFormSchema = createAddDurationFormSchema();

export type AddDurationFormValues = z.infer<typeof addDurationFormSchema>;
export type DurationFormValues = z.infer<typeof durationFormSchema>;

export type TypeOptionType = "none" | "anniversary" | "birthday" | "bills";
export type RepeatOptionType = "week" | "month" | "year" | "never";
