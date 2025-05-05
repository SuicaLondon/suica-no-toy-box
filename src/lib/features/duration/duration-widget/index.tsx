import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { format, formatDistanceToNow } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { memo, useEffect, useMemo, useState } from "react";
import { DurationWidget } from "../duration.type";
import {
  getAnniversaryLabel,
  getBillsLabel,
  getBirthdayLabel,
  getDefaultLabel,
} from "./get-time-difference-label";
import { WidgetMenu } from "./widget-menu";

type DurationWidgetItemProps = {
  widget: DurationWidget;
  onDelete: (widget: DurationWidget) => void;
  onEdit: (widget: DurationWidget) => void;
};

const countDownType = ["anniversary", "birthday"] as const;

export const DurationWidgetItem = memo(function DurationWidgetItem({
  widget,
  onDelete,
  onEdit,
}: DurationWidgetItemProps) {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const hasCountDownType = countDownType.some((type) => type === widget.type);
    if (!hasCountDownType) return;
    const interval = setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, [widget.type]);

  const timeDiffienceLabel = useMemo(() => {
    return new Date(widget.date) > new Date()
      ? `in ${formatDistanceToNow(widget.date)}`
      : `${formatDistanceToNow(widget.date)} ago`;
  }, [widget.date]);

  const nextDateLabel = useMemo(() => {
    if (widget.repeat) {
      const nextDate = new Date(widget.date);
      while (nextDate < now) {
        switch (widget.repeat) {
          case "week":
            nextDate.setDate(nextDate.getDate() + 7);
            break;
          case "month":
            nextDate.setMonth(nextDate.getMonth() + 1);
            break;
          case "year":
            nextDate.setFullYear(nextDate.getFullYear() + 1);
            break;
        }
      }

      switch (widget.type) {
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
  }, [widget.repeat, widget.type, widget.date, now]);

  const typeLabel = useMemo(() => {
    switch (widget.type) {
      case "anniversary":
        return "Anniversary";
      case "birthday":
        return "Birthday";
      case "bills":
        return "Bills" + (widget.repeat ? ` every ${widget.repeat}` : "");
      default:
        return widget.repeat ? `Repeats every ${widget.repeat}` : "";
    }
  }, [widget.type, widget.repeat]);

  return (
    <Card key={widget.id}>
      <CardHeader>
        <CardTitle className="flex w-full items-center justify-between">
          <div className="flex w-full items-center justify-between">
            <h1 className="text-lg font-bold">{widget.name}</h1>
            <WidgetMenu
              widget={widget}
              onDelete={() => onDelete(widget)}
              onEdit={onEdit}
            />
          </div>
        </CardTitle>
        <CardDescription>
          <div className="flex flex-col gap-2">
            <span>{typeLabel}</span>
            <span>{nextDateLabel}</span>
          </div>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-2">
          <CalendarIcon className="h-4 w-4 text-gray-500" />
          <span className="text-sm text-gray-500">
            {format(widget.date, "EEEE, MMMM d, yyyy")}
          </span>
          <span className="ml-auto text-sm text-gray-500">
            {timeDiffienceLabel}
          </span>
        </div>
      </CardContent>
    </Card>
  );
});
