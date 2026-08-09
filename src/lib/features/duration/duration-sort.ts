import type { DurationWidget } from "./type/duration.type";

export type DurationSortBy = "date" | "name";
export type DurationSortDirection = "asc" | "desc";

export function sortDurationWidgets(
  widgets: DurationWidget[],
  sortBy: DurationSortBy,
  sortDirection: DurationSortDirection,
) {
  return widgets.toSorted((firstWidget, secondWidget) => {
    const comparison =
      sortBy === "date"
        ? new Date(firstWidget.date).getTime() -
          new Date(secondWidget.date).getTime()
        : firstWidget.name.localeCompare(secondWidget.name);

    return sortDirection === "asc" ? comparison : -comparison;
  });
}
