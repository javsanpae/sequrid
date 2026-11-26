/**
 * Pixel operations on RGBA buffers. They work on plain ImageData-like objects
 * so they can run (and be tested) without a canvas.
 */
export interface PixelBuffer {
  data: Uint8ClampedArray;
  width: number;
  height: number;
}

export type CoverStyle = 'black' | 'pixelate' | 'blur';

/** Replaces each block × block cell with its average colour. */
export function pixelate(img: PixelBuffer, block: number): void {
  const { data, width, height } = img;
  const b = Math.max(1, Math.floor(block));
  for (let by = 0; by < height; by += b) {
    for (let bx = 0; bx < width; bx += b) {
      const ex = Math.min(bx + b, width);
      const ey = Math.min(by + b, height);
      let r = 0;
      let g = 0;
      let bl = 0;
      let a = 0;
      let n = 0;
      for (let y = by; y < ey; y++) {
        for (let x = bx; x < ex; x++) {
          const i = (y * width + x) * 4;
          r += data[i];
          g += data[i + 1];
          bl += data[i + 2];
          a += data[i + 3];
          n++;
        }
      }
      r /= n;
      g /= n;
      bl /= n;
      a /= n;
      for (let y = by; y < ey; y++) {
        for (let x = bx; x < ex; x++) {
          const i = (y * width + x) * 4;
          data[i] = r;
          data[i + 1] = g;
          data[i + 2] = bl;
          data[i + 3] = a;
        }
      }
    }
  }
}

/** One horizontal + vertical box blur pass, with clamped edges. */
function boxBlurPass(src: Float32Array, dst: Float32Array, width: number, height: number, radius: number): void {
  const size = radius * 2 + 1;
  // Horizontal: src -> dst
  for (let y = 0; y < height; y++) {
    for (let c = 0; c < 4; c++) {
      let acc = 0;
      for (let k = -radius; k <= radius; k++) {
        const x = Math.min(width - 1, Math.max(0, k));
        acc += src[(y * width + x) * 4 + c];
      }
      for (let x = 0; x < width; x++) {
        dst[(y * width + x) * 4 + c] = acc / size;
        const out = Math.max(0, x - radius);
        const inn = Math.min(width - 1, x + radius + 1);
        acc += src[(y * width + inn) * 4 + c] - src[(y * width + out) * 4 + c];
      }
    }
  }
  // Vertical: dst -> src
  for (let x = 0; x < width; x++) {
    for (let c = 0; c < 4; c++) {
      let acc = 0;
      for (let k = -radius; k <= radius; k++) {
        const y = Math.min(height - 1, Math.max(0, k));
        acc += dst[(y * width + x) * 4 + c];
      }
      for (let y = 0; y < height; y++) {
        src[(y * width + x) * 4 + c] = acc / size;
        const out = Math.max(0, y - radius);
        const inn = Math.min(height - 1, y + radius + 1);
        acc += dst[(inn * width + x) * 4 + c] - dst[(out * width + x) * 4 + c];
      }
    }
  }
}

/** Approximates a gaussian blur with repeated box blurs. */
export function boxBlur(img: PixelBuffer, radius: number, passes = 3): void {
  const r = Math.max(1, Math.floor(radius));
  const { data, width, height } = img;
  if (width === 0 || height === 0) return;
  const a = Float32Array.from(data);
  const b = new Float32Array(a.length);
  for (let p = 0; p < passes; p++) boxBlurPass(a, b, width, height, r);
  for (let i = 0; i < data.length; i++) data[i] = a[i];
}

/** Converts to grayscale in place (Rec. 601 luma). */
export function grayscale(img: PixelBuffer): void {
  const d = img.data;
  for (let i = 0; i < d.length; i += 4) {
    const y = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
    d[i] = d[i + 1] = d[i + 2] = y;
  }
}

/**
 * Effect strength for a zone of w × h pixels. Blocks are large enough that
 * text underneath cannot be read or reconstructed.
 */
export function coverStrength(w: number, h: number): { block: number; radius: number } {
  const short = Math.max(1, Math.min(w, h));
  return {
    block: Math.max(4, Math.round(short / 2.5)),
    radius: Math.max(2, Math.round(short / 4)),
  };
}

/** Applies a cover style to a buffer containing exactly the zone pixels. */
export function coverBuffer(img: PixelBuffer, style: Exclude<CoverStyle, 'black'>): void {
  const { block, radius } = coverStrength(img.width, img.height);
  if (style === 'pixelate') {
    pixelate(img, block);
  } else {
    // Pixelate first so the blur never keeps recoverable detail.
    pixelate(img, Math.max(3, Math.round(block / 2)));
    boxBlur(img, radius, 3);
  }
}
