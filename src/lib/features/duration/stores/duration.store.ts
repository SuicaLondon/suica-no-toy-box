import { create } from "zustand";
import { DurationWidget } from "../type/duration.type";
import { DURATION_WIDGET_LOCAL_STORAGE_KEY } from "@/constants/duration";

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
      const parsedWidgets = JSON.parse(storedWidgets) ?? [];
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
