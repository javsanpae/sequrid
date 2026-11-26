import { coverBuffer, grayscale, type CoverStyle } from './effects';
import { rotatedSize, toPixels, type Rect, type Rotation } from './geometry';
import { createCanvas, ctx2d } from './image';
import { watermarkLayout } from './watermark';

export interface RenderSettings {
  zones: Rect[];
  cover: CoverStyle;
  grayscale: boolean;
  watermark: null | { text: string; opacity: number; size: number; tone: 'dark' | 'light' };
}

export interface FaceSource {
  image: HTMLCanvasElement;
  rotation: Rotation;
  frame: Rect;
}

const rotationCache = new WeakMap<HTMLCanvasElement, Map<Rotation, HTMLCanvasElement>>();

/** The source image rotated in 90° steps (cached per image). */
export function rotatedImage(image: HTMLCanvasElement, rotation: Rotation): HTMLCanvasElement {
  if (rotation === 0) return image;
  let byRot = rotationCache.get(image);
  if (!byRot) rotationCache.set(image, (byRot = new Map()));
  const hit = byRot.get(rotation);
  if (hit) return hit;
  const { width, height } = rotatedSize(image.width, image.height, rotation);
  const c = createCanvas(width, height);
  const ctx = ctx2d(c);
  ctx.translate(width / 2, height / 2);
  ctx.rotate((rotation * Math.PI) / 180);
  ctx.drawImage(image, -image.width / 2, -image.height / 2);
  byRot.set(rotation, c);
  return c;
}

/** Pixel size of the card frame inside the rotated source. */
export function frameSize(face: FaceSource): { width: number; height: number } {
  const rot = rotatedImage(face.image, face.rotation);
  const px = toPixels(face.frame, rot.width, rot.height);
  return { width: Math.max(1, px.w), height: Math.max(1, px.h) };
}

function prepare(face: FaceSource, maxWidth: number, target?: HTMLCanvasElement) {
  const rot = rotatedImage(face.image, face.rotation);
  const src = toPixels(face.frame, rot.width, rot.height);
  src.w = Math.max(1, src.w);
  src.h = Math.max(1, src.h);
  const scale = Math.min(1, maxWidth / src.w);
  const w = Math.max(1, Math.round(src.w * scale));
  const h = Math.max(1, Math.round(src.h * scale));
  const canvas = target ?? createCanvas(w, h);
  if (canvas.width !== w) canvas.width = w;
  if (canvas.height !== h) canvas.height = h;
  const ctx = ctx2d(canvas);
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.globalAlpha = 1;
  ctx.imageSmoothingQuality = 'high';
  ctx.clearRect(0, 0, w, h);
  ctx.drawImage(rot, src.x, src.y, src.w, src.h, 0, 0, w, h);
  return { canvas, ctx, w, h };
}

/** The card as photographed, cropped to its frame. */
export function renderOriginal(face: FaceSource, maxWidth = Infinity, target?: HTMLCanvasElement): HTMLCanvasElement {
  return prepare(face, maxWidth, target).canvas;
}

function drawWatermark(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  wm: NonNullable<RenderSettings['watermark']>,
): void {
  const text = wm.text.trim();
  if (!text) return;
  const layout = watermarkLayout(w, h, wm.size);
  ctx.save();
  ctx.translate(w / 2, h / 2);
  ctx.rotate(layout.angle);
  ctx.font = `700 ${layout.fontSize}px ui-monospace, "SFMono-Regular", "DejaVu Sans Mono", Menlo, Consolas, monospace`;
  ctx.textBaseline = 'middle';
  const unit = `${text}   ·   `;
  const unitW = Math.max(1, ctx.measureText(unit).width);
  const line = unit.repeat(Math.ceil((2 * layout.halfSpan) / unitW) + 2);
  ctx.globalAlpha = Math.min(1, Math.max(0.05, wm.opacity));
  ctx.lineJoin = 'round';
  ctx.lineWidth = Math.max(1, layout.fontSize * 0.12);
  ctx.strokeStyle = wm.tone === 'dark' ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.45)';
  ctx.fillStyle = wm.tone === 'dark' ? '#111418' : '#ffffff';
  layout.rows.forEach((y, i) => {
    const x = -layout.halfSpan - (i % 2 ? unitW / 2 : 0);
    ctx.strokeText(line, x, y);
    ctx.fillText(line, x, y);
  });
  ctx.restore();
}

/** The protected copy: zones covered, optional grayscale and watermark. */
export function renderProtected(
  face: FaceSource,
  settings: RenderSettings,
  maxWidth = Infinity,
  target?: HTMLCanvasElement,
): HTMLCanvasElement {
  const { canvas, ctx, w, h } = prepare(face, maxWidth, target);

  for (const zone of settings.zones) {
    const px = toPixels(zone, w, h);
    if (px.w < 1 || px.h < 1) continue;
    if (settings.cover === 'black') {
      ctx.fillStyle = '#000';
      ctx.fillRect(px.x, px.y, px.w, px.h);
    } else {
      const data = ctx.getImageData(px.x, px.y, px.w, px.h);
      coverBuffer(data, settings.cover);
      ctx.putImageData(data, px.x, px.y);
    }
  }

  if (settings.grayscale) {
    const data = ctx.getImageData(0, 0, w, h);
    grayscale(data);
    ctx.putImageData(data, 0, 0);
  }

  if (settings.watermark) drawWatermark(ctx, w, h, settings.watermark);
  return canvas;
}
