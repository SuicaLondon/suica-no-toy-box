import { MAX_FILE_BYTES, type ImageFormat } from "../compression/compression";
import { IMAGE_FILE_NAME, IMAGE_MIME_TYPE } from "../regex";

/** Why a dropped or picked file was turned away. */
export type SourceFileProblem = "oneImage" | "supportedImage" | "fileSizeError";

export type SourceFileCheck =
  | { file: File; format: ImageFormat; problem?: never }
  | { problem: SourceFileProblem; file?: never; format?: never };

/** The output format a source suggests: its own, or JPEG for HEIC. */
function detectFormat(file: File): ImageFormat {
  const mimeFormat = file.type.toLowerCase().split("/")[1];
  const extension = file.name.split(".").pop()?.toLowerCase();
  const detected = ["jpeg", "png", "webp"].includes(mimeFormat)
    ? mimeFormat
    : extension;
  if (detected === "png" || detected === "webp") return detected;
  return "jpeg";
}

/** One readable, non-empty image under the size limit, or why not. */
export function checkSourceFiles(files: FileList | File[]): SourceFileCheck {
  if (files.length !== 1) return { problem: "oneImage" };
  const file = files[0];
  if (!IMAGE_FILE_NAME.test(file.name) && !IMAGE_MIME_TYPE.test(file.type))
    return { problem: "supportedImage" };
  if (!file.size || file.size > MAX_FILE_BYTES)
    return { problem: "fileSizeError" };
  return { file, format: detectFormat(file) };
}
