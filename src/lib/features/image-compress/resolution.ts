import type { OutputSize } from "./crop";

const ascii = (text: string) => new TextEncoder().encode(text);
const nameAt = (data: Uint8Array, offset: number, length = 4) =>
  String.fromCharCode(...data.subarray(offset, offset + length));

function crc32(data: Uint8Array) {
  let crc = 0xffffffff;
  for (const byte of data) {
    crc ^= byte;
    for (let bit = 0; bit < 8; bit++)
      crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

// A fresh TIFF IFD contains only resolution, never source camera metadata.
function resolutionExif(ppi: number) {
  const data = new Uint8Array(66);
  const view = new DataView(data.buffer);
  data.set([0x49, 0x49, 42, 0, 8, 0, 0, 0]);
  view.setUint16(8, 3, true);
  for (const [index, tag, type, value] of [
    [0, 0x11a, 5, 50],
    [1, 0x11b, 5, 58],
    [2, 0x128, 3, 2],
  ]) {
    const offset = 10 + index * 12;
    view.setUint16(offset, tag, true);
    view.setUint16(offset + 2, type, true);
    view.setUint32(offset + 4, 1, true);
    view.setUint32(offset + 8, value, true);
  }
  for (const offset of [50, 58]) {
    view.setUint32(offset, ppi, true);
    view.setUint32(offset + 4, 1, true);
  }
  return data;
}

// Add density before measuring bytes so size targets include metadata overhead.
// Inputs are fresh encoder outputs, not untrusted source-file metadata.
export async function withResolution(
  blob: Blob,
  output: OutputSize,
): Promise<Blob> {
  const data = new Uint8Array(await blob.arrayBuffer());
  const view = new DataView(data.buffer);
  const { ppi } = output;
  if (blob.type === "image/jpeg") {
    // JFIF density is supported by print software without retaining EXIF.
    for (let offset = 2; offset + 4 < data.length; ) {
      if (data[offset] !== 0xff || data[offset + 1] === 0xda) break;
      const length = view.getUint16(offset + 2);
      if (length < 2 || offset + 2 + length > data.length) break;
      if (
        data[offset + 1] === 0xe0 &&
        length >= 16 &&
        nameAt(data, offset + 4, 5) === "JFIF\0"
      ) {
        data[offset + 11] = 1;
        view.setUint16(offset + 12, ppi);
        view.setUint16(offset + 14, ppi);
        return new Blob([data], { type: blob.type });
      }
      offset += 2 + length;
    }
    const header = new Uint8Array([
      255, 224, 0, 16, 74, 70, 73, 70, 0, 1, 2, 1, 0, 0, 0, 0, 0, 0,
    ]);
    const headerView = new DataView(header.buffer);
    headerView.setUint16(12, ppi);
    headerView.setUint16(14, ppi);
    return new Blob([data.slice(0, 2), header, data.slice(2)], {
      type: blob.type,
    });
  }
  if (blob.type === "image/png") {
    const chunk = new Uint8Array(21);
    const chunkView = new DataView(chunk.buffer);
    chunkView.setUint32(0, 9);
    chunk.set(ascii("pHYs"), 4);
    chunkView.setUint32(8, Math.round(ppi / 0.0254));
    chunkView.setUint32(12, Math.round(ppi / 0.0254));
    chunk[16] = 1;
    chunkView.setUint32(17, crc32(chunk.subarray(4, 17)));
    const parts: BlobPart[] = [data.slice(0, 8)];
    for (let offset = 8; offset + 12 <= data.length; ) {
      const length = view.getUint32(offset) + 12;
      const name = nameAt(data, offset + 4);
      if (name !== "pHYs") parts.push(data.slice(offset, offset + length));
      if (name === "IHDR") parts.push(chunk);
      offset += length;
    }
    return new Blob(parts, { type: blob.type });
  }
  if (blob.type === "image/webp") {
    const parts: Uint8Array<ArrayBuffer>[] = [];
    let extended: Uint8Array<ArrayBuffer> | undefined;
    let alpha = false;
    for (let offset = 12; offset + 8 <= data.length; ) {
      const name = nameAt(data, offset);
      const length = view.getUint32(offset + 4, true);
      const chunk = data.slice(offset, offset + 8 + length + (length % 2));
      if (name === "VP8X") extended = chunk;
      else if (name !== "EXIF") parts.push(chunk);
      if (name === "ALPH" || (name === "VP8L" && data[offset + 12] & 0x10))
        alpha = true;
      offset += chunk.length;
    }
    if (!extended) {
      extended = new Uint8Array(18);
      extended.set(ascii("VP8X"));
      extended[4] = 10;
      extended[8] = alpha ? 0x10 : 0;
      for (let i = 0; i < 3; i++) {
        extended[12 + i] = ((output.width - 1) >>> (i * 8)) & 255;
        extended[15 + i] = ((output.height - 1) >>> (i * 8)) & 255;
      }
    }
    extended[8] |= 0x08;
    const exif = new Uint8Array(72);
    exif.set(ascii("Exif\0\0"));
    exif.set(resolutionExif(ppi), 6);
    const exifChunk = new Uint8Array(8 + exif.length);
    exifChunk.set(ascii("EXIF"));
    new DataView(exifChunk.buffer).setUint32(4, exif.length, true);
    exifChunk.set(exif, 8);
    const header = data.slice(0, 12);
    new DataView(header.buffer).setUint32(
      4,
      4 +
        extended.length +
        parts.reduce((total, part) => total + part.length, 0) +
        exifChunk.length,
      true,
    );
    return new Blob([header, extended, ...parts, exifChunk], {
      type: blob.type,
    });
  }
  return blob;
}
