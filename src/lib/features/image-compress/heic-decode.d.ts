declare module "heic-decode" {
  interface DecodedImage {
    width: number;
    height: number;
    data: Uint8ClampedArray<ArrayBuffer>;
  }
  export function all(options: { buffer: Uint8Array }): Promise<
    Array<{
      width: number;
      height: number;
      decode(): Promise<DecodedImage>;
    }> & { dispose(): void }
  >;
  export default function decode(options: { buffer: Uint8Array }): Promise<{
    width: number;
    height: number;
    data: Uint8ClampedArray<ArrayBuffer>;
  }>;
}
