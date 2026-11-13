import { Button } from "suica-ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToolI18n } from "@/i18n/tool-i18n";
import { useDurationStore } from "../../stores/duration.store";
import { DurationWidget } from "../../type/duration.type";

interface DeleteDurationDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  widget: DurationWidget;
}

export function DeleteDurationDialog({
  open,
  setOpen,
  widget,
}: DeleteDurationDialogProps) {
  const { messages } = useToolI18n();
  const durationMessages = messages.duration;
  const deleteWidget = useDurationStore((state) => state.deleteWidget);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent
        className="max-h-[calc(100svh_-_32px)] w-[min(540px,calc(100%_-_32px))] gap-[22px] overflow-y-auto p-6 font-sans max-[640px]:p-5"
        closeLabel={messages.common.close}
      >
        <DialogTitle className="text-[1.375rem] tracking-[-0.025em]">
          {durationMessages.deleteTitle}
        </DialogTitle>
        <DialogDescription className="text-toy-muted leading-[1.55]">
          {durationMessages.deleteDescription}
        </DialogDescription>
        <DialogFooter>
          <DialogClose
            render={(props) => (
              <Button
                variant="outline"
                {...props}
                type="button"
                className="min-h-10 font-mono text-xs tracking-[0.08em] uppercase max-[520px]:w-full"
              />
            )}
          >
            {durationMessages.cancelAction}
          </DialogClose>
          <Button
            type="button"
            className="min-h-10 rounded-[2px] border border-[#b42318] bg-[#b42318] font-mono text-xs tracking-[0.08em] text-white uppercase shadow-none"
            onClick={() => {
              deleteWidget(widget);
              setOpen(false);
            }}
          >
            {durationMessages.deleteAction}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
