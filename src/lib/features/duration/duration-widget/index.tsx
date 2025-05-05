import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { format, formatDistanceToNow } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { memo, useMemo } from "react";
import { DurationWidget } from "../duration.type";
import { WidgetMenu } from "./widget-menu";

type DurationWidgetItemProps = {
  widget: DurationWidget;
  onDelete: (widget: DurationWidget) => void;
};

export const DurationWidgetItem = memo(function DurationWidgetItem({
  widget,
  onDelete,
}: DurationWidgetItemProps) {
  const timeDiffience = useMemo(() => {
    return format(widget.date, "PPP") > format(new Date(), "PPP")
      ? `in ${formatDistanceToNow(widget.date)}`
      : `${formatDistanceToNow(widget.date)} ago`;
  }, [widget.date]);

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
            <WidgetMenu onDelete={() => onDelete(widget)} />
          </div>
        </CardTitle>
        <CardDescription>{typeLabel}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-2">
          <CalendarIcon className="h-4 w-4 text-gray-500" />
          <span className="text-sm text-gray-500">
            {format(widget.date, "EEEE, MMMM d, yyyy")}
          </span>
          <span className="ml-auto text-sm text-gray-500">{timeDiffience}</span>
        </div>
      </CardContent>
    </Card>
  );
});
