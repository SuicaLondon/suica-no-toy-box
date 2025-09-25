import { DURATION_WIDGET_LOCAL_STORAGE_KEY } from "@/constants/duration";
import { durationFormSchema } from "@/schemas/duration";
import { toast } from "sonner";
import { z } from "zod";
import { create } from "zustand";
import { DurationWidget } from "../type/duration.type";

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
  copyWidget: (widget: DurationWidget) => void;
  copyAllWidgets: () => void;
  importWidgetFromClipboard: () => Promise<void>;
  importWidgetsFromClipboard: () => Promise<void>;
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
        .parse(JSON.parse(storedWidgets));
      set({ widgets: parsedWidgets });
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
  copyWidget: (widget: DurationWidget) => {
    const widgetString = JSON.stringify(widget);
    navigator.clipboard.writeText(widgetString);
    toast.success("Widget copied to clipboard");
  },
  copyAllWidgets: () => {
    const widgets = get().widgets;
    const widgetsString = JSON.stringify(widgets);
    navigator.clipboard.writeText(widgetsString);
    toast.success(`${widgets.length} widgets copied to clipboard`);
  },
  importWidgetFromClipboard: async () => {
    const widgetsString = await navigator.clipboard.readText();
    const widget = durationFormSchema.parse(JSON.parse(widgetsString));
    const currentWidgets = get().widgets;
    const isExist = currentWidgets.some((w) => w.id === widget.id);
    if (isExist) {
      toast.error("Widget already exists");
      return;
    }
    const newWidgets = [...currentWidgets, widget];
    set({ widgets: newWidgets });
    const newWidgetJson = JSON.stringify(newWidgets);
    localStorage.setItem(DURATION_WIDGET_LOCAL_STORAGE_KEY, newWidgetJson);
  },
  importWidgetsFromClipboard: async () => {
    const widgetsString = await navigator.clipboard.readText();
    const widgets = z
      .array(durationFormSchema)
      .parse(JSON.parse(widgetsString));
    const currentWidgets = get().widgets;
    const isExist = currentWidgets.some((w) =>
      widgets.some((w2) => w2.id === w.id),
    );
    if (isExist) {
      toast.error("Some of the widgets already exist");
      return;
    }
    const newWidgets = [...currentWidgets, ...widgets];
    set({ widgets: newWidgets });
    const newWidgetJson = JSON.stringify(newWidgets);
    localStorage.setItem(DURATION_WIDGET_LOCAL_STORAGE_KEY, newWidgetJson);
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
