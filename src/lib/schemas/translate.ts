import * as z from "zod";
import { LanguageCode } from "../constants/languages";

export const translateBaseSchema = z.object({
    sourceText: z.string().min(1, "Please enter text to translate"),
    sourceLang: z.string() as z.ZodType<LanguageCode>,
    targetLang: z.string() as z.ZodType<LanguageCode>,
});

export const translateRequestSchema = translateBaseSchema;
export type TranslateRequest = z.infer<typeof translateRequestSchema>;

export const translateFormSchema = translateBaseSchema.extend({
    targetText: z.string().default(""),
});
export type TranslateFormValues = z.infer<typeof translateFormSchema>; 