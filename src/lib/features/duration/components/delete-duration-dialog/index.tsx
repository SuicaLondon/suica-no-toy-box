import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";
import { DurationWidget } from "../../type/duration.type";
import { useDurationStore } from "../../stores/duration.store";

type DeleteDurationDialogProps = {
  open: boolean;
  setOpen: (open: boolean) => void;
  widget: DurationWidget;
};

export function DeleteDurationDialog({
  open,
  setOpen,
  widget,
}: DeleteDurationDialogProps) {
  const deleteWidget = useDurationStore((state) => state.deleteWidget);

  return (
    <Dialog open={open} onOpenChange={() => setOpen(false)}>
      <DialogContent>
        <DialogTitle>Delete Widget</DialogTitle>
        <DialogDescription>
          Are you sure you want to delete this widget?
        </DialogDescription>
        <DialogFooter>
          <Button onClick={() => deleteWidget(widget)}>Delete</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
