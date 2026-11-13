"use client";

import { useToolI18n } from "@/i18n/tool-i18n";
import { useMemo, useState } from "react";
import { Card } from "suica-ui/card";
import {
  MAX_PIXELS,
  REMOTE_MAX_PIXELS,
  type CompressionMode,
  type ImageFormat,
  type ProcessingLocation,
} from "./compression/compression";
import { useImageCompression } from "./hooks/use-image-compression";
import { initialCrop, resolveOutput } from "./view/crop-draft";
import { buildSettings, targetBytes } from "./view/settings";
import { ChoiceGroup } from "./components/common/choice-group";
import { Hint } from "./components/common/hint";
import { ImageSourcePicker } from "./components/image-source-picker";
import { OutputSettings } from "./components/output-settings";
import { PrivacyNotes } from "./components/privacy-notes";
import { ImagePreview } from "./components/image-preview";

const MAX_OUTPUT_PIXELS: Record<ProcessingLocation, number> = {
  local: MAX_PIXELS,
  remote: REMOTE_MAX_PIXELS,
};

/** Image Studio: pick an image, choose an output, compare and download. */
export function ImageCompressTool() {
  const { messages: toolMessages, locale } = useToolI18n();
  const messages = toolMessages["image-compress"];
  const [location, setLocation] = useState<ProcessingLocation>("local");
  const [file, setFile] = useState<File | null>(null);
  const [format, setFormat] = useState<ImageFormat | "">("");
  const [mode, setMode] = useState<CompressionMode>("size");
  const [targetMB, setTargetMB] = useState("1");
  const [quality, setQuality] = useState(90);
  const [crop, setCrop] = useState(initialCrop);
  const maxOutputPixels = MAX_OUTPUT_PIXELS[location];
  const output = useMemo(
    () => resolveOutput(crop, maxOutputPixels),
    [crop, maxOutputPixels],
  );
  const validTarget = targetBytes(targetMB) !== null;
  const settings = useMemo(
    () =>
      buildSettings({
        format,
        mode,
        targetMB,
        quality,
        output: crop.enabled ? output : undefined,
      }),
    [format, mode, targetMB, quality, crop.enabled, output],
  );
  const compression = useImageCompression(file, settings, location);

  return (
    <div className="lg:grid-cols-studio mt-6 grid items-start gap-4">
      <Card className="grid gap-4 p-5">
        <div className="grid gap-2">
          <ChoiceGroup
            legend={messages.processingLocation}
            name="processing-location"
            options={[
              { value: "local", label: messages.onDevice },
              { value: "remote", label: messages.remoteServer },
            ]}
            value={location}
            onChange={setLocation}
            describedBy="processing-note"
          />
          <Hint id="processing-note">{messages.processingNote}</Hint>
        </div>
        <ImageSourcePicker
          messages={messages}
          file={file}
          source={compression.source}
          location={location}
          onSelect={(nextFile, nextFormat) => {
            setFile(nextFile);
            setCrop((previous) => ({ ...previous, x: 0.5, y: 0.5, zoom: 1 }));
            setFormat(nextFormat);
          }}
        />
        <OutputSettings
          messages={messages}
          format={format}
          onFormat={setFormat}
          crop={crop}
          onCrop={setCrop}
          output={output}
          maxOutputPixels={maxOutputPixels}
          mode={mode}
          onMode={setMode}
          targetMB={targetMB}
          onTargetMB={setTargetMB}
          validTarget={validTarget}
          quality={quality}
          onQuality={setQuality}
        />
        <PrivacyNotes messages={messages} />
      </Card>

      <div className="grid min-w-0 gap-4">
        <ImagePreview
          messages={messages}
          locale={locale}
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
