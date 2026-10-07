"use client";

/* Object URLs keep local images out of the server optimizer. */
/* eslint-disable @next/next/no-img-element */
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
import styles from "./image-preview.module.css";

interface ImagePreviewProps {
  file: File | null;
  settings: CompressionSettings | null;
  format: ImageFormat | "";
  location: ProcessingLocation;
  compression: ReturnType<typeof useImageCompression>;
  onUseLocal: () => void;
}

export function ImagePreview({
  file,
  settings,
  format,
  location,
  compression,
  onUseLocal,
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
  const aspectRatio = source ? source.bitmap.width / source.bitmap.height : 1;
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
            03 / Live preview
          </p>
          <p className="text-toy-muted mt-1 text-xs">
            Updates automatically after you stop adjusting.
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
          Open full-size result
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
              ? "Processing stopped. See details below."
              : !file
                ? "Choose an image to get started."
                : !source
                  ? "Reading image locally…"
                  : !settings
                    ? "Check your settings to continue."
                    : !result
                      ? location === "remote"
                        ? !remoteProgress
                          ? "Waiting for your latest settings…"
                          : remoteProgress.phase === "uploading"
                            ? `Uploading${remoteProgress.percent === null ? "…" : ` · ${remoteProgress.percent}%`}`
                            : remoteProgress.phase === "processing"
                              ? "Converting on server…"
                              : `Downloading${remoteProgress.percent === null ? "…" : ` · ${remoteProgress.percent}%`}`
                        : estimate === null
                          ? "Processing locally · estimating time…"
                          : `Estimated next pass: ${Math.max(1, Math.floor(estimate / 2))}–${Math.ceil(estimate * 1.5)} seconds`
                      : missedTarget
                        ? "Target not reached. See details below."
                        : `Ready · ${location === "remote" ? "server" : "local"} · ${result.elapsed.toFixed(1)} seconds`}
          </span>
        </div>
        <Button
          type="button"
          onClick={pending ? cancel : retry}
          disabled={!pending && !error}
          className="min-w-20"
        >
          {pending ? "Cancel" : error ? "Retry" : "Ready"}
        </Button>
      </div>
      <div
        ref={previewFrame}
        data-testid="image-preview-frame"
        className="border-toy-line relative flex items-center justify-center overflow-hidden rounded-lg border bg-[conic-gradient(#d9ddd8_25%,#f4f5f2_0_50%,#d9ddd8_0_75%,#f4f5f2_0)] bg-[length:20px_20px]"
        style={{ height: "clamp(240px, 55svh, 640px)" }}
        aria-label="Image comparison preview"
        aria-busy={pending}
      >
        {source ? (
          <div
            className="relative shrink-0"
            style={{
              width: previewWidth,
              height: previewWidth / aspectRatio,
            }}
          >
            <img
              src={source.url}
              alt="Original image"
              className="block h-full w-full"
              draggable={false}
            />
            {displayResult || pending ? (
              <>
                <div
                  className="absolute inset-0 bg-[conic-gradient(#d9ddd8_25%,#f4f5f2_0_50%,#d9ddd8_0_75%,#f4f5f2_0)] bg-[length:20px_20px]"
                  style={{ clipPath: `inset(0 0 0 ${split}%)` }}
                >
                  <img
                    src={displayResult?.url ?? source.url}
                    alt={displayResult ? "Converted image" : "Preparing output"}
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
                <input
                  type="range"
                  aria-label="Compare original and converted image"
                  min="0"
                  max="100"
                  value={split}
                  onChange={(event) => setSplit(Number(event.target.value))}
                  className="absolute inset-0 h-full w-full cursor-ew-resize opacity-0 focus-visible:opacity-30"
                />
              </>
            ) : null}
          </div>
        ) : pending ? (
          <div className="bg-background/80 h-full w-full" aria-hidden="true" />
        ) : (
          <div className="text-toy-muted bg-background/80 flex h-full w-full flex-col items-center justify-center gap-3">
            <ImagePlus className="size-10" strokeWidth={1} aria-hidden="true" />
            <p className="text-sm">Your image, a little lighter.</p>
          </div>
        )}
        {error || missedTarget ? (
          <div
            role="alert"
            className="border-toy-line bg-background/95 absolute inset-x-3 bottom-3 z-10 rounded-md border p-3 text-sm shadow-sm"
          >
            <p>
              {error ||
                "Target not reached. Download the smallest result found, or increase the size limit."}
            </p>
            {error && location === "remote" ? (
              <button
                type="button"
                className="text-toy-accent mt-2 underline"
                onClick={onUseLocal}
              >
                Use on-device mode
              </button>
            ) : null}
          </div>
        ) : null}
        {pending && location === "remote" && remoteProgress?.percent != null ? (
          <progress
            aria-label={`${remoteProgress.phase === "uploading" ? "Upload" : "Download"} progress`}
            value={remoteProgress.percent}
            max={100}
            className="accent-toy-accent absolute inset-x-0 bottom-0 z-10 h-1 w-full"
          />
        ) : null}
        {source && (displayResult || pending) ? (
          <>
            <span className="pointer-events-none absolute top-3 left-3 rounded bg-black/65 px-2 py-1 text-xs text-white">
              Original
            </span>
            <span className="pointer-events-none absolute top-3 right-3 rounded bg-black/65 px-2 py-1 text-xs text-white">
              {pending ? "Processing output" : "Result"}
            </span>
          </>
        ) : null}
      </div>
      <div className="my-3 grid gap-2 tabular-nums sm:grid-cols-3">
        <div className="grid grid-cols-[5rem_1fr] items-start gap-x-2 text-right sm:block sm:min-h-16 sm:text-left">
          <p className="text-toy-muted text-xs">File size</p>
          <p className="mt-1 text-sm font-medium">
            {file ? formatBytes(file.size) : "—"} →{" "}
            {displayResult ? formatBytes(displayResult.blob.size) : "—"}
          </p>
          <p className="text-toy-muted col-start-2 mt-1 text-xs">
            {displayResult
              ? `${Math.abs(savings).toFixed(1)}% ${savings >= 0 ? "smaller" : "larger"}`
              : "Awaiting result"}
          </p>
        </div>
        <div className="grid grid-cols-[5rem_1fr] items-start gap-x-2 text-right sm:block sm:min-h-16 sm:text-left">
          <p className="text-toy-muted text-xs">Dimensions</p>
          <p className="mt-1 text-sm font-medium">
            {source ? `${source.bitmap.width} × ${source.bitmap.height}` : "—"}{" "}
            →{" "}
            {displayResult
              ? `${displayResult.width} × ${displayResult.height}`
              : "—"}
          </p>
        </div>
        <div className="grid grid-cols-[5rem_1fr] items-start gap-x-2 text-right sm:block sm:min-h-16 sm:text-left">
          <p className="text-toy-muted text-xs">Output</p>
          <p className="mt-1 text-sm font-medium">
            {displayResult
              ? `${displayResult.settings.format.toUpperCase()} · ${displayResult.settings.format === "png" ? "Lossless" : `Quality ${displayResult.quality}`}`
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
        Download {format ? format.toUpperCase() : "image"}
      </a>
    </Card>
  );
}
