import type { CompressionSettings } from "./compression";

export type OutputSize = NonNullable<CompressionSettings["output"]>;
export type SizeUnit = "px" | "mm" | "cm" | "in";

export function pixelsPerUnit(unit: SizeUnit, ppi: number) {
  return unit === "px"
    ? 1
    : ppi / (unit === "mm" ? 25.4 : unit === "cm" ? 2.54 : 1);
}

// Use the same integer source rectangle for canvas, Sharp and the preview.
export function cropRectangle(
  width: number,
  height: number,
  output: OutputSize,
) {
  const ratio = output.width / output.height;
  const cropWidth = Math.max(
    1,
    Math.min(width, Math.round(Math.min(width, height * ratio) / output.zoom)),
  );
  const cropHeight = Math.max(
    1,
    Math.min(height, Math.round(Math.min(height, width / ratio) / output.zoom)),
  );
  return {
    left: Math.round((width - cropWidth) * output.x),
    top: Math.round((height - cropHeight) * output.y),
    width: cropWidth,
    height: cropHeight,
  };
}
