import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  addMonths,
  addWeeks,
  addYears,
  differenceInYears,
  format,
  formatDistanceToNow,
  subMonths,
  subWeeks,
  subYears,
} from "date-fns";
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

const countDownTypes = ["anniversary", "birthday"] as const;

export const DurationWidgetItem = memo(function DurationWidgetItem({
  widget,
  onDelete,
  onEdit,
}: DurationWidgetItemProps) {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const hasCountDownType = countDownTypes.some(
      (type) => type === widget.type,
    );
    if (!hasCountDownType) return;
    const interval = setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, [widget.type]);

  const timeDiffienceLabel = useMemo(() => {
    switch (widget.type) {
      case "anniversary":
        const nthAnniversary = differenceInYears(now, widget.date);
        return `${nthAnniversary}${nthAnniversary === 1 ? "st" : nthAnniversary === 2 ? "nd" : nthAnniversary === 3 ? "rd" : "th"} anniversary`;
      case "birthday":
        const age = differenceInYears(now, widget.date);
        return `${age} years old`;
      case "bills":
        return null;
      default:
        const isFuture = new Date(widget.date) > now;
        const distance = formatDistanceToNow(widget.date);
        return isFuture ? `in ${distance}` : `${distance} ago`;
    }
  }, [now, widget.date, widget.type]);

  const nextDateLabel = useMemo(() => {
    if (widget.repeat !== "none") {
      let nextDate = new Date(widget.date.getTime());
      if (nextDate < now) {
        while (nextDate < now) {
          switch (widget.repeat) {
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
          switch (widget.repeat) {
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

      console.log("nextDate", nextDate);

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
