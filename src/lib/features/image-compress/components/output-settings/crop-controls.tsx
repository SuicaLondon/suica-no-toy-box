"use client";

import type { ImageCompressMessages } from "@/i18n/image-compress-messages";
import { MAX_IMAGE_DIMENSION } from "@/schemas/image-compress";
import type { OutputSize, SizeUnit } from "../../compression/crop";
import { changeDraftUnit, type CropDraft } from "../../view/crop-draft";
import { FieldSelect } from "../common/field-select";
import { Hint } from "../common/hint";
import { FieldInput } from "./field-input";

const SIZE_UNITS: readonly SizeUnit[] = ["px", "mm", "cm", "in"];

type CropControlsProps = {
  messages: ImageCompressMessages;
  draft: CropDraft;
  onChange: (value: CropDraft) => void;
  /** The parsed size, or null while the draft is invalid. */
  output: OutputSize | null;
  maxPixels: number;
};

/** The exact output size: width, height, unit and print resolution. */
export function CropControls({
  messages,
  draft,
  onChange,
  output,
  maxPixels,
}: CropControlsProps) {
  return (
    <fieldset className="border-toy-line grid gap-3 border-t pt-4">
      <legend className="text-sm font-medium">{messages.cropLegend}</legend>
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={draft.enabled}
          onChange={(event) =>
            onChange({ ...draft, enabled: event.target.checked })
          }
          className="accent-toy-accent"
        />
        {messages.exactDimensions}
      </label>
      {draft.enabled ? (
        <>
          <div className="grid grid-cols-2 gap-3">
            <label className="grid gap-1 text-sm">
              {messages.width}
              <FieldInput
                aria-label={messages.outputWidth}
                type="number"
                min="0"
                step="any"
                value={draft.width}
                onChange={(event) =>
                  onChange({ ...draft, width: event.target.value })
                }
                className="py-2"
              />
            </label>
            <label className="grid gap-1 text-sm">
              {messages.height}
              <FieldInput
                aria-label={messages.outputHeight}
                type="number"
                min="0"
                step="any"
                value={draft.height}
                onChange={(event) =>
                  onChange({ ...draft, height: event.target.value })
                }
                className="py-2"
              />
            </label>
            <label className="grid gap-1 text-sm">
              {messages.units}
              <FieldSelect
                aria-label={messages.sizeUnits}
                value={draft.unit}
                onChange={(event) =>
                  onChange(
                    changeDraftUnit(draft, event.target.value as SizeUnit),
                  )
                }
                className="py-2"
              >
                {SIZE_UNITS.map((unit) => (
                  <option key={unit} value={unit}>
                    {unit}
                  </option>
                ))}
              </FieldSelect>
            </label>
            <label className="grid gap-1 text-sm">
              {messages.resolution}
              <FieldInput
                aria-label={messages.resolution}
                type="number"
                min="1"
                max="2400"
                step="1"
                value={draft.ppi}
                onChange={(event) =>
                  onChange({ ...draft, ppi: event.target.value })
                }
                className="py-2"
              />
            </label>
          </div>
          {output ? (
            <Hint>
              {messages.outputSummary(output.width, output.height, output.ppi)}
            </Hint>
          ) : (
            <p role="alert" className="text-toy-error text-xs">
              {messages.outputError(
                maxPixels / 1_000_000,
                MAX_IMAGE_DIMENSION.toLocaleString("en-US"),
              )}
            </p>
          )}
          <Hint>{messages.printNote}</Hint>
        </>
      ) : null}
    </fieldset>
  );
}
