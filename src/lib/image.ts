/** Longest side kept from the original photo. Enough for a sharp A4 print. */
export const MAX_SOURCE_SIDE = 2800;

export const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/gif', 'image/bmp'];

export class UnsupportedImageError extends Error {}

export function createCanvas(width: number, height: number): HTMLCanvasElement {
  const c = document.createElement('canvas');
  c.width = Math.max(1, Math.round(width));
  c.height = Math.max(1, Math.round(height));
  return c;
}

export function ctx2d(c: HTMLCanvasElement): CanvasRenderingContext2D {
  const ctx = c.getContext('2d', { willReadFrequently: false });
  if (!ctx) throw new Error('Canvas 2D no disponible');
  return ctx;
}

async function decode(file: Blob): Promise<ImageBitmap | HTMLImageElement> {
  if ('createImageBitmap' in window) {
    try {
      return await createImageBitmap(file, { imageOrientation: 'from-image' });
    } catch {
      /* fall back to <img> below */
    }
  }
  const url = URL.createObjectURL(file);
  try {
    const img = new Image();
    img.decoding = 'async';
    img.src = url;
    await img.decode();
    return img;
  } finally {
    URL.revokeObjectURL(url);
  }
}

/**
 * Reads a photo into a canvas, applying its EXIF orientation and scaling it
 * down. Drawing to a canvas also drops every bit of metadata (GPS, camera…).
 */
export async function loadImageFile(file: File): Promise<HTMLCanvasElement> {
  if (file.type && !file.type.startsWith('image/')) {
    throw new UnsupportedImageError('El archivo no es una imagen.');
  }
  let bitmap: ImageBitmap | HTMLImageElement;
  try {
    bitmap = await decode(file);
  } catch {
    const heic = /hei[cf]/i.test(file.type) || /\.hei[cf]$/i.test(file.name);
    throw new UnsupportedImageError(
      heic
        ? 'Tu navegador no puede abrir fotos HEIC. Expórtala como JPG o cambia la cámara a "Más compatible".'
        : 'No se ha podido leer la imagen. Prueba con un JPG, PNG o WebP.',
    );
  }
  const w = bitmap.width;
  const h = bitmap.height;
  const s = Math.min(1, MAX_SOURCE_SIDE / Math.max(w, h));
  const canvas = createCanvas(w * s, h * s);
  const ctx = ctx2d(canvas);
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  if ('close' in bitmap) bitmap.close();
  return canvas;
}

export function canvasToBlob(canvas: HTMLCanvasElement, type = 'image/jpeg', quality = 0.92): Promise<Blob> {
  return new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('No se pudo generar la imagen'))), type, quality),
  );
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.rel = 'noopener';
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 30_000);
}
