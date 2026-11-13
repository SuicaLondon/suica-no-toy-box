import { locales } from "@/i18n/locales";
import { z } from "zod";

/** What the Grill Restaurant page sends to start a check. */
export const grillRequestSchema = z.object({
  url: z.string().min(1).max(2048),
  /** The page's language: the verdict is written in it. */
  locale: z.enum(locales).optional(),
});

export type GrillRequest = z.infer<typeof grillRequestSchema>;
