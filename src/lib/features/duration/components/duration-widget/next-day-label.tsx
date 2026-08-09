import { useToolI18n } from "@/i18n/tool-i18n";
import { RepeatOptionType, TypeOptionType } from "@/schemas/duration";
import { addMonths, addWeeks, addYears } from "date-fns";
import { memo } from "react";
import { useDurationStore } from "../../stores/duration.store";
import {
  formatCountdownTime,
  getTimeDifferenceObject,
} from "./get-time-difference-label";

export function getNextOccurrence(
  date: Date,
  repeat?: RepeatOptionType,
  now?: Date,
) {
  if (!repeat || repeat === "never" || !now) {
    return null;
  }

  let nextDate = new Date(date);

  while (nextDate < now) {
    switch (repeat) {
      case "week":
        nextDate = addWeeks(nextDate, 1);
        break;
      case "month":
        nextDate = addMonths(nextDate, 1);
        break;
      case "year":
        nextDate = addYears(nextDate, 1);
        break;
    }
  }

  return nextDate;
}

interface NextDayLabelProps {
  repeat?: RepeatOptionType;
  type?: TypeOptionType;
  date: Date;
}

export const NextDayLabel = memo(function NextDayLabel({
  repeat,
  type,
  date,
}: NextDayLabelProps) {
  const { copy } = useToolI18n();
  const now = useDurationStore((state) => state.now);
  const nextDate = getNextOccurrence(date, repeat, now);

  if (!nextDate) {
    return <span>{copy.duration.notRepeated}</span>;
  }

  const { days, hours, minutes, seconds } = getTimeDifferenceObject(
    nextDate,
    now,
  );
  const time = formatCountdownTime(hours, minutes, seconds);

  switch (type) {
    case "anniversary":
      return <span>{copy.duration.nextAnniversary(days, time)}</span>;
    case "birthday":
      return <span>{copy.duration.nextBirthday(days, time)}</span>;
    case "bills":
      return <span>{copy.duration.nextBill(days)}</span>;
    default:
      return <span>{copy.duration.nextDefault(days)}</span>;
  }
});
