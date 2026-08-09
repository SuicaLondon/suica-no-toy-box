import { useToolI18n } from "@/i18n/tool-i18n";
import { format, formatISO } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { memo } from "react";
import { getDurationDateLocale } from "../../date-locale";
import { DurationWidget } from "../../type/duration.type";
import { NextDayLabel } from "./next-day-label";
import { TimeDifferenceLabel } from "./time-difference-label";
import { TypeLabel } from "./type-label";
import { WidgetMenu } from "./widget-menu";

interface DurationWidgetItemProps {
  widget: DurationWidget;
}

export const DurationWidgetItem = memo(function DurationWidgetItem({
  widget,
}: DurationWidgetItemProps) {
  const { locale } = useToolI18n();
  const dateLocale = getDurationDateLocale(locale);

  return (
    <article className="border-toy-line text-toy-text min-w-0 rounded-[2px] border bg-[color-mix(in_srgb,var(--toy-bg)_96%,transparent)] p-[18px]">
      <header className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h3 className="m-0 overflow-hidden text-[1.0625rem] font-semibold [overflow-wrap:anywhere] text-ellipsis">
            {widget.name}
          </h3>
          <p className="text-toy-accent mt-2 mb-0 font-mono text-[0.6875rem] leading-[1.5] tracking-[0.08em] uppercase">
            <TypeLabel type={widget.type} repeat={widget.repeat} />
          </p>
        </div>
        <WidgetMenu widget={widget} />
      </header>

      <div className="border-toy-line text-toy-muted mt-3.5 grid gap-2 border-t pt-3.5 text-[0.8125rem] leading-[1.5]">
        <div className="text-toy-text [&_svg]:text-toy-accent flex items-start gap-[9px] [&_svg]:mt-0.5 [&_svg]:size-4 [&_svg]:shrink-0 [&_svg]:[stroke-width:1.5] [&_time]:text-sm">
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
