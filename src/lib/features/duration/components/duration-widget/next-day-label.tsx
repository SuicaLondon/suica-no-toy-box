import {
  intervalTypeOptions,
  RepeatOptionType,
  TypeOptionType,
} from "@/schemas/duration";
import {
  addMonths,
  addWeeks,
  addYears,
  subMonths,
  subWeeks,
  subYears,
} from "date-fns";
import { memo } from "react";
import {
  getAnniversaryLabel,
  getBillsLabel,
  getBirthdayLabel,
  getDefaultLabel,
} from "./get-time-difference-label";
import { useDurationStore } from "../../stores/duration.store";

type NextDayLabelProps = {
  repeat?: RepeatOptionType;
  type?: TypeOptionType;
  date: Date;
};

export const NextDayLabel = memo(function NextDayLabel({
  repeat,
  type,
  date,
}: NextDayLabelProps) {
  const now = useDurationStore((state) => {
    const hasCountDownType = intervalTypeOptions.some(
      (typeOption) => typeOption === type,
    );
    if (!hasCountDownType) return undefined;
    return state.now;
  });

  const getNextDateLabel = () => {
    if (repeat !== "none" && now) {
      let nextDate = new Date(date);
      if (nextDate < now) {
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
      } else {
        while (nextDate > now) {
          switch (repeat) {
            case "week":
              nextDate = subWeeks(nextDate, 1);
              break;
            case "month":
              nextDate = subMonths(nextDate, 1);
              break;
            case "year":
              nextDate = subYears(nextDate, 1);
              break;
          }
        }
      }

      switch (type) {
        case "anniversary":
          return getAnniversaryLabel(nextDate, now);
        case "birthday":
          return getBirthdayLabel(nextDate, now);
        case "bills":
          return getBillsLabel(nextDate, now);
        default:
          return getDefaultLabel(nextDate, now);
      }
    }

    return "Not repeat";
  };
  return <span>{getNextDateLabel()}</span>;
});
