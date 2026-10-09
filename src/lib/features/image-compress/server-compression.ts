import sharp from "sharp";
import {
  compressImage,
  REMOTE_MAX_PIXELS,
  MAX_IMAGE_DIMENSION,
  type CompressionSettings,
} from "./compression";

import { cropRectangle } from "./crop";
import { withResolution } from "./resolution";

export class ImageRequestError extends Error {
  constructor(
    message: string,
    public status = 400,
  ) {
    super(message);
  }
}

export async function compressOnServer(
  input: Buffer,
  settings: CompressionSettings,
  signal: AbortSignal,
) {
  const deadline = Date.now() + 45_000;
  function checkActive() {
    if (signal.aborted)
      throw new ImageRequestError("The request was cancelled.", 499);
    if (Date.now() > deadline)
      throw new ImageRequestError(
        "Conversion took too long. Try a smaller image or use local mode.",
        504,
      );
  }
  function checkDimensions(width: number, height: number) {
    if (
      !width ||
      !height ||
      width * height > REMOTE_MAX_PIXELS ||
      width > MAX_IMAGE_DIMENSION ||
      height > MAX_IMAGE_DIMENSION
    ) {
      throw new ImageRequestError(
        "Remote mode supports up to 20 megapixels and 16,384 pixels per side. Use local mode for larger images.",
        413,
      );
    }
  }
  checkActive();
  if (settings.output)
    checkDimensions(settings.output.width, settings.output.height);
  let pixels: Buffer;
  let width: number;
  let height: number;
  let channels: 3 | 4;
  const brand = input.toString("ascii", 8, 12);
  const isHeic =
    input.toString("ascii", 4, 8) === "ftyp" &&
    ["heic", "heix", "hevc", "hevx", "mif1", "msf1"].includes(brand);
  try {
    if (isHeic) {
      const { all } = await import("heic-decode");
      const images = await all({ buffer: input });
      try {
        const image = images[0];
        if (!image) throw new Error("Empty image");
        checkDimensions(image.width, image.height);
        const decoded = await image.decode();
        width = decoded.width;
        height = decoded.height;
        channels = 4;
        pixels = Buffer.from(
          decoded.data.buffer,
          decoded.data.byteOffset,
          decoded.data.byteLength,
        );
      } finally {
        images.dispose();
      }
    } else {
      const image = sharp(input, {
        limitInputPixels: REMOTE_MAX_PIXELS,
        animated: false,
      });
      const metadata = await image.metadata();
      if (!["jpeg", "png", "webp"].includes(metadata.format ?? "")) {
        throw new ImageRequestError(
          "Choose a JPEG, PNG, WebP or HEIC image.",
          415,
        );
      }
      checkDimensions(metadata.width ?? 0, metadata.height ?? 0);
      const decoded = await image
        .rotate()
        .toColourspace("srgb")
        .ensureAlpha()
        .raw()
        .toBuffer({ resolveWithObject: true });
      pixels = decoded.data;
      width = decoded.info.width;
      height = decoded.info.height;
      channels = 4;
    }
  } catch (error) {
    if (error instanceof ImageRequestError) throw error;
    throw new ImageRequestError(
      "This image could not be decoded, or exceeds the remote image limits. Try local mode or another image.",
      422,
    );
  }
  checkActive();
  const crop = settings.output
    ? cropRectangle(width, height, settings.output)
    : null;
  return compressImage(
    width,
    height,
    settings,
    async (outputWidth, outputHeight, quality) => {
      checkActive();
      let pipeline = sharp(pixels, { raw: { width, height, channels } });
      if (crop) pipeline = pipeline.extract(crop);
      pipeline = pipeline.resize(outputWidth, outputHeight, {
        fit: "fill",
        withoutEnlargement: !settings.output,
      });
      if (settings.format === "jpeg")
        pipeline = pipeline
          .flatten({ background: "#ffffff" })
          .jpeg({ quality, mozjpeg: true });
      else if (settings.format === "webp")
        pipeline = pipeline.webp({ quality });
      else pipeline = pipeline.png({ compressionLevel: 9, palette: false });
      const output = await pipeline
        .timeout({
          seconds: Math.max(1, Math.ceil((deadline - Date.now()) / 1000)),
        })
        .toBuffer();
      checkActive();
      const blob = new Blob([new Uint8Array(output)], {
        type: `image/${settings.format}`,
      });
      return settings.output ? withResolution(blob, settings.output) : blob;
    },
  );
}
