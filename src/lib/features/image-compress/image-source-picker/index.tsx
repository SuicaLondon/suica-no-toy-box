"use client";

import { useRef, useState } from "react";
import { ImagePlus } from "lucide-react";
import {
  formatBytes,
  MAX_FILE_BYTES,
  type ImageFormat,
  type ProcessingLocation,
} from "../compression";
import type { SourceImage } from "@/hooks/use-image-compression";

interface ImageSourcePickerProps {
  file: File | null;
  source: SourceImage | null;
  location: ProcessingLocation;
  onSelect: (file: File, format: ImageFormat) => void;
}

export function ImageSourcePicker({
  file,
  source,
  location,
  onSelect,
}: ImageSourcePickerProps) {
  const [inputError, setInputError] = useState("");
  const [dragging, setDragging] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  function selectFile(files: FileList | File[] | null) {
    setInputError("");
    if (!files?.length) return;
    if (files.length !== 1) {
      setInputError("Please choose one image at a time.");
      return;
    }
    const nextFile = files[0];
    if (
      !/\.(jpe?g|png|webp|heic|heif)$/i.test(nextFile.name) &&
      !/^image\/(jpeg|png|webp|heic|heif)$/.test(nextFile.type)
    ) {
      setInputError("Choose a JPEG, PNG, WebP or HEIC image.");
      return;
    }
    if (!nextFile.size || nextFile.size > MAX_FILE_BYTES) {
      setInputError("Choose a non-empty image no larger than 50 MB.");
      return;
    }
    const mimeFormat = nextFile.type.toLowerCase().split("/")[1];
    const extension = nextFile.name.split(".").pop()?.toLowerCase();
    const detected = ["jpeg", "png", "webp"].includes(mimeFormat)
      ? mimeFormat
      : extension;
    onSelect(
      nextFile,
      detected === "png" || detected === "webp" ? detected : "jpeg",
    );
  }

  return (
    <div>
      <p className="text-toy-muted mb-3 font-mono text-xs tracking-widest uppercase">
        01 / Source image
      </p>
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
        className={`border-toy-line hover:border-toy-accent focus-visible:outline-toy-accent flex min-h-28 w-full flex-col items-center justify-center gap-2 rounded-lg border border-dashed px-4 py-4 text-center focus-visible:outline-2 focus-visible:outline-offset-4 ${dragging ? "bg-toy-hover border-toy-accent" : ""}`}
      >
        <ImagePlus className="text-toy-accent size-7" aria-hidden="true" />
        <span className="text-sm font-medium">
          {file
            ? "Drop or choose another image"
            : "Drop an image or click to browse"}
        </span>
        <span className="text-toy-muted text-xs">
          JPEG, PNG, WebP, HEIC ·{" "}
          {location === "remote" ? "Up to 4 MB remotely" : "Up to 50 MB"}
        </span>
      </button>
      <input
        ref={input}
        type="file"
        aria-label="Choose an image"
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
      {inputError ? (
        <p role="alert" className="text-toy-error mt-3 text-sm">
          {inputError}
        </p>
      ) : null}
    </div>
  );
}
