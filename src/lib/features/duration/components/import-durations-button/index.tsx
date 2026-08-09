"use client";

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
        <Button
          type="button"
          className="border-toy-line-strong text-toy-text hover:bg-toy-hover hover:text-toy-accent min-h-10 rounded-[2px] bg-transparent font-mono text-xs tracking-[0.08em] uppercase shadow-none max-[520px]:w-full"
        >
          <Download aria-hidden="true" />
          {durationCopy.importDates}
        </Button>
      </DialogTrigger>
      <DialogContent
        className="border-toy-line-strong bg-toy-bg text-toy-text max-h-[calc(100svh_-_32px)] w-[min(540px,calc(100%_-_32px))] gap-[22px] overflow-y-auto rounded-[2px] p-6 font-sans max-[640px]:p-5"
        closeLabel={copy.common.close}
      >
        <DialogHeader>
          <DialogTitle className="text-[1.375rem] tracking-[-0.025em]">
            {durationCopy.importTitle}
          </DialogTitle>
          <DialogDescription className="text-toy-muted leading-[1.55]">
            {durationCopy.importDescription}
          </DialogDescription>
        </DialogHeader>

        <form className="grid gap-4" onSubmit={handleImport}>
          <label
            className="text-toy-muted font-mono text-[0.6875rem] font-medium tracking-[0.12em] uppercase"
            htmlFor="duration-import"
          >
            {durationCopy.importLabel}
          </label>
          <Textarea
            id="duration-import"
            value={importText}
            onChange={(event) => setImportText(event.target.value)}
            placeholder={durationCopy.importPlaceholder}
            className="border-toy-line-strong text-toy-text placeholder:text-toy-muted/75 focus-visible:border-toy-accent focus-visible:ring-toy-accent max-h-[42svh] min-h-[180px] w-full resize-y rounded-[2px] bg-transparent p-4 pr-12 font-mono text-[0.8125rem] leading-[1.55] shadow-none focus-visible:ring-1 focus-visible:ring-offset-2"
            autoFocus
          />

          <div className="flex items-center justify-end gap-2.5 pt-1 max-[420px]:flex-col-reverse max-[420px]:items-stretch max-[420px]:[&>*]:w-full">
            <DialogClose asChild>
              <Button
                type="button"
                className="border-toy-line-strong text-toy-text hover:bg-toy-hover hover:text-toy-accent min-h-10 rounded-[2px] bg-transparent font-mono text-xs tracking-[0.08em] uppercase shadow-none max-[520px]:w-full"
              >
                {durationCopy.cancelAction}
              </Button>
            </DialogClose>
            <Button
              type="submit"
              className="border-toy-accent bg-toy-accent text-toy-bg hover:text-toy-bg min-h-11 rounded-[2px] border font-mono text-xs tracking-[0.08em] uppercase shadow-none hover:bg-[color-mix(in_srgb,var(--toy-accent)_88%,var(--toy-text))] max-[520px]:w-full"
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
