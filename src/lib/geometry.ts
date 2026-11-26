/** A rectangle in normalized coordinates (0..1) unless stated otherwise. */
export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export type Rotation = 0 | 90 | 180 | 270;

export const FULL_RECT: Readonly<Rect> = Object.freeze({ x: 0, y: 0, w: 1, h: 1 });

export const clamp = (v: number, min: number, max: number): number => Math.min(max, Math.max(min, v));

/** Builds a rect from two arbitrary corner points. */
export function rectFromPoints(ax: number, ay: number, bx: number, by: number): Rect {
  return { x: Math.min(ax, bx), y: Math.min(ay, by), w: Math.abs(bx - ax), h: Math.abs(by - ay) };
}

/** Keeps a rect fully inside the unit square, shrinking it if needed. */
export function clampRect(r: Rect, minSize = 0): Rect {
  const w = clamp(r.w, minSize, 1);
  const h = clamp(r.h, minSize, 1);
  return { x: clamp(r.x, 0, 1 - w), y: clamp(r.y, 0, 1 - h), w, h };
}

/** Moves a rect by (dx, dy) without leaving the unit square or changing its size. */
export function moveRect(r: Rect, dx: number, dy: number): Rect {
  return { ...r, x: clamp(r.x + dx, 0, 1 - r.w), y: clamp(r.y + dy, 0, 1 - r.h) };
}

export type Handle = 'n' | 's' | 'e' | 'w' | 'ne' | 'nw' | 'se' | 'sw';

/** Resizes a rect by dragging one of its handles by (dx, dy). */
export function resizeRect(r: Rect, handle: Handle, dx: number, dy: number, minSize = 0.01): Rect {
  let left = r.x;
  let top = r.y;
  let right = r.x + r.w;
  let bottom = r.y + r.h;
  if (handle.includes('w')) left = clamp(left + dx, 0, right - minSize);
  if (handle.includes('e')) right = clamp(right + dx, left + minSize, 1);
  if (handle.includes('n')) top = clamp(top + dy, 0, bottom - minSize);
  if (handle.includes('s')) bottom = clamp(bottom + dy, top + minSize, 1);
  return { x: left, y: top, w: right - left, h: bottom - top };
}

/** Converts a normalized rect to integer pixel coordinates for a canvas of the given size. */
export function toPixels(r: Rect, width: number, height: number): Rect {
  const x = Math.max(0, Math.floor(r.x * width));
  const y = Math.max(0, Math.floor(r.y * height));
  const right = Math.min(width, Math.ceil((r.x + r.w) * width));
  const bottom = Math.min(height, Math.ceil((r.y + r.h) * height));
  return { x, y, w: Math.max(0, right - x), h: Math.max(0, bottom - y) };
}

/** Width/height after rotating an image of the given size. */
export function rotatedSize(width: number, height: number, rotation: Rotation): { width: number; height: number } {
  return rotation === 90 || rotation === 270 ? { width: height, height: width } : { width, height };
}

export const nextRotation = (r: Rotation): Rotation => (((r + 90) % 360) as Rotation);

/** Fits a box of (w, h) inside (maxW, maxH) keeping the aspect ratio. Never upscales unless allowed. */
export function fitSize(w: number, h: number, maxW: number, maxH: number, upscale = false): { width: number; height: number } {
  let s = Math.min(maxW / w, maxH / h);
  if (!upscale) s = Math.min(1, s);
  return { width: Math.max(1, Math.round(w * s)), height: Math.max(1, Math.round(h * s)) };
}
