import { describe, expect, it, vi } from "vitest";
import {
  compressImage,
  dimensionsAtWidth,
  type CompressionSettings,
} from "./compression";

const settings: CompressionSettings = {
  format: "jpeg",
  mode: "size",
  targetBytes: 700,
  quality: 90,
  width: 100,
};
const blob = (size: number) => new Blob([new Uint8Array(size)]);

describe("image compression policy", () => {
  it("keeps full quality and dimensions when they meet the target", async () => {
    const encode = vi.fn(async () => blob(500));
    const result = await compressImage(100, 50, settings, encode);
    expect(result).toMatchObject({ width: 100, height: 50, quality: 100 });
    expect(encode).toHaveBeenCalledTimes(1);
  });

  it("finds high quality beneath the byte ceiling before resizing", async () => {
    const result = await compressImage(
      100,
      50,
      settings,
      async (_width, _height, quality) => blob(quality * 10),
    );
    expect(result.width).toBe(100);
    expect(result.quality).toBeGreaterThanOrEqual(69);
    expect(result.blob.size).toBeLessThanOrEqual(700);
  });

  it("reduces dimensions when quality alone cannot reach the target", async () => {
    const result = await compressImage(
      100,
      50,
      settings,
      async (width, height, quality) =>
        blob(Math.ceil((width * height * quality) / 100)),
    );
    expect(result.width).toBeLessThan(100);
    expect(result.height).toBe(Math.round(result.width / 2));
    expect(result.blob.size).toBeLessThanOrEqual(700);
  });

  it("keeps PNG quality lossless while reducing its dimensions", async () => {
    const encode = vi.fn(async (width: number, height: number) =>
      blob(width * height),
    );
    const result = await compressImage(
      100,
      50,
      { ...settings, format: "png" },
      encode,
    );
    expect(result.blob.size).toBeLessThanOrEqual(700);
    expect(encode.mock.calls.every((call) => call[0] > 0)).toBe(true);
    expect(result.quality).toBe(100);
  });

  it("returns the smallest actual candidate if a target is impossible", async () => {
    const result = await compressImage(
      100,
      50,
      { ...settings, targetBytes: 1 },
      async (width, height) => blob(100 + width * height),
    );
    expect(result.blob.size).toBe(101);
    expect(result.width).toBe(1);
  });

  it("respects manual quality and dimensions without applying a byte ceiling", async () => {
    const result = await compressImage(
      100,
      50,
      { ...settings, mode: "manual", width: 60, quality: 93 },
      async () => blob(2000),
    );
    expect(result).toMatchObject({ width: 60, height: 30, quality: 93 });
    expect(result.blob.size).toBe(2000);
  });

  it("rejects invalid values before encoding", async () => {
    const encode = vi.fn(async () => blob(100));
    await expect(
      compressImage(100, 50, { ...settings, targetBytes: NaN }, encode),
    ).rejects.toThrow("valid");
    expect(encode).not.toHaveBeenCalled();
  });

  it("preserves aspect ratio and never upscales", () => {
    expect(dimensionsAtWidth(500, 100, 50)).toEqual({ width: 100, height: 50 });
    expect(dimensionsAtWidth(1, 1000, 1)).toEqual({ width: 1, height: 1 });
  });
});
