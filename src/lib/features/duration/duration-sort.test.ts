import { describe, expect, it } from "vitest";
import { sortDurationWidgets } from "./duration-sort";
import type { DurationWidget } from "./type/duration.type";

const widgets: DurationWidget[] = [
  {
    id: "c295073a-6139-4479-aa9a-e8811a3e9d23",
    name: "Zulu",
    date: new Date("2026-02-01T00:00:00.000Z"),
    repeat: "never",
    type: "none",
  },
  {
    id: "957d27a7-7210-47ec-968c-fd8e3e263c4f",
    name: "Alpha",
    date: new Date("2026-01-01T00:00:00.000Z"),
    repeat: "never",
    type: "none",
  },
];

describe("sortDurationWidgets", () => {
  it("sorts without mutating the source array", () => {
    const sorted = sortDurationWidgets(widgets, "date", "asc");

    expect(sorted.map((widget) => widget.name)).toEqual(["Alpha", "Zulu"]);
    expect(widgets.map((widget) => widget.name)).toEqual(["Zulu", "Alpha"]);
  });

  it("supports descending name order", () => {
    const sorted = sortDurationWidgets(widgets, "name", "desc");

    expect(sorted.map((widget) => widget.name)).toEqual(["Zulu", "Alpha"]);
  });
});
