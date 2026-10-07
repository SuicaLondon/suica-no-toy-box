import type { CompressionSettings, EncodedImage } from "./compression";

export type RemoteProgress = {
  phase: "uploading" | "processing" | "downloading";
  percent: number | null;
};

export function compressRemotely(
  file: File,
  settings: CompressionSettings,
  signal: AbortSignal,
  onProgress: (progress: RemoteProgress) => void,
): Promise<EncodedImage & { elapsed: number }> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const abort = () => xhr.abort();
    const finish = () => signal.removeEventListener("abort", abort);
    if (signal.aborted) {
      reject(new DOMException("Cancelled", "AbortError"));
      return;
    }
    xhr.open("POST", "/api/image-compress");
    xhr.setRequestHeader(
      "Content-Type",
      file.type || "application/octet-stream",
    );
    xhr.setRequestHeader("X-Image-Settings", JSON.stringify(settings));
    xhr.responseType = "blob";
    xhr.timeout = 75_000;
    xhr.upload.onprogress = (event) =>
      onProgress({
        phase: "uploading",
        percent: event.lengthComputable
          ? Math.round((event.loaded / event.total) * 100)
          : null,
      });
    xhr.upload.onload = () =>
      onProgress({ phase: "processing", percent: null });
    xhr.onprogress = (event) =>
      onProgress({
        phase: "downloading",
        percent: event.lengthComputable
          ? Math.round((event.loaded / event.total) * 100)
          : null,
      });
    xhr.onerror = () => {
      finish();
      reject(
        new Error(
          "Could not reach the server. Check your connection, retry, or use local mode.",
        ),
      );
    };
    xhr.ontimeout = () => {
      finish();
      reject(
        new Error(
          "The remote request timed out. Retry with a smaller image or use local mode.",
        ),
      );
    };
    xhr.onabort = () => {
      finish();
      reject(new DOMException("Cancelled", "AbortError"));
    };
    xhr.onload = async () => {
      finish();
      const blob: Blob = xhr.response;
      if (xhr.status < 200 || xhr.status >= 300) {
        let message =
          xhr.status === 413
            ? "Remote mode is limited to 4 MB uploads and downloads. Use local mode or a smaller image."
            : "Remote conversion failed. Retry or switch to local mode.";
        try {
          const body = JSON.parse(await blob.text());
          if (typeof body.error === "string") message = body.error;
        } catch {
          /* Platform errors may not be JSON. */
        }
        reject(new Error(message));
        return;
      }
      const width = Number(xhr.getResponseHeader("X-Image-Width"));
      const height = Number(xhr.getResponseHeader("X-Image-Height"));
      const quality = Number(xhr.getResponseHeader("X-Image-Quality"));
      const elapsed = Number(xhr.getResponseHeader("X-Processing-Seconds"));
      if (
        blob.type !== `image/${settings.format}` ||
        !Number.isInteger(width) ||
        width < 1 ||
        !Number.isInteger(height) ||
        height < 1 ||
        !Number.isFinite(elapsed)
      ) {
        reject(
          new Error(
            "The server returned an invalid image. Retry or use local mode.",
          ),
        );
        return;
      }
      resolve({ blob, width, height, quality, elapsed });
    };
    signal.addEventListener("abort", abort, { once: true });
    onProgress({ phase: "uploading", percent: 0 });
    xhr.send(file);
  });
}
