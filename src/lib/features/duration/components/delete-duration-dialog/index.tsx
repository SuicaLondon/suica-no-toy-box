import toolStyles from "@/app/tool-shell.module.css";
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
import styles from "../../duration.module.css";
import { useDurationStore } from "../../stores/duration.store";
import { DurationWidget } from "../../type/duration.type";

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
  const { copy } = useToolI18n();
  const durationCopy = copy.duration;
  const deleteWidget = useDurationStore((state) => state.deleteWidget);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent
        className={styles.dialogContent}
        closeLabel={copy.common.close}
      >
        <DialogTitle className={styles.dialogTitle}>
          {durationCopy.deleteTitle}
        </DialogTitle>
        <DialogDescription className={styles.dialogDescription}>
          {durationCopy.deleteDescription}
        </DialogDescription>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" className={toolStyles.secondaryButton}>
              {durationCopy.cancelAction}
            </Button>
          </DialogClose>
          <Button
            type="button"
            className={toolStyles.dangerButton}
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
