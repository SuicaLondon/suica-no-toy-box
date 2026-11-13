import {
  getImageCompressionError,
  type ImageCompressMessages,
} from "@/i18n/image-compress-messages";
import type { Locale } from "@/i18n/locales";
import type {
  ImageFormat,
  ProcessingLocation,
} from "../compression/compression";
import type { RemoteProgress } from "../remote/remote-compression";
import { FILE_EXTENSION } from "@/utils/regex";

/** "Uploading · 40%", or "Uploading…" before the size is known. */
function withPercent(label: string, percent: number | null): string {
  if (percent === null) return `${label}…`;
  return `${label} · ${percent}%`;
}

/** What a conversion on the server is doing. */
function remoteStatus(
  progress: RemoteProgress | null,
  messages: ImageCompressMessages,
): string {
  if (!progress) return messages.waiting;
  switch (progress.phase) {
    case "uploading":
      return withPercent(messages.uploading, progress.percent);
    case "processing":
      return messages.converting;
    case "downloading":
      return withPercent(messages.downloading, progress.percent);
  }
}

/** How long the next pass on this device should take, once estimated. */
function localStatus(
  estimate: number | null,
  messages: ImageCompressMessages,
): string {
  if (estimate === null) return messages.estimating;
  const low = Math.max(1, Math.floor(estimate / 2));
  const high = Math.ceil(estimate * 1.5);
  return `${messages.nextPass} ${low}–${high} ${messages.seconds}`;
}

const PLACE: Record<ProcessingLocation, "local" | "server"> = {
  local: "local",
  remote: "server",
};

/** The line above the preview: where the conversion stands. */
export function previewStatus(
  state: {
    error: string;
    hasFile: boolean;
    hasSource: boolean;
    hasSettings: boolean;
    result: { elapsed: number } | null;
    missedTarget: boolean;
    location: ProcessingLocation;
    remoteProgress: RemoteProgress | null;
    estimate: number | null;
  },
  messages: ImageCompressMessages,
): string {
  if (state.error) return messages.stopped;
  if (!state.hasFile) return messages.getStarted;
  if (!state.hasSource) return messages.reading;
  if (!state.hasSettings) return messages.checkSettings;
  if (!state.result) {
    if (state.location === "remote") {
      return remoteStatus(state.remoteProgress, messages);
    }
    return localStatus(state.estimate, messages);
  }
  if (state.missedTarget) return messages.targetMissed;
  const place = messages[PLACE[state.location]];
  return `${messages.ready} · ${place} · ${state.result.elapsed.toFixed(1)} ${messages.seconds}`;
}

/** The button beside the status: stop a conversion or retry a failed one. */
export function previewAction(
  pending: boolean,
  failed: boolean,
  messages: ImageCompressMessages,
): string {
  if (pending) return messages.cancel;
  if (failed) return messages.retry;
  return messages.ready;
}

/** Why the preview is showing an alert. */
export function previewAlert(
  error: string,
  fixedSize: boolean,
  locale: Locale,
  messages: ImageCompressMessages,
): string {
  if (error) return getImageCompressionError(error, locale);
  if (fixedSize) {
    return messages.fixedTargetMissed;
  }
  return messages.targetMissedDetail;
}

/** "62.5% smaller", or a wait note before there is a result. */
export function savingsText(
  savings: number | null,
  messages: ImageCompressMessages,
): string {
  if (savings === null) return messages.awaiting;
  const direction = savings >= 0 ? messages.smaller : messages.larger;
  return `${Math.abs(savings).toFixed(1)}% ${direction}`;
}

/** "JPEG · Quality 80", "PNG · Lossless", or a dash before a result. */
export function outputText(
  result: { quality: number; settings: { format: ImageFormat } } | null,
  messages: ImageCompressMessages,
): string {
  if (!result) return "—";
  const { format } = result.settings;
  const detail =
    format === "png"
      ? messages.lossless
      : `${messages.quality} ${result.quality}`;
  return `${format.toUpperCase()} · ${detail}`;
}

const EXTENSION: Record<ImageFormat | "", string> = {
  jpeg: "jpg",
  webp: "webp",
  png: "png",
  "": "",
};

/** "photo-converted.jpg" once a file is picked. */
export function downloadName(
  file: File | null,
  format: ImageFormat | "",
): string {
  if (!file) return "image";
  return `${file.name.replace(FILE_EXTENSION, "")}-converted.${EXTENSION[format]}`;
}

/** Width over height of what the preview shows: the crop, else the image. */
export function aspectRatioOf(
  output: { width: number; height: number } | undefined,
  source: { width: number; height: number } | undefined,
): number {
  if (output) return output.width / output.height;
  if (source) return source.width / source.height;
  return 1;
}
