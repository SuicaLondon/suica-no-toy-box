import { outputSizeSchema } from "@/schemas/image-compress";
import {
  pixelsPerUnit,
  type OutputSize,
  type SizeUnit,
} from "../compression/crop";

/** The exact-size form as typed: strings until they parse. */
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

/** A passport photo, 35 × 45 mm at 300 PPI, centred. */
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

/** The output size in pixels, or null when the draft is not a valid size. */
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
  if (!parsed.success) return null;
  if (parsed.data.width * parsed.data.height > maxPixels) return null;
  return parsed.data;
}

/** The draft in another unit, keeping the same physical size. */
export function changeDraftUnit(draft: CropDraft, unit: SizeUnit): CropDraft {
  const ppi = Number(draft.ppi);
  const factor = pixelsPerUnit(draft.unit, ppi) / pixelsPerUnit(unit, ppi);
  const convert = (value: string) => {
    const converted = Number(value) * factor;
    if (!Number.isFinite(converted) || converted <= 0) return value;
    return String(Number(converted.toFixed(unit === "px" ? 0 : 4)));
  };
  return {
    ...draft,
    unit,
    width: convert(draft.width),
    height: convert(draft.height),
  };
}
