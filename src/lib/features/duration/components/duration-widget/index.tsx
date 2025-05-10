import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { memo } from "react";
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
  return (
    <Card key={widget.id}>
      <CardHeader>
        <CardTitle className="flex w-full items-center justify-between">
          <div className="flex w-full items-center justify-between">
            <h1 className="text-lg font-bold">{widget.name}</h1>
            <WidgetMenu widget={widget} />
          </div>
        </CardTitle>
        <CardDescription>
          <div className="flex flex-col gap-2">
            <TypeLabel type={widget.type} repeat={widget.repeat} />
            <NextDayLabel
              repeat={widget.repeat}
              type={widget.type}
              date={widget.date}
            />
          </div>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-2">
          <CalendarIcon className="h-4 w-4 text-gray-500" />
          <span className="text-sm text-gray-500">
            {format(widget.date, "EEEE, MMMM d, yyyy")}
          </span>
          <TimeDifferenceLabel date={widget.date} type={widget.type} />
        </div>
      </CardContent>
    </Card>
  );
});
