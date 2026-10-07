import { z } from "zod";

export const MAX_IMAGE_DIMENSION = 16_384;

export const compressionSettingsSchema = z
  .object({
    format: z.enum(["jpeg", "webp", "png"]),
    mode: z.enum(["size", "manual"]),
    targetBytes: z.number().int().positive().max(Number.MAX_SAFE_INTEGER),
    quality: z.number().int().min(1).max(100),
    width: z.number().int().min(1).max(MAX_IMAGE_DIMENSION),
  })
  .strict();

export type CompressionSettings = z.infer<typeof compressionSettingsSchema>;
export type ImageFormat = CompressionSettings["format"];
export type CompressionMode = CompressionSettings["mode"];
