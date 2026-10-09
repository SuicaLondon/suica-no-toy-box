import { describe, expect, it } from "vitest";
import { cropRectangle, pixelsPerUnit } from "./crop";
import { initialCrop, resolveOutput } from "./crop-controls";

const output = { width: 100, height: 150, ppi: 300, x: 0.5, y: 0.5, zoom: 1 };

describe("crop geometry and units", () => {
  it("converts physical dimensions using PPI and rounds to whole pixels", () => {
    expect(resolveOutput(initialCrop, 50_000_000)).toMatchObject({
      width: 413,
      height: 531,
      ppi: 300,
    });
    expect(pixelsPerUnit("in", 300)).toBe(300);
    expect(pixelsPerUnit("cm", 300)).toBeCloseTo(118.110236);
    expect(pixelsPerUnit("px", 300)).toBe(1);
    expect(
      resolveOutput({ ...initialCrop, ppi: "600" }, 50_000_000),
    ).toMatchObject({ width: 827, height: 1063 });
  });

  it("rejects incomplete input and mode-specific output limits", () => {
    expect(resolveOutput({ ...initialCrop, width: "" }, 50_000_000)).toBeNull();
    expect(
      resolveOutput(
        { ...initialCrop, unit: "px", width: "5000", height: "5000" },
        20_000_000,
      ),
    ).toBeNull();
  });

  it("centers the crop and keeps zoomed edge selections within the source", () => {
    expect(cropRectangle(600, 400, output)).toEqual({
      left: 167,
      top: 0,
      width: 267,
      height: 400,
    });
    expect(cropRectangle(600, 400, { ...output, zoom: 2, x: 1, y: 1 })).toEqual(
      { left: 467, top: 200, width: 133, height: 200 },
    );
    expect(cropRectangle(1, 1, { ...output, zoom: 10 })).toEqual({
      left: 0,
      top: 0,
      width: 1,
      height: 1,
    });
  });
});
