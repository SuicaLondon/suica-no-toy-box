"use client";

import { useToolI18n } from "@/i18n/tool-i18n";
import { CalendarPlus } from "lucide-react";
import { useEffect } from "react";
import { toast } from "sonner";
import { AddDurationButton } from "./components/add-duration-button";
import { CopyAllDurationsButton } from "./components/copy-all-durations-button";
import { DurationWidgetItem } from "./components/duration-widget";
import { ImportDurationsButton } from "./components/import-durations-button";
import { SortControls } from "./components/sort-controls";
import { useDurationStore } from "./stores/duration.store";

export function DurationTool() {
  const { copy } = useToolI18n();
  const durationCopy = copy.duration;
  const widgets = useDurationStore((state) => state.widgets);
  const loadWidgets = useDurationStore((state) => state.loadWidgets);
  const startTimer = useDurationStore((state) => state.startTimer);
  const stopTimer = useDurationStore((state) => state.stopTimer);

  useEffect(() => {
    try {
      loadWidgets();
    } catch {
      toast.error(durationCopy.importFailed);
    }

    startTimer();

    return stopTimer;
  }, [durationCopy.importFailed, loadWidgets, startTimer, stopTimer]);

  return (
    <div className="mt-5 grid gap-3.5 max-[767px]:mt-[18px]">
      <section
        className="border-toy-line text-toy-text flex items-center justify-between gap-5 rounded-[2px] border bg-[color-mix(in_srgb,var(--toy-bg)_96%,transparent)] px-4 py-3.5 max-[640px]:flex-col max-[640px]:items-stretch"
        aria-label={durationCopy.dates}
      >
        <div className="min-w-max max-[640px]:min-w-0">
          <span className="text-toy-accent font-mono text-[0.6875rem] font-medium tracking-[0.12em] uppercase">
            {durationCopy.dates}
          </span>
          <h2 className="mt-[3px] text-xl leading-tight font-semibold">
            {durationCopy.dateCount(widgets.length)}
          </h2>
        </div>

        <div className="flex flex-wrap items-center justify-end gap-2.5 max-[640px]:w-full max-[420px]:grid max-[420px]:grid-cols-2 max-[640px]:[&>*]:flex-auto max-[420px]:[&>*:first-child]:col-span-2 max-[420px]:[&>*:last-child]:col-span-2">
          <AddDurationButton />
          <CopyAllDurationsButton />
          <ImportDurationsButton />
          <SortControls />
        </div>
      </section>

      {widgets.length > 0 ? (
        <section
          className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,240px),1fr))] gap-3"
          aria-label={durationCopy.dates}
        >
          {widgets.map((widget) => (
            <DurationWidgetItem key={widget.id} widget={widget} />
          ))}
        </section>
      ) : (
        <section className="border-toy-line-strong [&_p]:text-toy-muted flex min-h-60 items-center justify-center border border-dashed px-7 py-12 text-center [&_h2]:mt-2.5 [&_h2]:text-xl [&_h2]:font-semibold [&_p]:mx-auto [&_p]:mt-2.5 [&_p]:max-w-[430px] [&_p]:text-sm [&_p]:leading-[1.6]">
          <div>
            <CalendarPlus
              className="text-toy-accent mx-auto mb-3.5 block size-9 [stroke-width:1.35]"
              aria-hidden="true"
            />
            <span className="text-toy-accent font-mono text-[0.6875rem] font-medium tracking-[0.12em] uppercase">
              {durationCopy.dates}
            </span>
            <h2>{durationCopy.emptyTitle}</h2>
            <p>{durationCopy.emptyDescription}</p>
          </div>
        </section>
      )}
    </div>
  );
}
