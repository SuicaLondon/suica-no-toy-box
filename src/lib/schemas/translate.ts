import * as z from "zod";
import { LanguageCode } from "../constants/languages";

export const translateSchema = z.object({
    sourceText: z.string().min(1, "Please enter text to translate"),
    targetText: z.string(),
    sourceLang: z.string() as z.ZodType<LanguageCode>,
    targetLang: z.string() as z.ZodType<LanguageCode>,
});

export type TranslateFormValues = z.infer<typeof translateSchema>; 