"use client";

import {
  MAX_IMAGE_DIMENSION,
  outputSizeSchema,
} from "@/schemas/image-compress";
import { pixelsPerUnit, type OutputSize, type SizeUnit } from "./crop";

export interface CropDraft {
  enabled: boolean;
  width: string;
  height: string;
  unit: SizeUnit;
  ppi: string;
  x: number;
  y: number;
  zoom: number;
}

export const initialCrop: CropDraft = {
  enabled: false,
  width: "35",
  height: "45",
  unit: "mm",
  ppi: "300",
  x: 0.5,
  y: 0.5,
  zoom: 1,
};

export function resolveOutput(
  draft: CropDraft,
  maxPixels: number,
): OutputSize | null {
  const scale = pixelsPerUnit(draft.unit, Number(draft.ppi));
  const parsed = outputSizeSchema.safeParse({
    width: Math.round(Number(draft.width) * scale),
    height: Math.round(Number(draft.height) * scale),
    ppi: Number(draft.ppi),
    x: draft.x,
    y: draft.y,
    zoom: draft.zoom,
  });
  return parsed.success && parsed.data.width * parsed.data.height <= maxPixels
    ? parsed.data
    : null;
}

const inputClass =
  "border-toy-line bg-background w-full rounded-md border px-3 py-2 text-sm";

export function CropControls({
  draft,
  onChange,
  output,
  maxPixels,
}: {
  draft: CropDraft;
  onChange: (value: CropDraft) => void;
  output: OutputSize | null;
  maxPixels: number;
}) {
  function changeUnit(unit: SizeUnit) {
    const factor =
      pixelsPerUnit(draft.unit, Number(draft.ppi)) /
      pixelsPerUnit(unit, Number(draft.ppi));
    const convert = (value: string) => {
      const converted = Number(value) * factor;
      return Number.isFinite(converted) && converted > 0
        ? String(Number(converted.toFixed(unit === "px" ? 0 : 4)))
        : value;
    };
    onChange({
      ...draft,
      unit,
      width: convert(draft.width),
      height: convert(draft.height),
    });
  }
  return (
    <fieldset className="border-toy-line grid gap-3 border-t pt-4">
      <legend className="text-sm font-medium">Crop & output size</legend>
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={draft.enabled}
          onChange={(event) =>
            onChange({ ...draft, enabled: event.target.checked })
          }
          className="accent-toy-accent"
        />
        Set exact dimensions
      </label>
      {draft.enabled ? (
        <>
          <div className="grid grid-cols-2 gap-3">
            <label className="grid gap-1 text-sm">
              Width
              <input
                aria-label="Output width"
                type="number"
                min="0"
                step="any"
                value={draft.width}
                onChange={(event) =>
                  onChange({ ...draft, width: event.target.value })
                }
                className={inputClass}
              />
            </label>
            <label className="grid gap-1 text-sm">
              Height
              <input
                aria-label="Output height"
                type="number"
                min="0"
                step="any"
                value={draft.height}
                onChange={(event) =>
                  onChange({ ...draft, height: event.target.value })
                }
                className={inputClass}
              />
            </label>
            <label className="grid gap-1 text-sm">
              Units
              <select
                aria-label="Size units"
                value={draft.unit}
                onChange={(event) => changeUnit(event.target.value as SizeUnit)}
                className={inputClass}
              >
                <option value="px">px</option>
                <option value="mm">mm</option>
                <option value="cm">cm</option>
                <option value="in">in</option>
              </select>
            </label>
            <label className="grid gap-1 text-sm">
              Resolution (PPI)
              <input
                aria-label="Resolution (PPI)"
                type="number"
                min="1"
                max="2400"
                step="1"
                value={draft.ppi}
                onChange={(event) =>
                  onChange({ ...draft, ppi: event.target.value })
                }
                className={inputClass}
              />
            </label>
          </div>
          {output ? (
            <p className="text-toy-muted text-xs">
              {output.width} × {output.height} px · {output.ppi} PPI. Dimensions
              stay fixed during compression.
            </p>
          ) : (
            <p role="alert" className="text-toy-error text-xs">
              Enter positive dimensions and a resolution from 1 to 2,400 PPI.
              Output is limited to {maxPixels / 1_000_000} MP and{" "}
              {MAX_IMAGE_DIMENSION.toLocaleString("en-US")} px per side.
            </p>
          )}
          <p className="text-toy-muted text-xs">
            Physical dimensions are rounded to whole pixels. Print at actual
            size (100%) to preserve the intended size.
          </p>
        </>
      ) : null}
    </fieldset>
  );
}
