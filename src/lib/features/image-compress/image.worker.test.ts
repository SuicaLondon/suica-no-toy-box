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
