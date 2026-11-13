"use client";

/* Object URLs keep local images out of the server optimizer. */
/* eslint-disable @next/next/no-img-element */
import type { ImageCompressMessages } from "@/i18n/image-compress-messages";
import type { Locale } from "@/i18n/locales";
import { cn } from "@/utils/cn";
import { useState } from "react";
import { ArrowDownToLine } from "lucide-react";
import { Card } from "suica-ui/card";
import { Button } from "suica-ui/button";
import {
  formatBytes,
  type CompressionSettings,
  type ImageFormat,
  type ProcessingLocation,
} from "../../compression/compression";
import type { useImageCompression } from "../../hooks/use-image-compression";
import { useElementSize } from "../../hooks/use-element-size";
import { cropRectangle } from "../../compression/crop";
import { ComparisonSlider } from "./comparison-slider";
import { cropMove, cropZoom } from "../../view/crop-keys";
import { PreviewPlaceholder } from "./preview-placeholder";
import {
  aspectRatioOf,
  downloadName,
  outputText,
  previewAction,
  previewAlert,
  previewStatus,
  savingsText,
} from "../../view/preview-text";
import {
  useCropGestures,
  zoomCrop,
  type CropPosition,
} from "../../hooks/use-crop-gestures";
import { Hint } from "../common/hint";
import { SectionLabel } from "../common/section-label";
import styles from "./image-preview.module.css";
import { PreviewBadge } from "./preview-badge";
import { PreviewStat } from "./preview-stat";
import { ResultLink } from "./result-link";

interface ImagePreviewProps {
  messages: ImageCompressMessages;
  locale: Locale;
  file: File | null;
  settings: CompressionSettings | null;
  format: ImageFormat | "";
  location: ProcessingLocation;
  compression: ReturnType<typeof useImageCompression>;
  onUseLocal: () => void;
  onReposition?: (position: CropPosition) => void;
}

/** The before-and-after preview, its status, stats and download link. */
export function ImagePreview({
  messages,
  locale,
  file,
  settings,
  format,
  location,
  compression,
  onUseLocal,
  onReposition,
}: ImagePreviewProps) {
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
  const displayResult = result ?? previousResult;
  const [previewFrame, frameSize] = useElementSize<HTMLDivElement>();
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
  const aspectRatio = aspectRatioOf(previewOutput, source?.bitmap);
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

  return (
    <Card className="min-w-0 overflow-hidden p-5" aria-busy={pending}>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <SectionLabel>{messages.livePreview}</SectionLabel>
          <Hint className="mt-1">
            {canReposition ? messages.repositionHint : messages.previewHint}
          </Hint>
        </div>
        <ResultLink
          href={result?.url}
          target="_blank"
          rel="noreferrer"
          className="text-sm underline"
        >
          {messages.fullSize}
        </ResultLink>
      </div>
      <div className="mb-3 flex h-12 items-center gap-3">
        <div
          className="text-toy-muted flex min-w-0 flex-1 items-center gap-2 text-xs"
          role="status"
          aria-live="polite"
        >
          <span>
            {previewStatus(
              {
                error,
                hasFile: Boolean(file),
                hasSource: Boolean(source),
                hasSettings: Boolean(settings),
                result,
                missedTarget,
                location,
                remoteProgress,
                estimate,
              },
              messages,
            )}
          </span>
        </div>
        <Button
          type="button"
          onClick={pending ? cancel : retry}
          disabled={!pending && !error}
          className="min-w-20"
        >
          {previewAction(pending, Boolean(error), messages)}
        </Button>
      </div>
      <div
        ref={previewFrame}
        data-testid="image-preview-frame"
        className="border-toy-line checkerboard relative flex items-center justify-center overflow-hidden rounded-lg border"
        style={{ height: "clamp(240px, 55svh, 640px)" }}
        aria-label={messages.comparisonPreview}
        aria-busy={pending}
      >
        {source ? (
          <div
            className={cn(
              "relative shrink-0 overflow-hidden",
              canReposition &&
                "focus-visible:outline-toy-accent cursor-move touch-none select-none focus-visible:outline-2",
            )}
            role={canReposition ? "group" : undefined}
            aria-label={canReposition ? messages.repositionLabel : undefined}
            tabIndex={canReposition ? 0 : undefined}
            {...gestures}
            onKeyDown={(event) => {
              if (!canReposition || !previewOutput) return;
              const zoom = cropZoom(event.key);
              if (zoom) {
                event.preventDefault();
                changeZoom(previewOutput.zoom * zoom);
                return;
              }
              const move = cropMove(event.key, event.shiftKey);
              if (!move) return;
              event.preventDefault();
              reposition(previewOutput.x + move.x, previewOutput.y + move.y);
            }}
            style={{
              width: previewWidth,
              height: previewWidth / aspectRatio,
            }}
          >
            <img
              src={source.url}
              alt={messages.originalImage}
              style={originalStyle}
              className="block h-full w-full"
              draggable={false}
            />
            {previewResult || (pending && !canReposition) ? (
              <>
                <div
                  className="checkerboard absolute inset-0"
                  style={{ clipPath: `inset(0 0 0 ${split}%)` }}
                >
                  <img
                    src={previewResult?.url ?? source.url}
                    alt={
                      previewResult
                        ? messages.convertedImage
                        : messages.preparing
                    }
                    style={previewResult ? undefined : originalStyle}
                    className={cn("h-full w-full", styles.outputImage)}
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
                <ComparisonSlider
                  split={split}
                  onSplit={setSplit}
                  label={messages.compare}
                  draggableImage={canReposition}
                />
              </>
            ) : null}
          </div>
        ) : (
          <PreviewPlaceholder pending={pending} text={messages.emptyPreview} />
        )}
        {error || missedTarget ? (
          <div
            role="alert"
            className="border-toy-line bg-background/95 absolute inset-x-3 bottom-3 z-10 rounded-md border p-3 text-sm shadow-sm"
          >
            <p>
              {previewAlert(error, Boolean(settings?.output), locale, messages)}
            </p>
            {error && location === "remote" ? (
              <button
                type="button"
                className="text-toy-accent mt-2 underline"
                onClick={onUseLocal}
              >
                {messages.useLocal}
              </button>
            ) : null}
          </div>
        ) : null}
        {pending && location === "remote" && remoteProgress?.percent != null ? (
          <progress
            aria-label={
              remoteProgress.phase === "uploading"
                ? messages.uploadProgress
                : messages.downloadProgress
            }
            value={remoteProgress.percent}
            max={100}
            className="accent-toy-accent absolute inset-x-0 bottom-0 z-10 h-1 w-full"
          />
        ) : null}
        {source && (displayResult || pending) ? (
          <>
            <PreviewBadge side="left">
              {previewOutput ? messages.originalCrop : messages.original}
            </PreviewBadge>
            <PreviewBadge side="right">
              {pending ? messages.processingOutput : messages.result}
            </PreviewBadge>
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
              {messages.zoomValue(previewOutput.zoom.toFixed(2))}
            </label>
            <p
              role="status"
              aria-hidden={!isEnlarged}
              className={cn("text-right", !isEnlarged && "invisible")}
            >
              {messages.enlarged}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <input
              id="preview-zoom"
              type="range"
              aria-label={messages.zoom}
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
              {messages.resetCrop}
            </button>
          </div>
        </div>
      ) : null}
      <div className="my-3 grid gap-2 tabular-nums sm:grid-cols-3">
        <PreviewStat
          label={messages.fileSize}
          value={
            <>
              {file ? formatBytes(file.size) : "—"} →{" "}
              {displayResult ? formatBytes(displayResult.blob.size) : "—"}
            </>
          }
          note={savingsText(displayResult ? savings : null, messages)}
        />
        <PreviewStat
          label={messages.dimensions}
          value={
            <>
              {source
                ? `${source.bitmap.width} × ${source.bitmap.height}`
                : "—"}{" "}
              →{" "}
              {displayResult
                ? `${displayResult.width} × ${displayResult.height}`
                : "—"}
            </>
          }
        />
        <PreviewStat
          label={messages.output}
          value={outputText(displayResult, messages)}
        />
      </div>
      <ResultLink
        href={result?.url}
        download={downloadName(file, format)}
        className="bg-toy-accent inline-flex min-h-11 items-center justify-center gap-2 rounded-md px-5 text-sm font-medium text-white focus-visible:outline-2 focus-visible:outline-offset-4"
      >
        <ArrowDownToLine className="size-4" aria-hidden="true" />
        {messages.download} {format ? format.toUpperCase() : messages.image}
      </ResultLink>
    </Card>
  );
}
