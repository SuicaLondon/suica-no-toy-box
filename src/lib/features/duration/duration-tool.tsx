"use client";

import toolStyles from "@/app/tool-shell.module.css";
import { useToolI18n } from "@/i18n/tool-i18n";
import { CalendarPlus } from "lucide-react";
import { useEffect } from "react";
import { toast } from "sonner";
import { AddDurationButton } from "./components/add-duration-button";
import { CopyAllDurationsButton } from "./components/copy-all-durations-button";
import { DurationWidgetItem } from "./components/duration-widget";
import { ImportDurationsButton } from "./components/import-durations-button";
import { SortControls } from "./components/sort-controls";
import styles from "./duration.module.css";
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
    <div className={`${toolStyles.workspaceBody} ${styles.board}`}>
      <section
        className={`${toolStyles.panel} ${styles.controlPanel}`}
        aria-label={durationCopy.dates}
      >
        <div className={styles.summary}>
          <span className={toolStyles.panelLabel}>{durationCopy.dates}</span>
          <h2 className={toolStyles.panelTitle}>
            {durationCopy.dateCount(widgets.length)}
          </h2>
        </div>

        <div className={styles.controlActions}>
          <AddDurationButton />
          <CopyAllDurationsButton />
          <ImportDurationsButton />
          <SortControls />
        </div>
      </section>

      {widgets.length > 0 ? (
        <section
          className={toolStyles.durationGrid}
          aria-label={durationCopy.dates}
        >
          {widgets.map((widget) => (
            <DurationWidgetItem key={widget.id} widget={widget} />
          ))}
        </section>
      ) : (
        <section className={toolStyles.emptyState}>
          <div>
            <CalendarPlus className={styles.emptyIcon} aria-hidden="true" />
            <span className={toolStyles.emptyKicker}>{durationCopy.dates}</span>
            <h2>{durationCopy.emptyTitle}</h2>
            <p>{durationCopy.emptyDescription}</p>
          </div>
        </section>
      )}
    </div>
  );
}
