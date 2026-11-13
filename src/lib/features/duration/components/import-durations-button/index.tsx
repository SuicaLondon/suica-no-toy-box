"use client";

import { Label } from "suica-ui/label";

import { Button } from "suica-ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "suica-ui/textarea";
import { useToolI18n } from "@/i18n/tool-i18n";
import { Download } from "lucide-react";
import { type FormEvent, memo, useState } from "react";
import { toast } from "sonner";
import { useDurationStore } from "../../stores/duration.store";

export const ImportDurationsButton = memo(function ImportDurationsButton() {
  const { messages } = useToolI18n();
  const durationMessages = messages.duration;
  const importWidgetsFromText = useDurationStore(
    (state) => state.importWidgetsFromText,
  );
  const [open, setOpen] = useState(false);
  const [importText, setImportText] = useState("");

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={(props) => (
          <Button
            variant="outline"
            {...props}
            type="button"
            className="min-h-10 font-mono text-xs tracking-[0.08em] uppercase max-[520px]:w-full"
          />
        )}
      >
        <Download aria-hidden="true" />
        {durationMessages.importDates}
      </DialogTrigger>
      <DialogContent
        className="max-h-[calc(100svh_-_32px)] w-[min(540px,calc(100%_-_32px))] gap-[22px] overflow-y-auto p-6 font-sans max-[640px]:p-5"
        closeLabel={messages.common.close}
      >
        <DialogHeader>
          <DialogTitle className="text-[1.375rem] tracking-[-0.025em]">
            {durationMessages.importTitle}
          </DialogTitle>
          <DialogDescription className="text-toy-muted leading-[1.55]">
            {durationMessages.importDescription}
          </DialogDescription>
        </DialogHeader>

        <form className="grid gap-4" onSubmit={handleImport}>
          <Label
            className="text-toy-muted font-mono text-[0.6875rem] font-medium tracking-[0.12em] uppercase"
            htmlFor="duration-import"
          >
            {durationMessages.importLabel}
          </Label>
          <Textarea
            id="duration-import"
            value={importText}
            onChange={(event) => setImportText(event.target.value)}
            placeholder={durationMessages.importPlaceholder}
            className="max-h-[42svh] min-h-[180px] w-full resize-y p-4 pr-12 font-mono text-[0.8125rem] leading-[1.55]"
            autoFocus
          />

          <div className="flex items-center justify-end gap-2.5 pt-1 max-[420px]:flex-col-reverse max-[420px]:items-stretch max-[420px]:[&>*]:w-full">
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
              type="submit"
              className="min-h-11 font-mono text-xs tracking-[0.08em] uppercase max-[520px]:w-full"
              disabled={!importText.trim()}
            >
              {durationMessages.importAction}
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
        toast.error(durationMessages.someAlreadyExist);
        return;
      }

      toast.success(durationMessages.imported);
      if (result.skipped > 0) {
        toast.warning(durationMessages.someAlreadyExist);
      }
      setImportText("");
      setOpen(false);
    } catch {
      toast.error(durationMessages.importFailed);
    }
  }
});
