"use client";

import { AddDurationButton } from "@/lib/features/duration/components/add-duration-button";
import { DurationWidgetItem } from "@/lib/features/duration/components/duration-widget";
import { useDurationStore } from "@/lib/features/duration/stores/duration.store";
import { useEffect } from "react";

export default function DurationPage() {
  const widgets = useDurationStore((state) => state.widgets);
  const loadWidgets = useDurationStore((state) => state.loadWidgets);
  const startTimer = useDurationStore((state) => state.startTimer);
  const stopTimer = useDurationStore((state) => state.stopTimer);

  useEffect(() => {
    loadWidgets();
    startTimer();
    return () => {
      stopTimer();
    };
  }, [loadWidgets, startTimer, stopTimer]);

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4 py-16">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl font-bold">Duration Board</h1>
          <AddDurationButton />
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {widgets.map((widget) => (
            <DurationWidgetItem key={widget.id} widget={widget} />
          ))}
        </div>
      </div>
    </main>
  );
}
