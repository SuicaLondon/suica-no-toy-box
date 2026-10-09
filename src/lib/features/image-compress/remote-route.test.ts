// @vitest-environment node
import { describe, expect, it } from "vitest";
import sharp from "sharp";
import { POST } from "@/app/api/image-compress/route";
import { REMOTE_MAX_BYTES, type CompressionSettings } from "./compression";

const settings: CompressionSettings = {
  format: "jpeg",
  mode: "manual",
  targetBytes: 1,
  quality: 90,
  width: 30,
};
const request = (
  data: Uint8Array,
  options = settings,
  headers: Record<string, string> = {},
) =>
  new Request("http://localhost/api/image-compress", {
    method: "POST",
    body: new Blob([new Uint8Array(data)]),
    headers: { "X-Image-Settings": JSON.stringify(options), ...headers },
  });
const transparent = () =>
  sharp({
    create: {
      width: 60,
      height: 40,
      channels: 4,
      background: { r: 255, g: 0, b: 0, alpha: 0 },
    },
  })
    .png()
    .toBuffer();

describe("remote image conversion", () => {
  it("returns an uncached JPEG with the selected dimensions and white background", async () => {
    const response = await POST(request(await transparent()));
    expect(response.status).toBe(200);
    expect(response.headers.get("cache-control")).toContain("no-store");
    expect(response.headers.get("content-type")).toBe("image/jpeg");
    expect(response.headers.get("x-image-width")).toBe("30");
    expect(response.headers.get("x-image-height")).toBe("20");
    const image = sharp(Buffer.from(await response.arrayBuffer()));
    const pixel = await image.raw().toBuffer();
    expect([...pixel.subarray(0, 3)]).toEqual([255, 255, 255]);
    expect((await image.metadata()).exif).toBeUndefined();
  });

  it.each(["webp", "png"] as const)(
    "converts to %s while retaining transparency",
    async (format) => {
      const response = await POST(
        request(await transparent(), { ...settings, format }),
      );
      expect(response.status).toBe(200);
      expect(response.headers.get("content-type")).toBe(`image/${format}`);
      const pixel = await sharp(Buffer.from(await response.arrayBuffer()))
        .ensureAlpha()
        .raw()
        .toBuffer();
      expect(pixel[3]).toBe(0);
    },
  );

  it("checks actual output bytes when enforcing a size target", async () => {
    const data = Buffer.from(
      Array.from({ length: 120 * 80 * 3 }, (_, index) => (index * 71) % 251),
    );
    const input = await sharp(data, {
      raw: { width: 120, height: 80, channels: 3 },
    })
      .png()
      .toBuffer();
    const response = await POST(
      request(input, { ...settings, mode: "size", targetBytes: 1000 }),
    );
    expect(response.status).toBe(200);
    expect((await response.arrayBuffer()).byteLength).toBeLessThanOrEqual(1000);
  });

  it("accepts a size target above 50 MB when the image fits the remote limits", async () => {
    const response = await POST(
      request(await transparent(), {
        ...settings,
        mode: "size",
        targetBytes: 51_000_000,
      }),
    );
    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toBe("image/jpeg");
  });

  it("rejects oversize uploads without relying on Content-Length", async () => {
    const response = await POST(request(new Uint8Array(REMOTE_MAX_BYTES + 1)));
    expect(response.status).toBe(413);
    expect((await response.json()).error).toContain("4 MB");
  });

  it("rejects invalid settings and corrupt images", async () => {
    expect(
      (await POST(request(new Uint8Array([1]), { ...settings, quality: 101 })))
        .status,
    ).toBe(400);
    expect((await POST(request(new Uint8Array([1, 2, 3])))).status).toBe(422);
  });

  it("rejects cross-origin uploads", async () => {
    expect(
      (
        await POST(
          request(new Uint8Array([1]), settings, {
            origin: "https://another-site.example",
          }),
        )
      ).status,
    ).toBe(403);
  });

  it("accepts the browser origin when Next.js normalizes the internal URL", async () => {
    const response = await POST(
      request(await transparent(), settings, {
        host: "127.0.0.1:3012",
        origin: "http://127.0.0.1:3012",
      }),
    );
    expect(response.status).toBe(200);
  });

  it("rejects oversized dimensions before decoding all pixels", async () => {
    const input = await sharp({
      create: { width: 5000, height: 4100, channels: 3, background: "white" },
    })
      .png()
      .toBuffer();
    const response = await POST(request(input));
    expect([413, 422]).toContain(response.status);
  });

  it("rejects output larger than the serverless response limit", async () => {
    // A lossy JPEG can be a small upload yet expand beyond the response limit as PNG.
    let state = 71;
    const noise = Buffer.alloc(1600 * 1200 * 3);
    for (let index = 0; index < noise.length; index++) {
      state = (Math.imul(state, 1664525) + 1013904223) | 0;
      noise[index] = state >>> 24;
    }
    const input = await sharp(noise, {
      raw: { width: 1600, height: 1200, channels: 3 },
    })
      .jpeg({ quality: 85 })
      .toBuffer();
    expect(input.byteLength).toBeLessThan(REMOTE_MAX_BYTES);
    const response = await POST(
      request(input, { ...settings, format: "png", width: 1600 }),
    );
    expect(response.status).toBe(413);
    expect((await response.json()).error).toContain("download limit");
  });
});

describe("fixed-size crop export", () => {
  const output = { width: 100, height: 150, ppi: 300, x: 1, y: 0.5, zoom: 1 };

  it.each(["jpeg", "png", "webp"] as const)(
    "exports exact dimensions and readable resolution in %s",
    async (format) => {
      const response = await POST(
        request(await transparent(), { ...settings, format, output }),
      );
      expect(response.status).toBe(200);
      expect(response.headers.get("x-image-width")).toBe("100");
      expect(response.headers.get("x-image-height")).toBe("150");
      const image = sharp(Buffer.from(await response.arrayBuffer()));
      const metadata = await image.metadata();
      expect(metadata.width).toBe(100);
      expect(metadata.height).toBe(150);
      if (format === "webp") {
        // libvips exposes WebP EXIF but does not promote it to metadata.density.
        const exif = metadata.exif!;
        expect(exif.subarray(0, 6).toString()).toBe("Exif\0\0");
        const tiff = exif.subarray(6);
        const ifd = tiff.readUInt32LE(4);
        const tags = new Map<number, number>();
        for (let index = 0; index < tiff.readUInt16LE(ifd); index++) {
          const entry = ifd + 2 + index * 12;
          const value = tiff.readUInt32LE(entry + 8);
          tags.set(
            tiff.readUInt16LE(entry),
            tiff.readUInt16LE(entry + 2) === 5
              ? tiff.readUInt32LE(value) / tiff.readUInt32LE(value + 4)
              : value,
          );
        }
        expect(tags.get(0x11a)).toBe(300);
        expect(tags.get(0x11b)).toBe(300);
        expect(tags.get(0x128)).toBe(2);
      } else expect(metadata.density).toBe(300);
      if (format !== "jpeg") {
        const pixels = await image.ensureAlpha().raw().toBuffer();
        expect(pixels[3]).toBe(0);
      }
    },
  );

  it("adds resolution to an opaque WebP without breaking the image", async () => {
    const input = await sharp({
      create: { width: 80, height: 60, channels: 3, background: "red" },
    })
      .png()
      .toBuffer();
    const response = await POST(
      request(input, { ...settings, format: "webp", output }),
    );
    expect(response.status).toBe(200);
    const image = sharp(Buffer.from(await response.arrayBuffer()));
    const metadata = await image.metadata();
    expect(metadata).toMatchObject({
      width: 100,
      height: 150,
      hasAlpha: false,
    });
    expect(metadata.exif).toBeDefined();
    const pixels = await image.raw().toBuffer();
    expect(pixels[0]).toBeGreaterThan(240);
    expect(pixels[1]).toBeLessThan(15);
  });

  it("crops the chosen part of the source before resizing", async () => {
    const pixels = Buffer.alloc(80 * 40 * 3);
    for (let y = 0; y < 40; y++)
      for (let x = 0; x < 80; x++)
        pixels[(y * 80 + x) * 3 + (x < 40 ? 0 : 2)] = 255;
    const input = await sharp(pixels, {
      raw: { width: 80, height: 40, channels: 3 },
    })
      .png()
      .toBuffer();
    for (const x of [0, 1]) {
      const response = await POST(
        request(input, {
          ...settings,
          format: "png",
          output: { ...output, width: 20, height: 20, x },
        }),
      );
      const image = await sharp(Buffer.from(await response.arrayBuffer()))
        .removeAlpha()
        .raw()
        .toBuffer();
      expect([...image.subarray(0, 3)]).toEqual(x ? [0, 0, 255] : [255, 0, 0]);
    }
  });

  it("preserves fixed dimensions even when the byte target is impossible", async () => {
    const response = await POST(
      request(await transparent(), {
        ...settings,
        output,
        mode: "size",
        targetBytes: 1,
      }),
    );
    expect(response.status).toBe(200);
    expect(response.headers.get("x-image-width")).toBe("100");
    expect(response.headers.get("x-image-quality")).toBe("1");
    expect((await response.arrayBuffer()).byteLength).toBeGreaterThan(1);
  });

  it("rejects excessive output allocations before encoding", async () => {
    const response = await POST(
      request(await transparent(), {
        ...settings,
        output: { ...output, width: 5000, height: 5000 },
      }),
    );
    expect(response.status).toBe(413);
  });
});
