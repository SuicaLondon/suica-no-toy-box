"use client";

import toolStyles from "@/app/tool-shell.module.css";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useToolI18n } from "@/i18n/tool-i18n";
import { Download } from "lucide-react";
import { type FormEvent, memo, useState } from "react";
import { toast } from "sonner";
import styles from "../../duration.module.css";
import { useDurationStore } from "../../stores/duration.store";

export const ImportDurationsButton = memo(function ImportDurationsButton() {
  const { copy } = useToolI18n();
  const durationCopy = copy.duration;
  const importWidgetsFromText = useDurationStore(
    (state) => state.importWidgetsFromText,
  );
  const [open, setOpen] = useState(false);
  const [importText, setImportText] = useState("");

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button" className={toolStyles.secondaryButton}>
          <Download aria-hidden="true" />
          {durationCopy.importDates}
        </Button>
      </DialogTrigger>
      <DialogContent
        className={styles.dialogContent}
        closeLabel={copy.common.close}
      >
        <DialogHeader>
          <DialogTitle className={styles.dialogTitle}>
            {durationCopy.importTitle}
          </DialogTitle>
          <DialogDescription className={styles.dialogDescription}>
            {durationCopy.importDescription}
          </DialogDescription>
        </DialogHeader>

        <form className={styles.dialogForm} onSubmit={handleImport}>
          <label className={toolStyles.fieldLabel} htmlFor="duration-import">
            {durationCopy.importLabel}
          </label>
          <Textarea
            id="duration-import"
            value={importText}
            onChange={(event) => setImportText(event.target.value)}
            placeholder={durationCopy.importPlaceholder}
            className={`${toolStyles.textarea} ${styles.importTextarea}`}
            autoFocus
          />

          <div className={styles.dialogActions}>
            <DialogClose asChild>
              <Button type="button" className={toolStyles.secondaryButton}>
                {durationCopy.cancelAction}
              </Button>
            </DialogClose>
            <Button
              type="submit"
              className={toolStyles.primaryButton}
              disabled={!importText.trim()}
            >
              {durationCopy.importAction}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );

  function handleImport(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      const result = importWidgetsFromText(importText);

      if (result.status === "exists") {
        toast.error(durationCopy.someAlreadyExist);
        return;
      }

      toast.success(durationCopy.imported);
      if (result.skipped > 0) {
        toast.warning(durationCopy.someAlreadyExist);
      }
      setImportText("");
      setOpen(false);
    } catch {
      toast.error(durationCopy.importFailed);
    }
  }
});
