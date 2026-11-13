"use client";

import type { ImageCompressMessages } from "@/i18n/image-compress-messages";
import { useRef, useState } from "react";
import { ImagePlus } from "lucide-react";
import {
  formatBytes,
  type ImageFormat,
  type ProcessingLocation,
} from "../../compression/compression";
import type { SourceImage } from "../../hooks/use-image-compression";
import {
  checkSourceFiles,
  type SourceFileProblem,
} from "../../view/source-file";
import { SectionLabel } from "../common/section-label";

const SIZE_LIMIT: Record<ProcessingLocation, "localSize" | "remoteSize"> = {
  local: "localSize",
  remote: "remoteSize",
};

interface ImageSourcePickerProps {
  messages: ImageCompressMessages;
  file: File | null;
  source: SourceImage | null;
  location: ProcessingLocation;
  onSelect: (file: File, format: ImageFormat) => void;
}

/** The drop zone and file picker for the one image being converted. */
export function ImageSourcePicker({
  messages,
  file,
  source,
  location,
  onSelect,
}: ImageSourcePickerProps) {
  const [problem, setProblem] = useState<SourceFileProblem | null>(null);
  const [dragging, setDragging] = useState(false);
  const input = useRef<HTMLInputElement>(null);

  function selectFile(files: FileList | File[] | null) {
    setProblem(null);
    if (!files?.length) return;
    const checked = checkSourceFiles(files);
    if (checked.problem) {
      setProblem(checked.problem);
      return;
    }
    onSelect(checked.file, checked.format);
  }

  return (
    <div>
      <SectionLabel className="mb-3">{messages.sourceImage}</SectionLabel>
      <button
        type="button"
        onClick={() => input.current?.click()}
        onDragOver={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          setDragging(false);
          selectFile(event.dataTransfer.files);
        }}
        data-dragging={dragging || undefined}
        className="border-toy-line hover:border-toy-accent focus-visible:outline-toy-accent data-dragging:bg-toy-hover data-dragging:border-toy-accent flex min-h-28 w-full flex-col items-center justify-center gap-2 rounded-lg border border-dashed p-4 text-center focus-visible:outline-2 focus-visible:outline-offset-4"
      >
        <ImagePlus className="text-toy-accent size-7" aria-hidden="true" />
        <span className="text-sm font-medium">
          {file ? messages.replaceImage : messages.dropImage}
        </span>
        <span className="text-toy-muted text-xs">
          JPEG, PNG, WebP, HEIC · {messages[SIZE_LIMIT[location]]}
        </span>
      </button>
      <input
        ref={input}
        type="file"
        aria-label={messages.chooseImage}
        className="sr-only"
        tabIndex={-1}
        accept="image/jpeg,image/png,image/webp,image/heic,image/heif,.heic,.heif"
        onChange={(event) => {
          selectFile(event.target.files);
          event.target.value = "";
        }}
      />
      {file ? (
        <p className="mt-3 truncate text-sm" title={file.name}>
          {file.name}
          <span className="text-toy-muted mt-1 block text-xs">
            {formatBytes(file.size)}
            {source
              ? ` · ${source.bitmap.width} × ${source.bitmap.height} px`
              : ""}
          </span>
        </p>
      ) : null}
      {problem ? (
        <p role="alert" className="text-toy-error mt-3 text-sm">
          {messages[problem]}
        </p>
      ) : null}
    </div>
  );
}
