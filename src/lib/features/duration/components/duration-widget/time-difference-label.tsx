import { TypeOptionType } from "@/schemas/duration";
import { differenceInYears, formatDistanceToNow } from "date-fns";
import { memo } from "react";

type TimeDifferenceLabelProps = {
  now: Date;
  date: Date;
  type?: TypeOptionType;
};

export const TimeDifferenceLabel = memo(function TimeDifferenceLabel({
  now,
  date,
  type,
}: TimeDifferenceLabelProps) {
  const getTimeDiffienceLabel = () => {
    switch (type) {
      case "anniversary":
        const nthAnniversary = differenceInYears(now, date);
        return `${nthAnniversary}${nthAnniversary === 1 ? "st" : nthAnniversary === 2 ? "nd" : nthAnniversary === 3 ? "rd" : "th"} anniversary`;
      case "birthday":
        const age = differenceInYears(now, date);
        return `${age} years old`;
      case "bills":
        return null;
      default:
        const isFuture = new Date(date) > now;
        const distance = formatDistanceToNow(date);
        return isFuture ? `in ${distance}` : `${distance} ago`;
    }
  };
  return (
    <span className="ml-auto text-sm text-gray-500">
      {getTimeDiffienceLabel()}
    </span>
  );
});
