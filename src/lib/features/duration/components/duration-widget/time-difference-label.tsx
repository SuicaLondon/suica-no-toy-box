import { TypeOptionType } from "@/schemas/duration";
import {
  differenceInYears,
  format,
  formatDistanceToNow,
  parseISO,
} from "date-fns";
import { memo } from "react";
import { useDurationStore } from "../../stores/duration.store";

const getTimeDifferenceLabel = (
  todayString: string,
  date: Date,
  type: TypeOptionType,
) => {
  const parsedNow = parseISO(todayString);
  switch (type) {
    case "anniversary":
      const nthAnniversary = differenceInYears(parsedNow, date);
      return `${nthAnniversary}${nthAnniversary === 1 ? "st" : nthAnniversary === 2 ? "nd" : nthAnniversary === 3 ? "rd" : "th"} anniversary`;
    case "birthday":
      const age = differenceInYears(parsedNow, date);
      return `${age} years old`;
    case "bills":
      return null;
    default:
      const isFuture = new Date(date) > parsedNow;
      const distance = formatDistanceToNow(date);
      return isFuture ? `in ${distance}` : `${distance} ago`;
  }
};

type TimeDifferenceLabelProps = {
  date: Date;
  type?: TypeOptionType;
};

export const TimeDifferenceLabel = memo(function TimeDifferenceLabel({
  date,
  type,
}: TimeDifferenceLabelProps) {
  const todayString = useDurationStore((state) => {
    return format(state.now, "yyyy-MM-dd");
  });

  if (!todayString) return null;

  const timeDifferenceLabel = getTimeDifferenceLabel(
    todayString,
    date,
    type ?? "none",
  );

  return (
    <span className="ml-auto text-sm text-gray-500">{timeDifferenceLabel}</span>
  );
});
