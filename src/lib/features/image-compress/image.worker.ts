import {
  compressImage,
  MAX_PIXELS,
  MAX_IMAGE_DIMENSION,
  type CompressionSettings,
  type EncodedImage,
} from "./compression";

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

async function decode(file: File) {
  let bitmap: ImageBitmap;
  let preview: Blob = file;
  try {
    bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  } catch {
    if (
      !/\.(heic|heif)$/i.test(file.name) &&
      !/image\/hei[cf]/.test(file.type)
    ) {
      throw new Error(
        "This image could not be read. Try a JPEG, PNG, WebP or HEIC file.",
      );
    }
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
      bitmap = await createImageBitmap(data);
      const canvas = new OffscreenCanvas(decoded.width, decoded.height);
      canvas.getContext("2d")!.putImageData(data, 0, 0);
      preview = await canvas.convertToBlob({ type: "image/png" });
    } finally {
      images.dispose();
    }
  }
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
          context.drawImage(bitmap, 0, 0, width, height);
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
        return new Blob([buffer], { type: `image/${settings.format}` });
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

self.onmessage = async (event: MessageEvent<WorkerRequest>) => {
  try {
    if (event.data.kind === "decode") await decode(event.data.file);
    else await compress(event.data.bitmap, event.data.settings);
  } catch (error) {
    send({
      kind: "error",
      message:
        error instanceof Error
          ? error.message
          : "Image processing failed. Please try another image.",
    });
  }
};
