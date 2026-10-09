"use client";

import { useToolI18n } from "@/i18n/tool-i18n";
import { useMemo, useState } from "react";
import { ShieldCheck } from "lucide-react";
import { Card } from "suica-ui/card";
import { Input } from "suica-ui/input";
import { Field } from "suica-ui/field";
import {
  type CompressionMode,
  MAX_IMAGE_DIMENSION,
  MAX_PIXELS,
  REMOTE_MAX_PIXELS,
  type CompressionSettings,
  type ImageFormat,
  type ProcessingLocation,
} from "./compression";
import { useImageCompression } from "@/hooks/use-image-compression";
import { ImageSourcePicker } from "./image-source-picker";
import { ImagePreview } from "./image-preview";

import { CropControls, initialCrop, resolveOutput } from "./crop-controls";

const selectClass =
  "border-toy-line bg-background w-full rounded-md border px-3 py-3 text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-toy-accent";

export function ImageCompressTool() {
  const { copy } = useToolI18n();
  const t = copy["image-compress"];
  const [location, setLocation] = useState<ProcessingLocation>("local");
  const [file, setFile] = useState<File | null>(null);
  const [format, setFormat] = useState<ImageFormat | "">("");
  const [mode, setMode] = useState<CompressionMode>("size");
  const [targetMB, setTargetMB] = useState("1");
  const [quality, setQuality] = useState(90);
  const [crop, setCrop] = useState(initialCrop);
  const maxOutputPixels =
    location === "remote" ? REMOTE_MAX_PIXELS : MAX_PIXELS;
  const output = useMemo(
    () => resolveOutput(crop, maxOutputPixels),
    [crop, maxOutputPixels],
  );
  const validTarget =
    Number.isSafeInteger(Math.floor(Number(targetMB) * 1_000_000)) &&
    Number(targetMB) >= 0.001;
  const settings = useMemo<CompressionSettings | null>(() => {
    if (
      !format ||
      (mode === "size" && !validTarget) ||
      (crop.enabled && !output)
    )
      return null;
    return {
      format,
      mode,
      targetBytes:
        mode === "size" ? Math.floor(Number(targetMB) * 1_000_000) : 1,
      quality,
      // The encoder clamps this limit to the source width without upscaling.
      width: MAX_IMAGE_DIMENSION,
      ...(crop.enabled && output ? { output } : {}),
    };
  }, [format, mode, validTarget, targetMB, quality, crop.enabled, output]);
  const compression = useImageCompression(file, settings, location);
  const { source } = compression;

  return (
    <div className="mt-6 grid items-start gap-4 lg:grid-cols-[340px_minmax(0,1fr)]">
      <Card className="grid gap-4 p-5">
        <fieldset className="grid gap-2">
          <legend className="mb-2 text-sm font-medium">
            {t.processingLocation}
          </legend>
          <div className="grid grid-cols-2 gap-2">
            {(
              [
                ["local", t.onDevice],
                ["remote", t.remoteServer],
              ] as const
            ).map(([value, label]) => (
              <label
                key={value}
                className={`border-toy-line flex cursor-pointer items-center gap-2 rounded-md border p-3 text-sm ${location === value ? "bg-toy-hover border-toy-accent" : ""}`}
              >
                <input
                  type="radio"
                  name="processing-location"
                  checked={location === value}
                  onChange={() => setLocation(value)}
                  aria-describedby="processing-note"
                  className="accent-toy-accent"
                />
                {label}
              </label>
            ))}
          </div>
          <p
            id="processing-note"
            className="text-toy-muted text-xs leading-relaxed"
          >
            {t.processingNote}
          </p>
        </fieldset>
        <ImageSourcePicker
          file={file}
          source={source}
          location={location}
          onSelect={(nextFile, nextFormat) => {
            setFile(nextFile);
            setCrop((previous) => ({ ...previous, x: 0.5, y: 0.5, zoom: 1 }));
            setFormat(nextFormat);
          }}
        />

        <div className="border-toy-line grid gap-4 border-t pt-5">
          <p className="text-toy-muted font-mono text-xs tracking-widest uppercase">
            {t.outputSettings}
          </p>
          <Field label={t.outputFormat}>
            <select
              id="image-format"
              required
              value={format}
              onChange={(event) =>
                setFormat(event.target.value as ImageFormat | "")
              }
              className={selectClass}
            >
              <option value="" disabled>
                {t.chooseFormat}
              </option>
              <option value="jpeg">JPEG</option>
              <option value="webp">WebP</option>
              <option value="png">PNG</option>
            </select>
          </Field>
          <CropControls
            draft={crop}
            onChange={setCrop}
            output={output}
            maxPixels={maxOutputPixels}
          />
          <fieldset className="grid gap-2">
            <legend className="mb-2 text-sm font-medium">{t.mode}</legend>
            <div className="grid grid-cols-2 gap-2">
              {(
                [
                  ["size", t.sizePriority],
                  ["manual", t.manual],
                ] as const
              ).map(([value, label]) => (
                <label
                  key={value}
                  className={`border-toy-line flex cursor-pointer items-center gap-2 rounded-md border p-3 text-sm ${mode === value ? "bg-toy-hover border-toy-accent" : ""}`}
                >
                  <input
                    type="radio"
                    name="image-mode"
                    value={value}
                    checked={mode === value}
                    onChange={() => setMode(value)}
                    className="accent-toy-accent"
                  />
                  {label}
                </label>
              ))}
            </div>
          </fieldset>
          <div className="grid">
            <fieldset
              disabled={mode !== "size"}
              aria-hidden={mode !== "size"}
              className={`grid content-start gap-3 [grid-area:1/1] ${mode !== "size" ? "invisible" : ""}`}
            >
              <Field label={t.maximumSize}>
                <Input
                  id="image-target"
                  type="number"
                  min="0.001"
                  step="0.1"
                  value={targetMB}
                  aria-invalid={!validTarget}
                  aria-describedby="image-target-error"
                  onChange={(event) => setTargetMB(event.target.value)}
                />
              </Field>
              <p
                id="image-target-error"
                role={!validTarget ? "alert" : undefined}
                className={`min-h-9 text-xs leading-relaxed ${validTarget ? "text-toy-muted" : "text-toy-error"}`}
              >
                {validTarget
                  ? crop.enabled
                    ? "Adjusts quality only. Output dimensions stay fixed; PNG remains lossless. 1 MB = 1,000,000 bytes."
                    : t.targetHint
                  : t.targetError}
              </p>
            </fieldset>
            <fieldset
              disabled={mode !== "manual"}
              aria-hidden={mode !== "manual"}
              className={`grid content-start gap-3 [grid-area:1/1] ${mode !== "manual" ? "invisible" : ""}`}
            >
              <Field
                label={
                  format === "png"
                    ? t.losslessQuality
                    : `${t.quality} · ${quality}`
                }
              >
                <input
                  id="image-quality"
                  type="range"
                  min="1"
                  max="100"
                  value={format === "png" ? 100 : quality}
                  disabled={format === "png" || mode !== "manual"}
                  onChange={(event) => setQuality(Number(event.target.value))}
                  className="accent-toy-accent h-9 w-full disabled:opacity-40"
                />
              </Field>
              <p className="text-toy-muted text-xs leading-relaxed">
                {crop.enabled
                  ? "Uses the selected output dimensions and quality. PNG remains lossless."
                  : t.manualHint}
              </p>
            </fieldset>
          </div>
          <p className="text-toy-muted text-xs">{t.jpegHint}</p>
        </div>
        <details className="border-toy-line relative border-t pt-3 text-xs">
          <summary className="text-toy-muted flex cursor-pointer items-center gap-2">
            <ShieldCheck className="size-4" aria-hidden="true" />
            {t.privacyNotes}
          </summary>
          <div className="border-toy-line bg-background absolute right-0 left-0 z-20 mt-2 grid gap-2 rounded-md border p-3 leading-relaxed shadow-lg">
            <p>{t.privacyDetail}</p>
            <p>{t.remoteLimits}</p>
            <p>{t.metadataNote}</p>
          </div>
        </details>
      </Card>

      <div className="grid min-w-0 gap-4">
        <ImagePreview
          file={file}
          settings={settings}
          format={format}
          location={location}
          compression={compression}
          onUseLocal={() => setLocation("local")}
          onReposition={(position) =>
            setCrop((previous) => ({ ...previous, ...position }))
          }
        />
      </div>
    </div>
  );
}
