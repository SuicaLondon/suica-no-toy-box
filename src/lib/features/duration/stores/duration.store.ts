import { DURATION_WIDGET_LOCAL_STORAGE_KEY } from "@/constants/duration";
import { durationFormSchema } from "@/schemas/duration";
import { z } from "zod";
import { create } from "zustand";
import { parseDurationImportText } from "../duration-import";
import { DurationWidget } from "../type/duration.type";

export type ImportDurationResult =
  | { status: "imported"; count: number; skipped: number }
  | { status: "exists"; count: 0 };

interface DurationStore {
  now: Date;
  timer: NodeJS.Timeout | null;
  widgets: DurationWidget[];
  sortBy: "date" | "name";
  sortDirection: "asc" | "desc";
  addWidget: (widget: DurationWidget) => void;
  deleteWidget: (widget: DurationWidget) => void;
  editWidget: (widget: DurationWidget) => void;
  loadWidgets: () => void;
  copyWidget: (widget: DurationWidget) => Promise<void>;
  copyAllWidgets: () => Promise<number>;
  importWidgetsFromText: (text: string) => ImportDurationResult;
  setSortBy: (sortBy: "date" | "name") => void;
  setSortDirection: (sortDirection: "asc" | "desc") => void;
  startTimer: () => void;
  stopTimer: () => void;
}

export const useDurationStore = create<DurationStore>((set, get) => ({
  now: new Date(),
  timer: null,
  widgets: [],
  sortBy: "date",
  sortDirection: "asc",
  addWidget: (widget: DurationWidget) => {
    const currentWidgets = get().widgets;
    set({ widgets: [...currentWidgets, widget] });
    localStorage.setItem(
      DURATION_WIDGET_LOCAL_STORAGE_KEY,
      JSON.stringify([...currentWidgets, widget]),
    );
  },
  deleteWidget: (widget: DurationWidget) => {
    const currentWidgets = get().widgets;
    const updatedWidgets = currentWidgets.filter((w) => w.id !== widget.id);
    set({ widgets: updatedWidgets });
    localStorage.setItem(
      DURATION_WIDGET_LOCAL_STORAGE_KEY,
      JSON.stringify(updatedWidgets),
    );
  },
  editWidget: (widget: DurationWidget) => {
    const currentWidgets = get().widgets;
    const updatedWidgets = currentWidgets.map((w) =>
      w.id === widget.id ? widget : w,
    );
    set({ widgets: updatedWidgets });
    localStorage.setItem(
      DURATION_WIDGET_LOCAL_STORAGE_KEY,
      JSON.stringify(updatedWidgets),
    );
  },
  loadWidgets: () => {
    const storedWidgets = localStorage.getItem(
      DURATION_WIDGET_LOCAL_STORAGE_KEY,
    );
    if (storedWidgets) {
      const parsedWidgets = z
        .array(durationFormSchema)
        .safeParse(JSON.parse(storedWidgets));

      if (parsedWidgets.success) {
        set({ widgets: parsedWidgets.data });
      }
    }
  },
  setSortBy: (sortBy: "date" | "name") => {
    const sortedWidgets = get().widgets.toSorted((a, b) => {
      if (sortBy === "date") {
        const aDate = new Date(a.date);
        const bDate = new Date(b.date);
        return get().sortDirection === "asc"
          ? aDate.getTime() - bDate.getTime()
          : bDate.getTime() - aDate.getTime();
      }
      return get().sortDirection === "asc"
        ? a.name.localeCompare(b.name)
        : b.name.localeCompare(a.name);
    });
    set({ sortBy, widgets: sortedWidgets });
  },
  copyWidget: async (widget: DurationWidget) => {
    const widgetString = JSON.stringify(widget);
    await navigator.clipboard.writeText(widgetString);
  },
  copyAllWidgets: async () => {
    const widgets = get().widgets;
    const widgetsString = JSON.stringify(widgets);
    await navigator.clipboard.writeText(widgetsString);
    return widgets.length;
  },
  importWidgetsFromText: (text: string) => {
    const widgets = parseDurationImportText(text);
    const currentWidgets = get().widgets;
    const existingIds = new Set(currentWidgets.map((widget) => widget.id));
    const newWidgetsToImport = widgets.filter(
      (widget) => !existingIds.has(widget.id),
    );

    if (newWidgetsToImport.length === 0) {
      return { status: "exists", count: 0 };
    }

    const newWidgets = [...currentWidgets, ...newWidgetsToImport];
    set({ widgets: newWidgets });
    localStorage.setItem(
      DURATION_WIDGET_LOCAL_STORAGE_KEY,
      JSON.stringify(newWidgets),
    );

    return {
      status: "imported",
      count: newWidgetsToImport.length,
      skipped: widgets.length - newWidgetsToImport.length,
    };
  },
  setSortDirection: (sortDirection: "asc" | "desc") => {
    const sortedWidgets = get().widgets.toSorted((a, b) => {
      if (get().sortBy === "date") {
        const aDate = new Date(a.date);
        const bDate = new Date(b.date);
        return sortDirection === "asc"
          ? aDate.getTime() - bDate.getTime()
          : bDate.getTime() - aDate.getTime();
      }
      return sortDirection === "asc"
        ? a.name.localeCompare(b.name)
        : b.name.localeCompare(a.name);
    });
    set({ sortDirection, widgets: sortedWidgets });
  },
  startTimer: () => {
    if (get().timer) {
      return;
    }

    const timer = setInterval(() => {
      set({ now: new Date() });
    }, 1000);
    set({ timer });
  },
  stopTimer: () => {
    const { timer } = get();
    if (timer) {
      clearInterval(timer);
      set({ timer: null });
    }
  },
}));
