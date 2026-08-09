import { create } from "zustand";
import { parseDurationImportText } from "../duration-import";
import {
  type DurationSortBy,
  type DurationSortDirection,
  sortDurationWidgets,
} from "../duration-sort";
import { loadDurationWidgets, saveDurationWidgets } from "../duration-storage";
import { DurationWidget } from "../type/duration.type";

export type ImportDurationResult =
  | { status: "imported"; count: number; skipped: number }
  | { status: "exists"; count: 0 };

interface DurationStore {
  now: Date;
  timer: NodeJS.Timeout | null;
  widgets: DurationWidget[];
  sortBy: DurationSortBy;
  sortDirection: DurationSortDirection;
  addWidget: (widget: DurationWidget) => void;
  deleteWidget: (widget: DurationWidget) => void;
  editWidget: (widget: DurationWidget) => void;
  loadWidgets: () => void;
  copyWidget: (widget: DurationWidget) => Promise<void>;
  copyAllWidgets: () => Promise<number>;
  importWidgetsFromText: (text: string) => ImportDurationResult;
  setSortBy: (sortBy: DurationSortBy) => void;
  setSortDirection: (sortDirection: DurationSortDirection) => void;
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
    const widgets = [...currentWidgets, widget];
    set({ widgets });
    saveDurationWidgets(widgets);
  },
  deleteWidget: (widget: DurationWidget) => {
    const currentWidgets = get().widgets;
    const updatedWidgets = currentWidgets.filter((w) => w.id !== widget.id);
    set({ widgets: updatedWidgets });
    saveDurationWidgets(updatedWidgets);
  },
  editWidget: (widget: DurationWidget) => {
    const currentWidgets = get().widgets;
    const updatedWidgets = currentWidgets.map((w) =>
      w.id === widget.id ? widget : w,
    );
    set({ widgets: updatedWidgets });
    saveDurationWidgets(updatedWidgets);
  },
  loadWidgets: () => {
    const widgets = loadDurationWidgets();
    if (widgets) {
      set({ widgets });
    }
  },
  setSortBy: (sortBy: DurationSortBy) => {
    const sortedWidgets = sortDurationWidgets(
      get().widgets,
      sortBy,
      get().sortDirection,
    );
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
    saveDurationWidgets(newWidgets);

    return {
      status: "imported",
      count: newWidgetsToImport.length,
      skipped: widgets.length - newWidgetsToImport.length,
    };
  },
  setSortDirection: (sortDirection: DurationSortDirection) => {
    const sortedWidgets = sortDurationWidgets(
      get().widgets,
      get().sortBy,
      sortDirection,
    );
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
