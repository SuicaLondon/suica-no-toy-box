import { z } from "zod";

export const MAX_IMAGE_DIMENSION = 16_384;

export const outputSizeSchema = z
  .object({
    width: z.number().int().min(1).max(MAX_IMAGE_DIMENSION),
    height: z.number().int().min(1).max(MAX_IMAGE_DIMENSION),
    ppi: z.number().int().min(1).max(2400),
    x: z.number().min(0).max(1),
    y: z.number().min(0).max(1),
    zoom: z.number().min(1).max(10),
  })
  .strict()
  .refine((value) => value.width * value.height <= 50_000_000, {
    message: "Output must not exceed 50 megapixels.",
  });

export const compressionSettingsSchema = z
  .object({
    format: z.enum(["jpeg", "webp", "png"]),
    mode: z.enum(["size", "manual"]),
    targetBytes: z.number().int().positive().max(Number.MAX_SAFE_INTEGER),
    quality: z.number().int().min(1).max(100),
    width: z.number().int().min(1).max(MAX_IMAGE_DIMENSION),
    output: outputSizeSchema.optional(),
  })
  .strict();

export type CompressionSettings = z.infer<typeof compressionSettingsSchema>;
export type ImageFormat = CompressionSettings["format"];
export type CompressionMode = CompressionSettings["mode"];
