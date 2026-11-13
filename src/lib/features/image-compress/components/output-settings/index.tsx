"use client";

import type { ImageCompressMessages } from "@/i18n/image-compress-messages";
import { Field } from "suica-ui/field";
import { Input } from "suica-ui/input";
import { cn } from "@/utils/cn";
import type {
  CompressionMode,
  ImageFormat,
} from "../../compression/compression";
import type { OutputSize } from "../../compression/crop";
import type { CropDraft } from "../../view/crop-draft";
import { targetNote } from "../../view/settings";
import { ChoiceGroup } from "../common/choice-group";
import { FieldSelect } from "../common/field-select";
import { Hint } from "../common/hint";
import { SectionLabel } from "../common/section-label";
import { CropControls } from "./crop-controls";
import { ModePanel } from "./mode-panel";

const TARGET_NOTE_TONE = {
  valid: "text-toy-muted",
  invalid: "text-toy-error",
};

type OutputSettingsProps = {
  messages: ImageCompressMessages;
  format: ImageFormat | "";
  onFormat: (format: ImageFormat | "") => void;
  crop: CropDraft;
  onCrop: (crop: CropDraft) => void;
  output: OutputSize | null;
  maxOutputPixels: number;
  mode: CompressionMode;
  onMode: (mode: CompressionMode) => void;
  targetMB: string;
  onTargetMB: (targetMB: string) => void;
  validTarget: boolean;
  quality: number;
  onQuality: (quality: number) => void;
};

/** Format, exact size, and either a size limit or a manual quality. */
export function OutputSettings({
  messages,
  format,
  onFormat,
  crop,
  onCrop,
  output,
  maxOutputPixels,
  mode,
  onMode,
  targetMB,
  onTargetMB,
  validTarget,
  quality,
  onQuality,
}: OutputSettingsProps) {
  const isPng = format === "png";
  return (
    <div className="border-toy-line grid gap-4 border-t pt-5">
      <SectionLabel>{messages.outputSettings}</SectionLabel>
      <Field label={messages.outputFormat}>
        <FieldSelect
          id="image-format"
          required
          value={format}
          onChange={(event) => onFormat(event.target.value as ImageFormat | "")}
          className="py-3"
        >
          <option value="" disabled>
            {messages.chooseFormat}
          </option>
          <option value="jpeg">JPEG</option>
          <option value="webp">WebP</option>
          <option value="png">PNG</option>
        </FieldSelect>
      </Field>
      <CropControls
        messages={messages}
        draft={crop}
        onChange={onCrop}
        output={output}
        maxPixels={maxOutputPixels}
      />
      <ChoiceGroup
        legend={messages.mode}
        name="image-mode"
        options={[
          { value: "size", label: messages.sizePriority },
          { value: "manual", label: messages.manual },
        ]}
        value={mode}
        onChange={onMode}
      />
      <div className="grid">
        <ModePanel active={mode === "size"}>
          <Field label={messages.maximumSize}>
            <Input
              id="image-target"
              type="number"
              min="0.001"
              step="0.1"
              value={targetMB}
              aria-invalid={!validTarget}
              aria-describedby="image-target-error"
              onChange={(event) => onTargetMB(event.target.value)}
            />
          </Field>
          <p
            id="image-target-error"
            role={validTarget ? undefined : "alert"}
            className={cn(
              "min-h-9 text-xs leading-relaxed",
              TARGET_NOTE_TONE[validTarget ? "valid" : "invalid"],
            )}
          >
            {targetNote(validTarget, crop.enabled, messages)}
          </p>
        </ModePanel>
        <ModePanel active={mode === "manual"}>
          <Field
            label={
              isPng
                ? messages.losslessQuality
                : `${messages.quality} · ${quality}`
            }
          >
            <input
              id="image-quality"
              type="range"
              min="1"
              max="100"
              value={isPng ? 100 : quality}
              disabled={isPng || mode !== "manual"}
              onChange={(event) => onQuality(Number(event.target.value))}
              className="accent-toy-accent h-9 w-full disabled:opacity-40"
            />
          </Field>
          <Hint>
            {crop.enabled ? messages.fixedManualHint : messages.manualHint}
          </Hint>
        </ModePanel>
      </div>
      <p className="text-toy-muted text-xs">{messages.jpegHint}</p>
    </div>
  );
}
