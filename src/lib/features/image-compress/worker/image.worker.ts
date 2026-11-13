import {
  compressImage,
  MAX_PIXELS,
  MAX_IMAGE_DIMENSION,
  type CompressionSettings,
  type EncodedImage,
} from "../compression/compression";

import { cropRectangle } from "../compression/crop";
import { withResolution } from "../compression/resolution";
import { HEIC_FILE_NAME, HEIC_MIME_TYPE } from "../regex";
import { tryCatchAsync } from "@/utils/try-catch";

export type WorkerRequest =
  | { kind: "decode"; file: File }
  | { kind: "compress"; bitmap: ImageBitmap; settings: CompressionSettings };
export type WorkerResponse =
  | { kind: "decoded"; bitmap: ImageBitmap; preview: Blob }
  | { kind: "result"; result: EncodedImage; elapsed: number }
  | { kind: "estimate"; seconds: number }
  | { kind: "error"; message: string };

function send(message: WorkerResponse, transfer: Transferable[] = []) {
  self.postMessage(message, { transfer });
}

/** Browsers cannot decode HEIC themselves, so decode it in WebAssembly. */
async function decodeHeic(file: File) {
  const { all } = await import("heic-decode");
  const images = await all({
    buffer: new Uint8Array(await file.arrayBuffer()),
  });
  try {
    const image = images[0];
    if (!image) throw new Error("This HEIC file contains no image.");
    if (
      image.width * image.height > MAX_PIXELS ||
      image.width > MAX_IMAGE_DIMENSION ||
      image.height > MAX_IMAGE_DIMENSION
    )
      throw new Error(
        "Please use an image under 50 megapixels and 16,384 pixels per side.",
      );
    const decoded = await image.decode();
    const data = new ImageData(decoded.data, decoded.width, decoded.height);
    const bitmap = await createImageBitmap(data);
    const canvas = new OffscreenCanvas(decoded.width, decoded.height);
    canvas.getContext("2d")!.putImageData(data, 0, 0);
    const preview = await canvas.convertToBlob({ type: "image/png" });
    return { bitmap, preview };
  } finally {
    images.dispose();
  }
}

/** The image as a bitmap, and a preview the page can show. */
async function readImage(
  file: File,
): Promise<{ bitmap: ImageBitmap; preview: Blob }> {
  const native = await tryCatchAsync(() =>
    createImageBitmap(file, { imageOrientation: "from-image" }),
  );
  if (!native.error) return { bitmap: native.data, preview: file };
  if (!HEIC_FILE_NAME.test(file.name) && !HEIC_MIME_TYPE.test(file.type)) {
    throw new Error(
      "This image could not be read. Try a JPEG, PNG, WebP or HEIC file.",
    );
  }
  return decodeHeic(file);
}

async function decode(file: File) {
  const { bitmap, preview } = await readImage(file);
  if (
    bitmap.width * bitmap.height > MAX_PIXELS ||
    bitmap.width > MAX_IMAGE_DIMENSION ||
    bitmap.height > MAX_IMAGE_DIMENSION
  ) {
    bitmap.close();
    throw new Error(
      "Please use an image under 50 megapixels and 16,384 pixels per side.",
    );
  }
  send({ kind: "decoded", bitmap, preview }, [bitmap]);
}

async function compress(bitmap: ImageBitmap, settings: CompressionSettings) {
  const start = performance.now();
  const crop = settings.output
    ? cropRectangle(bitmap.width, bitmap.height, settings.output)
    : { left: 0, top: 0, width: bitmap.width, height: bitmap.height };
  const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
  const context = canvas.getContext("2d", { willReadFrequently: true });
  if (!context)
    throw new Error("Your browser could not create an image canvas.");
  // Turbopack's development workers use blob URLs. Resolve emitted WASM assets
  // against the site origin, rather than that blob URL, in both bundlers.
  const absoluteAsset = (url: URL) =>
    new URL(url.href, self.location.origin).href;
  let codec:
    | ((
        pixels: ImageData,
        options: { quality: number },
      ) => Promise<ArrayBuffer>)
    | null = null;
  if (settings.format === "jpeg") {
    const jpeg = await import("@jsquash/jpeg/encode");
    await jpeg.init({
      locateFile: () =>
        absoluteAsset(
          new URL("@jsquash/jpeg/codec/enc/mozjpeg_enc.wasm", import.meta.url),
        ),
    });
    codec = jpeg.default;
  } else if (settings.format === "webp") {
    const webp = await import("@jsquash/webp/encode");
    await webp.init({
      locateFile: (file: string) =>
        absoluteAsset(
          file.includes("simd")
            ? new URL(
                "@jsquash/webp/codec/enc/webp_enc_simd.wasm",
                import.meta.url,
              )
            : new URL("@jsquash/webp/codec/enc/webp_enc.wasm", import.meta.url),
        ),
    });
    codec = webp.default;
  }
  // Use the single-threaded codec inside our worker; nested worker bundles
  // introduce circular runtime chunks in Next.js production builds.
  const png =
    settings.format === "png"
      ? await import("@jsquash/oxipng/codec/pkg/squoosh_oxipng.js")
      : null;
  if (png)
    await png.default(
      absoluteAsset(
        new URL(
          "@jsquash/oxipng/codec/pkg/squoosh_oxipng_bg.wasm",
          import.meta.url,
        ),
      ),
    );
  let pixels: ImageData;
  let currentWidth = 0;
  let currentHeight = 0;
  try {
    const result = await compressImage(
      bitmap.width,
      bitmap.height,
      settings,
      async (width, height, quality) => {
        const attemptStart = performance.now();
        if (currentWidth !== width || currentHeight !== height) {
          canvas.width = width;
          canvas.height = height;
          if (settings.format === "jpeg") {
            context.fillStyle = "#ffffff";
            context.fillRect(0, 0, width, height);
          }
          context.imageSmoothingEnabled = true;
          context.imageSmoothingQuality = "high";
          context.drawImage(
            bitmap,
            crop.left,
            crop.top,
            crop.width,
            crop.height,
            0,
            0,
            width,
            height,
          );
          pixels = context.getImageData(0, 0, width, height);
          currentWidth = width;
          currentHeight = height;
        }
        const buffer = png
          ? new Uint8Array(
              png.optimise_raw(pixels.data, width, height, 2, false, false),
            ).buffer
          : await codec!(pixels, { quality });
        // An approximate next search round, calibrated to this device's last encode.
        send({
          kind: "estimate",
          seconds: Math.max(
            1,
            ((performance.now() - attemptStart) / 1000) *
              (settings.mode === "size" ? 8 : 1),
          ),
        });
        const blob = new Blob([buffer], { type: `image/${settings.format}` });
        return settings.output ? withResolution(blob, settings.output) : blob;
      },
    );
    send({
      kind: "result",
      result,
      elapsed: (performance.now() - start) / 1000,
    });
  } finally {
    bitmap.close();
  }
}

function handle(request: WorkerRequest) {
  if (request.kind === "decode") return decode(request.file);
  return compress(request.bitmap, request.settings);
}

self.onmessage = async (event: MessageEvent<WorkerRequest>) => {
  const { error } = await tryCatchAsync(() => handle(event.data));
  if (!error) return;
  send({
    kind: "error",
    message:
      error instanceof Error
        ? error.message
        : "Image processing failed. Please try another image.",
  });
};
