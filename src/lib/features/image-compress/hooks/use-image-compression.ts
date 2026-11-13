"use client";

import { useEffect, useRef, useState } from "react";
import { tryCatch, tryCatchAsync } from "@/utils/try-catch";
import {
  REMOTE_MAX_BYTES,
  REMOTE_MAX_PIXELS,
  type CompressionSettings,
  type EncodedImage,
  type ProcessingLocation,
} from "../compression/compression";
import {
  compressRemotely,
  type RemoteProgress,
} from "../remote/remote-compression";
import type { WorkerResponse } from "../worker/image.worker";

export interface SourceImage {
  file: File;
  bitmap: ImageBitmap;
  url: string;
}

interface ResultImage extends EncodedImage {
  url: string;
  elapsed: number;
  settings: CompressionSettings;
  source: SourceImage;
  location: ProcessingLocation;
}

function createWorker() {
  return new Worker(new URL("../worker/image.worker.ts", import.meta.url), {
    type: "module",
  });
}

export function useImageCompression(
  file: File | null,
  settings: CompressionSettings | null,
  location: ProcessingLocation = "local",
) {
  const cancelDecode = useRef<(() => void) | null>(null);
  const cancelConversion = useRef<(() => void) | null>(null);
  const [retryKey, setRetryKey] = useState(0);
  const [remoteProgress, setRemoteProgress] = useState<RemoteProgress | null>(
    null,
  );
  const [source, setSource] = useState<SourceImage | null>(null);
  const [result, setResult] = useState<ResultImage | null>(null);
  const [error, setError] = useState("");
  const [estimate, setEstimate] = useState<number | null>(null);

  useEffect(() => {
    setResult(null);
  }, [file]);

  useEffect(() => {
    setSource(null);
    setError("");
    if (!file) return;
    const started = tryCatch(createWorker);
    if (started.error) {
      setError(
        "This browser cannot start local image processing. Try a current browser.",
      );
      return;
    }
    const worker = started.data;
    worker.onmessage = ({ data }: MessageEvent<WorkerResponse>) => {
      if (data.kind === "decoded") {
        setSource({
          file,
          bitmap: data.bitmap,
          url: URL.createObjectURL(data.preview),
        });
        worker.terminate();
      } else if (data.kind === "error") {
        setError(data.message);
        worker.terminate();
      }
    };
    worker.onerror = () => {
      setError(
        "Could not read this image. Try another file or reload the page.",
      );
      worker.terminate();
    };
    cancelDecode.current = () => worker.terminate();
    worker.postMessage({ kind: "decode", file });
    return () => {
      worker.terminate();
      cancelDecode.current = null;
    };
  }, [file, retryKey]);

  useEffect(
    () => () => {
      if (source) {
        source.bitmap.close();
        URL.revokeObjectURL(source.url);
      }
    },
    [source],
  );

  useEffect(
    () => () => {
      if (result) URL.revokeObjectURL(result.url);
    },
    [result],
  );

  useEffect(() => {
    setEstimate(null);
    setRemoteProgress(null);
    if (!source || source.file !== file || !settings) return;
    setError("");
    if (
      location === "remote" &&
      (file.size > REMOTE_MAX_BYTES ||
        source.bitmap.width * source.bitmap.height > REMOTE_MAX_PIXELS)
    ) {
      setError(
        "Remote mode supports images up to 4 MB and 20 megapixels. Switch to local mode to process this image.",
      );
      return;
    }
    let stopped = false;
    const controller = new AbortController();
    let worker: Worker | undefined;
    async function convert(
      file: File,
      settings: CompressionSettings,
      source: SourceImage,
    ) {
      if (location === "remote") {
        const converted = await compressRemotely(
          file,
          settings,
          controller.signal,
          (progress) => {
            if (!stopped) setRemoteProgress(progress);
          },
        );
        if (!stopped)
          setResult({
            ...converted,
            url: URL.createObjectURL(converted.blob),
            settings,
            source,
            location,
          });
        return;
      }
      const bitmap = await createImageBitmap(source.bitmap);
      if (stopped) {
        bitmap.close();
        return;
      }
      const started = tryCatch(createWorker);
      if (started.error) {
        bitmap.close();
        throw started.error;
      }
      worker = started.data;
      worker.onmessage = ({ data }: MessageEvent<WorkerResponse>) => {
        if (stopped) return;
        if (data.kind === "estimate") setEstimate(data.seconds);
        if (data.kind === "error") {
          setError(data.message);
          worker?.terminate();
        }
        if (data.kind === "result") {
          setResult({
            ...data.result,
            elapsed: data.elapsed,
            url: URL.createObjectURL(data.result.blob),
            settings,
            source,
            location,
          });
          worker?.terminate();
        }
      };
      worker.onerror = () => {
        if (!stopped)
          setError(
            "Local compression failed. Try a smaller image or reload to retry.",
          );
        worker?.terminate();
      };
      worker.postMessage({ kind: "compress", bitmap, settings }, [bitmap]);
    }
    const timer = setTimeout(
      async () => {
        const { error } = await tryCatchAsync(() =>
          convert(file, settings, source),
        );
        if (!error || stopped) return;
        setError(
          location === "remote" && error instanceof Error
            ? error.message
            : "Could not process this image in your browser. Try a smaller image.",
        );
      },
      location === "remote" ? 700 : 400,
    );
    const stop = () => {
      stopped = true;
      clearTimeout(timer);
      controller.abort();
      worker?.terminate();
    };
    cancelConversion.current = stop;
    return () => {
      stop();
      cancelConversion.current = null;
    };
  }, [source, file, settings, location, retryKey]);

  return {
    source: source?.file === file ? source : null,
    result:
      result?.location === location &&
      result?.settings === settings &&
      result?.source === source &&
      source?.file === file
        ? result
        : null,
    previousResult:
      result?.source === source && source?.file === file ? result : null,
    error,
    estimate,
    remoteProgress,
    cancel: () => {
      cancelDecode.current?.();
      cancelConversion.current?.();
      setError(
        "Processing cancelled. Retry or adjust your settings to continue.",
      );
    },
    retry: () => setRetryKey((key) => key + 1),
  };
}
