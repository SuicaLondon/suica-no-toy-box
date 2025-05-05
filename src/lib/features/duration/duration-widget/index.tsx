import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { differenceInDays, format, formatDistanceToNow } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { memo, useMemo } from "react";
import { DurationWidget } from "../duration.type";
import { WidgetMenu } from "./widget-menu";

type DurationWidgetItemProps = {
  widget: DurationWidget;
  onDelete: (widget: DurationWidget) => void;
  onEdit: (widget: DurationWidget) => void;
};

export const DurationWidgetItem = memo(function DurationWidgetItem({
  widget,
  onDelete,
  onEdit,
}: DurationWidgetItemProps) {
  const timeDiffienceLabel = useMemo(() => {
    return format(widget.date, "PPP") > format(new Date(), "PPP")
      ? `in ${formatDistanceToNow(widget.date)}`
      : `${formatDistanceToNow(widget.date)} ago`;
  }, [widget.date]);

  const nextDateLabel = useMemo(() => {
    if (widget.repeat) {
      const today = new Date();
      const nextDate = new Date(widget.date);
      while (nextDate < today) {
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
      const diffInDays = differenceInDays(nextDate, today);
      // const diffInHours = differenceInHours(nextDate, today) - diffInDays * 24;
      // const diffInMinutes =
      //   differenceInMinutes(nextDate, today) -
      //   diffInDays * 24 * 60 -
      //   diffInHours * 60;
      // const diffInSeconds =
      //   differenceInSeconds(nextDate, today) -
      //   diffInDays * 24 * 60 * 60 -
      //   diffInHours * 60 * 60 -
      //   diffInMinutes * 60;

      switch (widget.type) {
        case "anniversary":
          return `Next anniversary is in ${diffInDays} days`;
        case "birthday":
          return `Next birthday is in ${diffInDays} days`;
        case "bills":
          return `Next bill day is in ${diffInDays} days`;
        default:
          return `Next ${widget.type} is in ${diffInDays} days`;
      }
    }

    return "Not repeat";
  }, [widget.repeat, widget.type, widget.date]);

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
