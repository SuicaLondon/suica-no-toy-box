"use client";

/* Object URLs keep local images out of the server optimizer. */
/* eslint-disable @next/next/no-img-element */
import { getImageCompressionError } from "@/i18n/image-compress-copy";
import { useToolI18n } from "@/i18n/tool-i18n";
import { useEffect, useRef, useState } from "react";
import { ArrowDownToLine, ImagePlus } from "lucide-react";
import { Card } from "suica-ui/card";
import { Button } from "suica-ui/button";
import {
  formatBytes,
  type CompressionSettings,
  type ImageFormat,
  type ProcessingLocation,
} from "../compression";
import type { useImageCompression } from "@/hooks/use-image-compression";
import { cropRectangle } from "../crop";
import {
  useCropGestures,
  zoomCrop,
  type CropPosition,
} from "./use-crop-gestures";
import styles from "./image-preview.module.css";

interface ImagePreviewProps {
  file: File | null;
  settings: CompressionSettings | null;
  format: ImageFormat | "";
  location: ProcessingLocation;
  compression: ReturnType<typeof useImageCompression>;
  onUseLocal: () => void;
  onReposition?: (position: CropPosition) => void;
}

export function ImagePreview({
  file,
  settings,
  format,
  location,
  compression,
  onUseLocal,
  onReposition,
}: ImagePreviewProps) {
  const { copy, locale } = useToolI18n();
  const t = copy["image-compress"];
  const {
    source,
    result,
    previousResult,
    error,
    estimate,
    remoteProgress,
    cancel,
    retry,
  } = compression;
  const [split, setSplit] = useState(50);
  const comparisonPointer = useRef<number | null>(null);
  const displayResult = result ?? previousResult;
  const previewFrame = useRef<HTMLDivElement>(null);
  const [frameSize, setFrameSize] = useState({ width: 0, height: 0 });
  useEffect(() => {
    const frame = previewFrame.current;
    if (!frame) return;
    const observer = new ResizeObserver(([entry]) =>
      setFrameSize({
        width: entry.contentRect.width,
        height: entry.contentRect.height,
      }),
    );
    observer.observe(frame);
    return () => observer.disconnect();
  }, []);
  const previewOutput = settings
    ? settings.output
    : displayResult?.settings.output;
  const canReposition = Boolean(settings?.output && onReposition);
  const gestures = useCropGestures(
    source?.bitmap.width ?? 0,
    source?.bitmap.height ?? 0,
    settings?.output,
    onReposition,
  );
  const changeZoom = (zoom: number) => {
    if (source && settings?.output)
      onReposition?.(
        zoomCrop(
          source.bitmap.width,
          source.bitmap.height,
          settings.output,
          zoom,
        ),
      );
  };
  // Show the current crop immediately while its encoded result is being prepared.
  const previewResult =
    displayResult?.settings.output === previewOutput ? displayResult : null;
  const reposition = (x: number, y: number) =>
    onReposition?.({
      x: Math.max(0, Math.min(1, x)),
      y: Math.max(0, Math.min(1, y)),
    });
  const crop =
    source && previewOutput
      ? cropRectangle(source.bitmap.width, source.bitmap.height, previewOutput)
      : null;
  const isEnlarged = Boolean(
    crop &&
      previewOutput &&
      (previewOutput.width > crop.width || previewOutput.height > crop.height),
  );
  const originalStyle =
    crop && source
      ? {
          position: "absolute" as const,
          maxWidth: "none",
          width: `${(source.bitmap.width / crop.width) * 100}%`,
          height: `${(source.bitmap.height / crop.height) * 100}%`,
          left: `${(-crop.left / crop.width) * 100}%`,
          top: `${(-crop.top / crop.height) * 100}%`,
        }
      : undefined;
  const aspectRatio = previewOutput
    ? previewOutput.width / previewOutput.height
    : source
      ? source.bitmap.width / source.bitmap.height
      : 1;
  const previewWidth = Math.min(
    frameSize.width,
    frameSize.height * aspectRatio,
  );
  const pending = Boolean(file && !error && (!source || (settings && !result)));
  const missedTarget = Boolean(
    result &&
      settings?.mode === "size" &&
      settings &&
      result.blob.size > settings.targetBytes,
  );
  const savings =
    displayResult && file ? (1 - displayResult.blob.size / file.size) * 100 : 0;
  const downloadName = file
    ? `${file.name.replace(/\.[^.]+$/, "")}-converted.${format === "jpeg" ? "jpg" : format}`
    : "image";

  return (
    <Card className="min-w-0 overflow-hidden p-5" aria-busy={pending}>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-toy-muted font-mono text-xs tracking-widest uppercase">
            {t.livePreview}
          </p>
          <p className="text-toy-muted mt-1 text-xs">
            {canReposition
              ? "Drag the divider to compare, or drag the image to reposition. Scroll or pinch to zoom. Arrow keys move the crop; + and - zoom."
              : t.previewHint}
          </p>
        </div>
        <a
          href={result?.url}
          target="_blank"
          rel="noreferrer"
          aria-disabled={!result}
          tabIndex={result ? 0 : -1}
          className={`text-sm underline ${!result ? "pointer-events-none opacity-40" : ""}`}
        >
          {t.fullSize}
        </a>
      </div>
      <div className="mb-3 flex h-12 items-center gap-3">
        <div
          className="text-toy-muted flex min-w-0 flex-1 items-center gap-2 text-xs"
          role="status"
          aria-live="polite"
        >
          <span>
            {error
              ? t.stopped
              : !file
                ? t.getStarted
                : !source
                  ? t.reading
                  : !settings
                    ? t.checkSettings
                    : !result
                      ? location === "remote"
                        ? !remoteProgress
                          ? t.waiting
                          : remoteProgress.phase === "uploading"
                            ? `${t.uploading}${remoteProgress.percent === null ? "…" : ` · ${remoteProgress.percent}%`}`
                            : remoteProgress.phase === "processing"
                              ? t.converting
                              : `${t.downloading}${remoteProgress.percent === null ? "…" : ` · ${remoteProgress.percent}%`}`
                        : estimate === null
                          ? t.estimating
                          : `${t.nextPass} ${Math.max(1, Math.floor(estimate / 2))}–${Math.ceil(estimate * 1.5)} ${t.seconds}`
                      : missedTarget
                        ? t.targetMissed
                        : `${t.ready} · ${location === "remote" ? t.server : t.local} · ${result.elapsed.toFixed(1)} ${t.seconds}`}
          </span>
        </div>
        <Button
          type="button"
          onClick={pending ? cancel : retry}
          disabled={!pending && !error}
          className="min-w-20"
        >
          {pending ? t.cancel : error ? t.retry : t.ready}
        </Button>
      </div>
      <div
        ref={previewFrame}
        data-testid="image-preview-frame"
        className="border-toy-line relative flex items-center justify-center overflow-hidden rounded-lg border bg-[conic-gradient(#d9ddd8_25%,#f4f5f2_0_50%,#d9ddd8_0_75%,#f4f5f2_0)] bg-[length:20px_20px]"
        style={{ height: "clamp(240px, 55svh, 640px)" }}
        aria-label={t.comparisonPreview}
        aria-busy={pending}
      >
        {source ? (
          <div
            className={`relative shrink-0 overflow-hidden ${canReposition ? "focus-visible:outline-toy-accent cursor-move touch-none select-none focus-visible:outline-2" : ""}`}
            role={canReposition ? "group" : undefined}
            aria-label={
              canReposition ? "Reposition crop in preview" : undefined
            }
            tabIndex={canReposition ? 0 : undefined}
            {...gestures}
            onKeyDown={(event) => {
              if (
                canReposition &&
                previewOutput &&
                ["+", "=", "-"].includes(event.key)
              ) {
                event.preventDefault();
                changeZoom(
                  previewOutput.zoom * (event.key === "-" ? 1 / 1.1 : 1.1),
                );
                return;
              }
              if (
                !canReposition ||
                !previewOutput ||
                !["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(
                  event.key,
                )
              )
                return;
              event.preventDefault();
              const step = event.shiftKey ? 0.1 : 0.01;
              reposition(
                previewOutput.x +
                  (event.key === "ArrowLeft"
                    ? step
                    : event.key === "ArrowRight"
                      ? -step
                      : 0),
                previewOutput.y +
                  (event.key === "ArrowUp"
                    ? step
                    : event.key === "ArrowDown"
                      ? -step
                      : 0),
              );
            }}
            style={{
              width: previewWidth,
              height: previewWidth / aspectRatio,
            }}
          >
            <img
              src={source.url}
              alt={t.originalImage}
              style={originalStyle}
              className="block h-full w-full"
              draggable={false}
            />
            {previewResult || (pending && !canReposition) ? (
              <>
                <div
                  className="absolute inset-0 bg-[conic-gradient(#d9ddd8_25%,#f4f5f2_0_50%,#d9ddd8_0_75%,#f4f5f2_0)] bg-[length:20px_20px]"
                  style={{ clipPath: `inset(0 0 0 ${split}%)` }}
                >
                  <img
                    src={previewResult?.url ?? source.url}
                    alt={previewResult ? t.convertedImage : t.preparing}
                    style={previewResult ? undefined : originalStyle}
                    className={`h-full w-full ${styles.outputImage}`}
                    data-processing={pending}
                    data-location={location}
                    draggable={false}
                  />
                  {pending || location === "local" ? (
                    <div
                      data-testid="preview-loading"
                      data-active={pending}
                      data-location={location}
                      aria-hidden="true"
                      className={styles.loading}
                      style={{ left: `${split}%` }}
                    />
                  ) : null}
                </div>
                <div
                  className="pointer-events-none absolute inset-y-0 w-0.5 bg-white shadow"
                  style={{ left: `${split}%` }}
                >
                  <span
                    className="absolute top-1/2 left-1/2 flex size-8 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white text-sm text-black shadow"
                    aria-hidden="true"
                  >
                    ↔
                  </span>
                </div>
                {canReposition ? (
                  <div
                    role="slider"
                    aria-label={t.compare}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuenow={Math.round(split)}
                    aria-orientation="horizontal"
                    tabIndex={0}
                    className="focus-visible:outline-toy-accent absolute inset-y-0 z-10 w-11 -translate-x-1/2 cursor-ew-resize touch-none focus-visible:outline-2"
                    style={{ left: `${split}%` }}
                    onPointerDown={(event) => {
                      event.stopPropagation();
                      if (event.button !== 0) return;
                      comparisonPointer.current = event.pointerId;
                      event.currentTarget.setPointerCapture(event.pointerId);
                    }}
                    onPointerMove={(event) => {
                      event.stopPropagation();
                      if (comparisonPointer.current !== event.pointerId) return;
                      const frame =
                        event.currentTarget.parentElement?.getBoundingClientRect();
                      if (frame?.width)
                        setSplit(
                          Math.max(
                            0,
                            Math.min(
                              100,
                              ((event.clientX - frame.left) / frame.width) *
                                100,
                            ),
                          ),
                        );
                    }}
                    onPointerUp={(event) => {
                      event.stopPropagation();
                      comparisonPointer.current = null;
                    }}
                    onPointerCancel={(event) => {
                      event.stopPropagation();
                      comparisonPointer.current = null;
                    }}
                    onLostPointerCapture={() => {
                      comparisonPointer.current = null;
                    }}
                    onKeyDown={(event) => {
                      event.stopPropagation();
                      if (
                        ![
                          "ArrowLeft",
                          "ArrowRight",
                          "ArrowUp",
                          "ArrowDown",
                          "Home",
                          "End",
                        ].includes(event.key)
                      )
                        return;
                      event.preventDefault();
                      const step = event.shiftKey ? 10 : 1;
                      setSplit((value) =>
                        event.key === "Home"
                          ? 0
                          : event.key === "End"
                            ? 100
                            : Math.max(
                                0,
                                Math.min(
                                  100,
                                  value +
                                    (["ArrowRight", "ArrowUp"].includes(
                                      event.key,
                                    )
                                      ? step
                                      : -step),
                                ),
                              ),
                      );
                    }}
                  />
                ) : (
                  <input
                    type="range"
                    aria-label={t.compare}
                    min="0"
                    max="100"
                    value={split}
                    onChange={(event) => setSplit(Number(event.target.value))}
                    className="absolute inset-0 h-full w-full cursor-ew-resize opacity-0 focus-visible:opacity-30"
                  />
                )}
              </>
            ) : null}
          </div>
        ) : pending ? (
          <div className="bg-background/80 h-full w-full" aria-hidden="true" />
        ) : (
          <div className="text-toy-muted bg-background/80 flex h-full w-full flex-col items-center justify-center gap-3">
            <ImagePlus className="size-10" strokeWidth={1} aria-hidden="true" />
            <p className="text-sm">{t.emptyPreview}</p>
          </div>
        )}
        {error || missedTarget ? (
          <div
            role="alert"
            className="border-toy-line bg-background/95 absolute inset-x-3 bottom-3 z-10 rounded-md border p-3 text-sm shadow-sm"
          >
            <p>
              {error
                ? getImageCompressionError(error, locale)
                : settings?.output
                  ? "The size limit could not be reached at these fixed dimensions. Download the smallest result found, increase the limit, or choose another format."
                  : t.targetMissedDetail}
            </p>
            {error && location === "remote" ? (
              <button
                type="button"
                className="text-toy-accent mt-2 underline"
                onClick={onUseLocal}
              >
                {t.useLocal}
              </button>
            ) : null}
          </div>
        ) : null}
        {pending && location === "remote" && remoteProgress?.percent != null ? (
          <progress
            aria-label={
              remoteProgress.phase === "uploading"
                ? t.uploadProgress
                : t.downloadProgress
            }
            value={remoteProgress.percent}
            max={100}
            className="accent-toy-accent absolute inset-x-0 bottom-0 z-10 h-1 w-full"
          />
        ) : null}
        {source && (displayResult || pending) ? (
          <>
            <span className="pointer-events-none absolute top-3 left-3 rounded bg-black/65 px-2 py-1 text-xs text-white">
              {previewOutput ? "Original crop" : t.original}
            </span>
            <span className="pointer-events-none absolute top-3 right-3 rounded bg-black/65 px-2 py-1 text-xs text-white">
              {pending ? t.processingOutput : t.result}
            </span>
          </>
        ) : null}
      </div>
      {canReposition && previewOutput ? (
        <div className="mt-3 grid gap-1">
          <div className="text-toy-muted flex items-start justify-between gap-3 text-xs">
            <label
              htmlFor="preview-zoom"
              className="w-24 shrink-0 tabular-nums"
            >
              Zoom · {previewOutput.zoom.toFixed(2)}×
            </label>
            <p
              role="status"
              aria-hidden={!isEnlarged}
              className={`text-right ${isEnlarged ? "" : "invisible"}`}
            >
              This crop will be enlarged. The result may look blurry.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <input
              id="preview-zoom"
              type="range"
              aria-label="Zoom"
              min="1"
              max="10"
              step="0.01"
              value={previewOutput.zoom}
              onChange={(event) => changeZoom(Number(event.target.value))}
              className="accent-toy-accent min-w-0 flex-1"
            />
            <button
              type="button"
              className="text-toy-accent shrink-0 text-sm underline"
              onClick={() => onReposition?.({ x: 0.5, y: 0.5, zoom: 1 })}
            >
              Reset crop
            </button>
          </div>
        </div>
      ) : null}
      <div className="my-3 grid gap-2 tabular-nums sm:grid-cols-3">
        <div className="grid grid-cols-[5rem_1fr] items-start gap-x-2 text-right sm:block sm:min-h-16 sm:text-left">
          <p className="text-toy-muted text-xs">{t.fileSize}</p>
          <p className="mt-1 text-sm font-medium">
            {file ? formatBytes(file.size) : "—"} →{" "}
            {displayResult ? formatBytes(displayResult.blob.size) : "—"}
          </p>
          <p className="text-toy-muted col-start-2 mt-1 text-xs">
            {displayResult
              ? `${Math.abs(savings).toFixed(1)}% ${savings >= 0 ? t.smaller : t.larger}`
              : t.awaiting}
          </p>
        </div>
        <div className="grid grid-cols-[5rem_1fr] items-start gap-x-2 text-right sm:block sm:min-h-16 sm:text-left">
          <p className="text-toy-muted text-xs">{t.dimensions}</p>
          <p className="mt-1 text-sm font-medium">
            {source ? `${source.bitmap.width} × ${source.bitmap.height}` : "—"}{" "}
            →{" "}
            {displayResult
              ? `${displayResult.width} × ${displayResult.height}`
              : "—"}
          </p>
        </div>
        <div className="grid grid-cols-[5rem_1fr] items-start gap-x-2 text-right sm:block sm:min-h-16 sm:text-left">
          <p className="text-toy-muted text-xs">{t.output}</p>
          <p className="mt-1 text-sm font-medium">
            {displayResult
              ? `${displayResult.settings.format.toUpperCase()} · ${displayResult.settings.format === "png" ? t.lossless : `${t.quality} ${displayResult.quality}`}`
              : "—"}
          </p>
        </div>
      </div>
      <a
        href={result?.url}
        download={downloadName}
        aria-disabled={!result}
        tabIndex={result ? 0 : -1}
        className={`bg-toy-accent inline-flex min-h-11 items-center justify-center gap-2 rounded-md px-5 text-sm font-medium text-white focus-visible:outline-2 focus-visible:outline-offset-4 ${!result ? "pointer-events-none opacity-40" : ""}`}
      >
        <ArrowDownToLine className="size-4" aria-hidden="true" />
        {t.download} {format ? format.toUpperCase() : t.image}
      </a>
    </Card>
  );
}
