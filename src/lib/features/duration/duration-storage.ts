import { DURATION_WIDGET_LOCAL_STORAGE_KEY } from "@/constants/duration";
import { durationFormSchema } from "@/schemas/duration";
import { z } from "zod";
import type { DurationWidget } from "./type/duration.type";

export function loadDurationWidgets(): DurationWidget[] | null {
  const storedWidgets = localStorage.getItem(DURATION_WIDGET_LOCAL_STORAGE_KEY);

  if (!storedWidgets) {
    return null;
  }

  const parsedWidgets = z
    .array(durationFormSchema)
    .safeParse(JSON.parse(storedWidgets));

  return parsedWidgets.success ? parsedWidgets.data : null;
}

export function saveDurationWidgets(widgets: DurationWidget[]) {
  localStorage.setItem(
    DURATION_WIDGET_LOCAL_STORAGE_KEY,
    JSON.stringify(widgets),
  );
}
