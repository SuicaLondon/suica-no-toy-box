import { Separator } from "suica-ui/separator";
import { Card, CardTitle } from "suica-ui/card";
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
    <Card role="article" className="min-w-0 border p-[18px]">
      <header className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-x-4 gap-y-2">
        <CardTitle
          level={3}
          className="m-0 overflow-hidden text-[1.0625rem] font-semibold [overflow-wrap:anywhere] text-ellipsis"
        >
          {widget.name}
        </CardTitle>
        <WidgetMenu widget={widget} />
        <div className="col-span-2 flex min-w-0 flex-wrap gap-2">
          <TypeLabel type={widget.type} repeat={widget.repeat} />
        </div>
      </header>

      <Separator className="my-3.5" />
      <div className="text-toy-muted grid gap-2 text-[0.8125rem] leading-[1.5]">
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
    </Card>
  );
});
