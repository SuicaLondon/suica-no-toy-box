import { intervalTypeOptions, TypeOptionType } from "@/schemas/duration";
import { differenceInYears, formatDistanceToNow } from "date-fns";
import { memo } from "react";
import { useDurationStore } from "../../stores/duration.store";

type TimeDifferenceLabelProps = {
  date: Date;
  type?: TypeOptionType;
};

export const TimeDifferenceLabel = memo(function TimeDifferenceLabel({
  date,
  type,
}: TimeDifferenceLabelProps) {
  const now = useDurationStore((state) => {
    const hasCountDownType = intervalTypeOptions.some(
      (typeOption) => typeOption === type,
    );
    if (!hasCountDownType) return undefined;
    return state.now;
  });

  if (!now) return null;
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
