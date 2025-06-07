import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";
import { memo, useState } from "react";
import { toast } from "sonner";
import { DurationWidget } from "../../type/duration.type";
import { DeleteDurationDialog } from "../delete-duration-dialog";
import { EditDurationDialog } from "../edit-duration-dialog";
type WidgetMenuProps = {
  widget: DurationWidget;
};

export const WidgetMenu = memo(function WidgetMenu({
  widget,
}: WidgetMenuProps) {
  const [activeDialog, setActiveDialog] = useState<"delete" | "edit" | null>(
    null,
  );

  const handleCopy = () => {
    const widgetString = JSON.stringify(widget);
    navigator.clipboard.writeText(widgetString);
    toast.success("Widget copied to clipboard");
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <MoreHorizontal />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem
            variant="destructive"
            onClick={() => setActiveDialog("delete")}
          >
            Delete Widget
            <DropdownMenuShortcut>⌘⌫</DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setActiveDialog("edit")}>
            Edit Widget
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleCopy}>Copy Widget</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <DeleteDurationDialog
        open={activeDialog === "delete"}
        setOpen={() => setActiveDialog(null)}
        widget={widget}
      />
      <EditDurationDialog
        open={activeDialog === "edit"}
        setOpen={() => setActiveDialog(null)}
        id={widget.id}
        name={widget.name}
        date={widget.date}
        type={widget.type}
        repeat={widget.repeat}
      />
    </>
  );
});
