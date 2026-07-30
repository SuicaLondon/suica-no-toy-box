import toolStyles from "@/app/tool-shell.module.css";
import { useToolI18n } from "@/i18n/tool-i18n";
import { format, formatISO } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { memo } from "react";
import { getDurationDateLocale } from "../../date-locale";
import styles from "../../duration.module.css";
import { DurationWidget } from "../../type/duration.type";
import { NextDayLabel } from "./next-day-label";
import { TimeDifferenceLabel } from "./time-difference-label";
import { TypeLabel } from "./type-label";
import { WidgetMenu } from "./widget-menu";

type DurationWidgetItemProps = {
  widget: DurationWidget;
};

export const DurationWidgetItem = memo(function DurationWidgetItem({
  widget,
}: DurationWidgetItemProps) {
  const { locale } = useToolI18n();
  const dateLocale = getDurationDateLocale(locale);

  return (
    <article className={toolStyles.durationCard}>
      <header className={toolStyles.durationCardHeader}>
        <div className={styles.cardTitle}>
          <h3>{widget.name}</h3>
          <p className={styles.typeLine}>
            <TypeLabel type={widget.type} repeat={widget.repeat} />
          </p>
        </div>
        <WidgetMenu widget={widget} />
      </header>

      <div className={toolStyles.durationMeta}>
        <div className={styles.dateRow}>
          <CalendarIcon aria-hidden="true" />
          <time dateTime={formatISO(widget.date)}>
            {format(widget.date, "PPPP", { locale: dateLocale })}
          </time>
        </div>
        <NextDayLabel
          repeat={widget.repeat}
          type={widget.type}
          date={widget.date}
        />
        <TimeDifferenceLabel date={widget.date} type={widget.type} />
      </div>
    </article>
  );
});
