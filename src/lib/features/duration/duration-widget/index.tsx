import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format, formatDistanceToNow } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { memo, useMemo } from "react";

export type DurationWidget = {
  id: string;
  name: string;
  date: Date;
  repeat?: "week" | "month" | "year";
};

export const DurationWidgetItem = memo(function DurationWidgetItem({
  widget,
}: {
  widget: DurationWidget;
}) {
  const timeDiffience = useMemo(() => {
    return format(widget.date, "PPP") > format(new Date(), "PPP")
      ? `in ${formatDistanceToNow(widget.date)}`
      : `${formatDistanceToNow(widget.date)} ago`;
  }, [widget.date]);
  return (
    <Card key={widget.id}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{widget.name}</span>
          {widget.repeat && (
            <span className="text-sm text-gray-500">
              Repeats every {widget.repeat}
            </span>
          )}
        </CardTitle>
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
