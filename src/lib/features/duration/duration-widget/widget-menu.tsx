import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";
import { useState } from "react";
import { DurationWidget } from "../duration.type";
import { EditDurationDialog } from "../edit-duration-dialog";
type WidgetMenuProps = {
  widget: DurationWidget;
  onDelete: () => void;
  onEdit: (widget: DurationWidget) => void;
};

export function WidgetMenu({ widget, onDelete, onEdit }: WidgetMenuProps) {
  const [activeDialog, setActiveDialog] = useState<"delete" | "edit" | null>(
    null,
  );
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
        </DropdownMenuContent>
      </DropdownMenu>
      <Dialog
        open={activeDialog === "delete"}
        onOpenChange={() => setActiveDialog(null)}
      >
        <DialogContent>
          <DialogTitle>Delete Widget</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this widget?
          </DialogDescription>
          <DialogFooter>
            <Button onClick={onDelete}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <EditDurationDialog
        open={activeDialog === "edit"}
        setOpen={() => setActiveDialog(null)}
        widget={widget}
        onEdit={onEdit}
      />
    </>
  );
}
