/**
 * Keyboard control of the crop. Arrow keys move the image with the key, so
 * the crop window moves the other way; shift moves ten times as far.
 */
const MOVES = new Map([
  ["ArrowLeft", { x: 1, y: 0 }],
  ["ArrowRight", { x: -1, y: 0 }],
  ["ArrowUp", { x: 0, y: 1 }],
  ["ArrowDown", { x: 0, y: -1 }],
]);

/** + (or =, the same key unshifted) zooms in, - zooms out. */
const ZOOMS = new Map([
  ["+", 1.1],
  ["=", 1.1],
  ["-", 1 / 1.1],
]);

/** How far a key moves the crop, or undefined for other keys. */
export function cropMove(key: string, shift: boolean) {
  const direction = MOVES.get(key);
  if (!direction) return undefined;
  const step = shift ? 0.1 : 0.01;
  return { x: direction.x * step, y: direction.y * step };
}

/** How much a key zooms the crop, or undefined for other keys. */
export function cropZoom(key: string): number | undefined {
  return ZOOMS.get(key);
}
