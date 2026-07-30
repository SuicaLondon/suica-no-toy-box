import { useToolI18n } from "@/i18n/tool-i18n";
import { TypeOptionType } from "@/schemas/duration";
import { differenceInYears, format, formatDistance, parseISO } from "date-fns";
import { memo } from "react";
import { getDurationDateLocale } from "../../date-locale";
import styles from "../../duration.module.css";
import { useDurationStore } from "../../stores/duration.store";

type TimeDifferenceLabelProps = {
  date: Date;
  type?: TypeOptionType;
};

export const TimeDifferenceLabel = memo(function TimeDifferenceLabel({
  date,
  type,
}: TimeDifferenceLabelProps) {
  const { copy, locale } = useToolI18n();
  const nowString = useDurationStore((state) => {
    return format(state.now, "yyyy-MM-dd'T'HH:mm");
  });
  const parsedNow = parseISO(nowString);
  const dateLocale = getDurationDateLocale(locale);
  const differenceType = type ?? "none";
  let timeDifferenceLabel: string | null;

  switch (differenceType) {
    case "anniversary": {
      const count = differenceInYears(parsedNow, date);
      timeDifferenceLabel =
        count >= 0 ? copy.duration.anniversaryAge(count) : null;
      break;
    }
    case "birthday": {
      const age = differenceInYears(parsedNow, date);
      timeDifferenceLabel = age >= 0 ? copy.duration.yearsOld(age) : null;
      break;
    }
    case "bills":
      timeDifferenceLabel = null;
      break;
    default: {
      const isFuture = date > parsedNow;
      const distance = formatDistance(date, parsedNow, {
        locale: dateLocale,
      });
      timeDifferenceLabel = isFuture
        ? copy.duration.inDistance(distance)
        : copy.duration.distanceAgo(distance);
    }
  }

  return timeDifferenceLabel ? (
    <span className={styles.relativeLabel}>{timeDifferenceLabel}</span>
  ) : null;
});
