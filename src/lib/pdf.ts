/**
 * A tiny PDF writer: A4 pages with JPEG images placed at exact physical sizes.
 * No fonts, no metadata, no external dependencies.
 */

export const MM_TO_PT = 72 / 25.4;
export const A4 = { widthMm: 210, heightMm: 297 } as const;

export interface PdfImage {
  /** Baseline JPEG bytes. */
  jpeg: Uint8Array;
  width: number;
  height: number;
}

/** An image placed on a page, in millimetres from the top-left corner. */
export interface Placement {
  image: number;
  x: number;
  y: number;
  w: number;
  h: number;
}

export type PdfSize = 'real' | 'large';

export interface LayoutOptions {
  /** Width of each image in mm. */
  itemWidth: number;
  columns: number;
  gap: number;
  margin: number;
}

export const LAYOUTS: Record<PdfSize, LayoutOptions> = {
  // ID-1 card size: prints at the card's real size.
  real: { itemWidth: 85.6, columns: 2, gap: 8, margin: 20 },
  // Double size, one per row: easier to read on screen.
  large: { itemWidth: 170, columns: 1, gap: 12, margin: 20 },
};

/**
 * Places images (given by their pixel sizes) on A4 pages in a grid, keeping
 * aspect ratios and starting a new page when a row does not fit.
 */
export function layoutPages(sizes: { width: number; height: number }[], size: PdfSize): Placement[][] {
  const o = LAYOUTS[size];
  const usableH = A4.heightMm - 2 * o.margin;
  const rowWidth = o.columns * o.itemWidth + (o.columns - 1) * o.gap;
  const left = (A4.widthMm - rowWidth) / 2;

  const pages: Placement[][] = [];
  let page: Placement[] = [];
  let y = o.margin;

  for (let i = 0; i < sizes.length; i += o.columns) {
    const row = sizes.slice(i, i + o.columns).map((s, j) => {
      let w = o.itemWidth;
      let h = (w * s.height) / s.width;
      if (h > usableH) {
        h = usableH;
        w = (h * s.width) / s.height;
      }
      return { index: i + j, w, h };
    });
    const rowH = Math.max(...row.map((r) => r.h));
    if (page.length > 0 && y + rowH > A4.heightMm - o.margin + 1e-6) {
      pages.push(page);
      page = [];
      y = o.margin;
    }
    // Centre a lone item in the last row.
    const used = row.reduce((s, r) => s + r.w, 0) + (row.length - 1) * o.gap;
    let x = row.length < o.columns ? (A4.widthMm - used) / 2 : left;
    for (const r of row) {
      const cellW = row.length < o.columns ? r.w : o.itemWidth;
      page.push({ image: r.index, x: x + (cellW - r.w) / 2, y: y + (rowH - r.h) / 2, w: r.w, h: r.h });
      x += cellW + o.gap;
    }
    y += rowH + o.gap;
  }
  if (page.length > 0) pages.push(page);
  return pages;
}

const enc = new TextEncoder();
const fmt = (n: number) => (Math.round(n * 1000) / 1000).toString();

/** Builds a PDF document. Images are referenced by index from placements. */
export function buildPdf(pages: Placement[][], images: PdfImage[]): Uint8Array {
  const chunks: Uint8Array[] = [];
  const offsets: number[] = [];
  let length = 0;
  const push = (data: string | Uint8Array) => {
    const bytes = typeof data === 'string' ? enc.encode(data) : data;
    chunks.push(bytes);
    length += bytes.length;
  };

  // Object numbering: 1 catalog, 2 pages, then images, then (page, content) pairs.
  const imageObj = (i: number) => 3 + i;
  const pageObj = (p: number) => 3 + images.length + p * 2;
  const contentObj = (p: number) => pageObj(p) + 1;
  const total = 2 + images.length + pages.length * 2;

  const startObj = (n: number) => {
    offsets[n] = length;
    push(`${n} 0 obj\n`);
  };

  push('%PDF-1.4\n');
  // Binary marker comment so tools treat the file as binary.
  push(new Uint8Array([0x25, 0xe2, 0xe3, 0xcf, 0xd3, 0x0a]));

  startObj(1);
  push('<< /Type /Catalog /Pages 2 0 R >>\nendobj\n');

  startObj(2);
  const kids = pages.map((_, p) => `${pageObj(p)} 0 R`).join(' ');
  push(`<< /Type /Pages /Kids [${kids}] /Count ${pages.length} >>\nendobj\n`);

  images.forEach((img, i) => {
    startObj(imageObj(i));
    push(
      `<< /Type /XObject /Subtype /Image /Width ${img.width} /Height ${img.height} ` +
        `/ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${img.jpeg.length} >>\nstream\n`,
    );
    push(img.jpeg);
    push('\nendstream\nendobj\n');
  });

  const pw = A4.widthMm * MM_TO_PT;
  const ph = A4.heightMm * MM_TO_PT;
  pages.forEach((placements, p) => {
    const used = [...new Set(placements.map((pl) => pl.image))];
    const xobjects = used.map((i) => `/Im${i} ${imageObj(i)} 0 R`).join(' ');
    startObj(pageObj(p));
    push(
      `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${fmt(pw)} ${fmt(ph)}] ` +
        `/Resources << /XObject << ${xobjects} >> >> /Contents ${contentObj(p)} 0 R >>\nendobj\n`,
    );
    const ops = placements
      .map((pl) => {
        const w = pl.w * MM_TO_PT;
        const h = pl.h * MM_TO_PT;
        const x = pl.x * MM_TO_PT;
        const y = ph - pl.y * MM_TO_PT - h;
        return `q ${fmt(w)} 0 0 ${fmt(h)} ${fmt(x)} ${fmt(y)} cm /Im${pl.image} Do Q`;
      })
      .join('\n');
    const stream = enc.encode(ops);
    startObj(contentObj(p));
    push(`<< /Length ${stream.length} >>\nstream\n`);
    push(stream);
    push('\nendstream\nendobj\n');
  });

  const xref = length;
  let table = `xref\n0 ${total + 1}\n0000000000 65535 f \n`;
  for (let n = 1; n <= total; n++) table += `${String(offsets[n]).padStart(10, '0')} 00000 n \n`;
  push(table);
  push(`trailer\n<< /Size ${total + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`);

  const out = new Uint8Array(length);
  let pos = 0;
  for (const c of chunks) {
    out.set(c, pos);
    pos += c.length;
  }
  return out;
}
