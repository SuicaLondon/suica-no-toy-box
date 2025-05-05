"use client";

import { AddDurationButton } from "@/lib/features/duration/add-duration-button";
import {
  DurationWidget,
  DurationWidgetItem,
} from "@/lib/features/duration/duration-widget";
import { useEffect, useState } from "react";

export default function DurationPage() {
  const [widgets, setWidgets] = useState<DurationWidget[]>([]);

  useEffect(() => {
    const storedWidgets = localStorage.getItem("duration-widgets");
    if (storedWidgets) {
      const parsedWidgets = JSON.parse(storedWidgets) ?? [];
      setWidgets(parsedWidgets);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("duration-widgets", JSON.stringify(widgets));
  }, [widgets]);

  const addWidget = (widget: DurationWidget) => {
    setWidgets([...widgets, widget]);
  };

  const deleteWidget = (widgetId: string) => {
    setWidgets(widgets.filter((w) => w.id !== widgetId));
    localStorage.setItem("duration-widgets", JSON.stringify(widgets));
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4 py-16">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl font-bold">Duration Board</h1>
          <AddDurationButton addWidget={addWidget} />
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {widgets.map((widget) => (
            <DurationWidgetItem
              key={widget.id}
              widget={widget}
              onDelete={(widget) => {
                deleteWidget(widget.id);
              }}
            />
          ))}
        </div>
      </div>
    </main>
  );
}
