// @vitest-environment node
import { afterEach, describe, expect, it, vi } from "vitest";

const { all } = vi.hoisted(() => ({ all: vi.fn() }));
vi.mock("heic-decode", () => ({ all }));

afterEach(() => {
  vi.unstubAllGlobals();
  vi.resetModules();
  vi.clearAllMocks();
});

describe("local HEIC decoding", () => {
  it.each([
    { width: 10_000, height: 6_000 },
    { width: 16_385, height: 1 },
  ])(
    "rejects oversized dimensions before decoding pixels: %j",
    async (dimensions) => {
      const decode = vi.fn();
      const dispose = vi.fn();
      all.mockResolvedValue(
        Object.assign([{ ...dimensions, decode }], { dispose }),
      );
      vi.stubGlobal(
        "createImageBitmap",
        vi.fn().mockRejectedValue(new Error("Unsupported format")),
      );
      const worker = {
        postMessage: vi.fn(),
        onmessage: null as unknown as (event: {
          data: unknown;
        }) => Promise<void>,
      };
      vi.stubGlobal("self", worker);
      await import("./image.worker");

      await worker.onmessage({
        data: { kind: "decode", file: new File(["heic"], "image.heic") },
      });

      expect(decode).not.toHaveBeenCalled();
      expect(dispose).toHaveBeenCalledOnce();
      expect(worker.postMessage).toHaveBeenCalledWith(
        { kind: "error", message: expect.stringContaining("50 megapixels") },
        { transfer: [] },
      );
    },
  );
});

vi.mock("@jsquash/jpeg/encode", () => ({
  init: vi.fn(),
  default: vi.fn(async () => new Uint8Array([255, 216, 255, 217]).buffer),
}));

describe("local crop encoding", () => {
  it("draws the selected source rectangle into exact output dimensions", async () => {
    const context = {
      fillStyle: "",
      fillRect: vi.fn(),
      drawImage: vi.fn(),
      getImageData: vi.fn(() => ({ data: new Uint8ClampedArray(16) })),
      imageSmoothingEnabled: false,
      imageSmoothingQuality: "low",
    };
    vi.stubGlobal(
      "OffscreenCanvas",
      class {
        width: number;
        height: number;
        constructor(width: number, height: number) {
          this.width = width;
          this.height = height;
        }
        getContext() {
          return context;
        }
      },
    );
    const worker = {
      postMessage: vi.fn(),
      location: { origin: "https://example.test" },
      onmessage: null as unknown as (event: { data: unknown }) => Promise<void>,
    };
    vi.stubGlobal("self", worker);
    await import("./image.worker");
    const bitmap = { width: 600, height: 400, close: vi.fn() };
    await worker.onmessage({
      data: {
        kind: "compress",
        bitmap,
        settings: {
          format: "jpeg",
          mode: "manual",
          targetBytes: 1,
          quality: 80,
          width: 16384,
          output: { width: 100, height: 150, ppi: 300, x: 1, y: 1, zoom: 2 },
        },
      },
    });
    expect(context.drawImage).toHaveBeenCalledWith(
      bitmap,
      467,
      200,
      133,
      200,
      0,
      0,
      100,
      150,
    );
    expect(worker.postMessage).toHaveBeenCalledWith(
      expect.objectContaining({
        kind: "result",
        result: expect.objectContaining({
          width: 100,
          height: 150,
          quality: 80,
        }),
      }),
      { transfer: [] },
    );
    expect(bitmap.close).toHaveBeenCalledOnce();
  });
});
