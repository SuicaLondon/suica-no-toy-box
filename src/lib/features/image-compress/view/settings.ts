import type { ImageCompressMessages } from "@/i18n/image-compress-messages";
import {
  MAX_IMAGE_DIMENSION,
  type CompressionMode,
  type CompressionSettings,
  type ImageFormat,
} from "../compression/compression";
import type { OutputSize } from "../compression/crop";

/** "1.5" MB as bytes, or null when it is not a usable size limit. */
export function targetBytes(megabytes: string): number | null {
  const bytes = Math.floor(Number(megabytes) * 1_000_000);
  if (!Number.isSafeInteger(bytes) || Number(megabytes) < 0.001) return null;
  return bytes;
}

/** What the form describes, or null until it describes a conversion. */
export function buildSettings(form: {
  format: ImageFormat | "";
  mode: CompressionMode;
  targetMB: string;
  quality: number;
  /** The exact size when one is set: undefined when off, null when invalid. */
  output: OutputSize | null | undefined;
}): CompressionSettings | null {
  const { format, mode, quality, output } = form;
  const bytes = targetBytes(form.targetMB);
  if (!format || output === null) return null;
  if (mode === "size" && bytes === null) return null;
  return {
    format,
    mode,
    targetBytes: mode === "size" && bytes !== null ? bytes : 1,
    quality,
    // The encoder clamps this limit to the source width without upscaling.
    width: MAX_IMAGE_DIMENSION,
    ...(output ? { output } : {}),
  };
}

/** The note under the size limit: an error, or how the limit is met. */
export function targetNote(
  valid: boolean,
  fixedSize: boolean,
  messages: ImageCompressMessages,
): string {
  if (!valid) return messages.targetError;
  if (fixedSize) return messages.fixedTargetHint;
  return messages.targetHint;
}
