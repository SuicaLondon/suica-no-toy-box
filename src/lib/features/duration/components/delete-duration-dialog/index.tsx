import { Button } from "@/components/ui/button";
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
  const { copy } = useToolI18n();
  const durationCopy = copy.duration;
  const deleteWidget = useDurationStore((state) => state.deleteWidget);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent
        className="border-toy-line-strong bg-toy-bg text-toy-text max-h-[calc(100svh_-_32px)] w-[min(540px,calc(100%_-_32px))] gap-[22px] overflow-y-auto rounded-[2px] p-6 font-sans max-[640px]:p-5"
        closeLabel={copy.common.close}
      >
        <DialogTitle className="text-[1.375rem] tracking-[-0.025em]">
          {durationCopy.deleteTitle}
        </DialogTitle>
        <DialogDescription className="text-toy-muted leading-[1.55]">
          {durationCopy.deleteDescription}
        </DialogDescription>
        <DialogFooter>
          <DialogClose asChild>
            <Button
              type="button"
              className="border-toy-line-strong text-toy-text hover:bg-toy-hover hover:text-toy-accent min-h-10 rounded-[2px] bg-transparent font-mono text-xs tracking-[0.08em] uppercase shadow-none max-[520px]:w-full"
            >
              {durationCopy.cancelAction}
            </Button>
          </DialogClose>
          <Button
            type="button"
            className="min-h-10 rounded-[2px] border border-[#b42318] bg-[#b42318] font-mono text-xs tracking-[0.08em] text-white uppercase shadow-none"
            onClick={() => {
              deleteWidget(widget);
              setOpen(false);
            }}
          >
            {durationCopy.deleteAction}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
