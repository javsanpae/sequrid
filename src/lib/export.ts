import { buildPdf, layoutPages, type PdfImage } from './pdf';
import { canvasToBlob, createCanvas, ctx2d, downloadBlob } from './image';
import { renderProtected, type RenderSettings } from './render';
import { app, FACE_META, type Face, type FaceId } from './state.svelte';

/** Longest width used for downloads. Plenty for print at 300 dpi of an ID-1 card. */
export const EXPORT_WIDTH = 2000;

export function renderSettings(face: Face): RenderSettings {
  const wm = app.watermark;
  return {
    // Plain copies: reading every coordinate here also lets Svelte track them.
    zones: app.visibleZones(face).map((z) => ({ ...z.rect })),
    cover: app.coverStyle,
    grayscale: app.grayscale,
    watermark: wm.enabled
      ? { text: app.watermarkText, opacity: wm.opacity, size: wm.size, tone: wm.tone }
      : null,
  };
}

export function renderForExport(id: FaceId): HTMLCanvasElement | null {
  const face = app.faces[id];
  return face ? renderProtected(face, renderSettings(face), EXPORT_WIDTH) : null;
}

const fileBase = 'dni-protegido';
const faceFile = (id: FaceId) => `${fileBase}-dni${FACE_META[id].doc}-${FACE_META[id].side}`;

export async function downloadPdf(): Promise<void> {
  const ids = app.loaded;
  if (!ids.length) return;
  const images: PdfImage[] = [];
  for (const id of ids) {
    const canvas = renderForExport(id)!;
    const blob = await canvasToBlob(canvas, 'image/jpeg', 0.92);
    images.push({ jpeg: new Uint8Array(await blob.arrayBuffer()), width: canvas.width, height: canvas.height });
  }
  const pages = layoutPages(images, app.pdfSize);
  const pdf = buildPdf(pages, images);
  downloadBlob(new Blob([pdf as BlobPart], { type: 'application/pdf' }), `${fileBase}.pdf`);
}

export async function downloadFaceJpg(id: FaceId): Promise<void> {
  const canvas = renderForExport(id);
  if (!canvas) return;
  downloadBlob(await canvasToBlob(canvas), `${faceFile(id)}.jpg`);
}

/** All faces on one white sheet, two per row (front and back side by side). */
export async function downloadAllJpg(): Promise<void> {
  const canvases = app.loaded.map((id) => renderForExport(id)!);
  if (!canvases.length) return;
  const cellW = 1400;
  const pad = 60;
  const gap = 48;
  const cols = canvases.length === 1 ? 1 : 2;
  const rows: HTMLCanvasElement[][] = [];
  for (let i = 0; i < canvases.length; i += cols) rows.push(canvases.slice(i, i + cols));
  const scaled = rows.map((row) => row.map((c) => ({ c, h: (cellW * c.height) / c.width })));
  const rowHeights = scaled.map((row) => Math.max(...row.map((r) => r.h)));
  const width = pad * 2 + cols * cellW + (cols - 1) * gap;
  const height = pad * 2 + rowHeights.reduce((a, b) => a + b, 0) + (rows.length - 1) * gap;
  const sheet = createCanvas(width, height);
  const ctx = ctx2d(sheet);
  ctx.fillStyle = '#fff';
  ctx.fillRect(0, 0, width, height);
  let y = pad;
  scaled.forEach((row, r) => {
    row.forEach((item, i) => {
      ctx.drawImage(item.c, pad + i * (cellW + gap), y + (rowHeights[r] - item.h) / 2, cellW, item.h);
    });
    y += rowHeights[r] + gap;
  });
  downloadBlob(await canvasToBlob(sheet), `${fileBase}.jpg`);
}
