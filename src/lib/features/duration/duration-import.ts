import { durationFormSchema } from "@/schemas/duration";
import { z } from "zod";
import type { DurationWidget } from "./type/duration.type";

export function parseDurationImportText(text: string): DurationWidget[] {
  const parsedJson: unknown = JSON.parse(text);
  const candidates = Array.isArray(parsedJson) ? parsedJson : [parsedJson];

  return z.array(durationFormSchema).parse(candidates);
}
