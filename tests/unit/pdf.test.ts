import { describe, expect, it } from 'vitest';
import { A4, buildPdf, layoutPages, MM_TO_PT } from '../../src/lib/pdf';

const card = { width: 1712, height: 1080 };
const dec = new TextDecoder('latin1');

describe('layoutPages', () => {
  it('places one DNI at real size, front and back side by side', () => {
    const pages = layoutPages([card, card], 'real');
    expect(pages).toHaveLength(1);
    const [a, b] = pages[0];
    expect(a.w).toBeCloseTo(85.6);
    expect(a.h).toBeCloseTo(85.6 * (1080 / 1712));
    expect(a.y).toBe(b.y);
    expect(b.x).toBeGreaterThan(a.x + a.w);
    // Centred horizontally.
    expect(a.x).toBeCloseTo(A4.widthMm - (b.x + b.w));
  });

  it('puts two DNI in two rows of the same page', () => {
    const pages = layoutPages([card, card, card, card], 'real');
    expect(pages).toHaveLength(1);
    expect(pages[0][2].y).toBeGreaterThan(pages[0][0].y + pages[0][0].h);
  });

  it('centres a lone face', () => {
    const [[p]] = layoutPages([card], 'real');
    expect(p.x + p.w / 2).toBeCloseTo(A4.widthMm / 2);
  });

  it('paginates the enlarged layout', () => {
    const pages = layoutPages([card, card, card, card], 'large');
    expect(pages).toHaveLength(2);
    for (const page of pages) {
      expect(page).toHaveLength(2);
      for (const p of page) {
        expect(p.w).toBeCloseTo(170);
        expect(p.y + p.h).toBeLessThanOrEqual(A4.heightMm);
      }
    }
  });

  it('shrinks images taller than the page', () => {
    const [[p]] = layoutPages([{ width: 100, height: 1000 }], 'large');
    expect(p.h).toBeLessThanOrEqual(A4.heightMm - 40 + 1e-9);
    expect(p.w / p.h).toBeCloseTo(0.1);
  });
});

describe('buildPdf', () => {
  const jpeg = new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 1, 2, 3, 0xff, 0xd9]);
  const images = [
    { jpeg, width: 1712, height: 1080 },
    { jpeg, width: 1712, height: 1080 },
  ];

  it('writes a structurally valid PDF', () => {
    const bytes = buildPdf(layoutPages([card, card], 'real'), images);
    const text = dec.decode(bytes);
    expect(text.startsWith('%PDF-1.4\n')).toBe(true);
    expect(text.trimEnd().endsWith('%%EOF')).toBe(true);
    expect(text).toContain('/Type /Catalog');
    expect(text).toContain('/Count 1');
    expect(text.match(/\/Subtype \/Image/g)).toHaveLength(2);
    expect(text).toContain('/Filter /DCTDecode');

    // Every xref offset must point at the start of its object.
    const startxref = Number(/startxref\n(\d+)/.exec(text)![1]);
    expect(text.slice(startxref, startxref + 4)).toBe('xref');
    const entries = text.slice(startxref).split('\n').slice(3).filter((l) => / n $/.test(l));
    entries.forEach((line, i) => {
      const offset = Number(line.slice(0, 10));
      expect(text.slice(offset, offset + `${i + 1} 0 obj`.length)).toBe(`${i + 1} 0 obj`);
    });
  });

  it('embeds the JPEG bytes untouched', () => {
    const bytes = buildPdf([[{ image: 0, x: 0, y: 0, w: 10, h: 10 }]], [images[0]]);
    const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
    expect(hex).toContain('ffd8ffe0010203ffd9');
  });

  it('uses A4 and draws at the real size in points', () => {
    const text = dec.decode(buildPdf(layoutPages([card], 'real'), [images[0]]));
    expect(text).toContain('/MediaBox [0 0 595.276 841.89]');
    const w = (85.6 * MM_TO_PT).toFixed(3).replace(/0+$/, '');
    expect(text).toContain(`q ${w} 0 0`);
  });

  it('writes several pages and no metadata', () => {
    const text = dec.decode(buildPdf(layoutPages([card, card, card, card], 'large'), [...images, ...images]));
    expect(text).toContain('/Count 2');
    expect(text).not.toContain('/Info');
    expect(text).not.toContain('/Producer');
  });
});
