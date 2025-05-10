"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { AddDurationButton } from "@/lib/features/duration/components/add-duration-button";
import { DurationWidgetItem } from "@/lib/features/duration/components/duration-widget";
import { useDurationStore } from "@/lib/features/duration/stores/duration.store";
import { useEffect } from "react";

export default function DurationPage() {
  const { widgets, loadWidgets } = useDurationStore();

  useEffect(() => {
    loadWidgets();
  }, [loadWidgets]);

  console.log(widgets);

  if (widgets.length === 0) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Skeleton className="h-10 w-3xl max-w-md" />
        <Skeleton className="h-10 w-3xl max-w-md" />
        <Skeleton className="h-10 w-3xl max-w-md" />
      </div>
    );
  }

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
