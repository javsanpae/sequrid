import { describe, expect, it } from 'vitest';
import { boxBlur, coverBuffer, coverStrength, grayscale, pixelate, type PixelBuffer } from '../../src/lib/effects';

function buffer(width: number, height: number, fill: (x: number, y: number) => [number, number, number]): PixelBuffer {
  const data = new Uint8ClampedArray(width * height * 4);
  for (let y = 0; y < height; y++)
    for (let x = 0; x < width; x++) {
      const [r, g, b] = fill(x, y);
      const i = (y * width + x) * 4;
      data.set([r, g, b, 255], i);
    }
  return { data, width, height };
}

const px = (img: PixelBuffer, x: number, y: number) => Array.from(img.data.slice((y * img.width + x) * 4, (y * img.width + x) * 4 + 4));

/** Number of distinct colours: a proxy for how much detail is left. */
const distinct = (img: PixelBuffer) => {
  const s = new Set<string>();
  for (let i = 0; i < img.data.length; i += 4) s.add(`${img.data[i]},${img.data[i + 1]},${img.data[i + 2]}`);
  return s.size;
};

/** Checkerboard of 1px black/white: the worst case for hiding detail. */
const checker = (w: number, h: number) => buffer(w, h, (x, y) => ((x + y) % 2 ? [255, 255, 255] : [0, 0, 0]));

describe('pixelate', () => {
  it('averages each block', () => {
    const img = checker(4, 4);
    pixelate(img, 2);
    expect(px(img, 0, 0)).toEqual([128, 128, 128, 255]);
    expect(distinct(img)).toBe(1);
  });

  it('handles partial blocks at the edges', () => {
    const img = buffer(5, 3, (x) => (x < 4 ? [0, 0, 0] : [200, 100, 50]));
    pixelate(img, 4);
    expect(px(img, 4, 2)).toEqual([200, 100, 50, 255]);
    expect(px(img, 0, 0)).toEqual([0, 0, 0, 255]);
  });
});

describe('boxBlur', () => {
  it('keeps flat images unchanged', () => {
    const img = buffer(6, 6, () => [10, 20, 30]);
    boxBlur(img, 2);
    expect(px(img, 3, 3)).toEqual([10, 20, 30, 255]);
  });

  it('smooths sharp edges', () => {
    const img = buffer(20, 1, (x) => (x < 10 ? [0, 0, 0] : [255, 255, 255]));
    boxBlur(img, 3);
    const mid = px(img, 9, 0)[0];
    expect(mid).toBeGreaterThan(40);
    expect(mid).toBeLessThan(215);
  });

  it('ignores empty buffers', () => {
    const img = { data: new Uint8ClampedArray(0), width: 0, height: 0 };
    expect(() => boxBlur(img, 2)).not.toThrow();
  });
});

describe('grayscale', () => {
  it('uses luma weights', () => {
    const img = buffer(1, 1, () => [255, 0, 0]);
    grayscale(img);
    expect(px(img, 0, 0)).toEqual([76, 76, 76, 255]);
  });
});

describe('coverBuffer', () => {
  it('uses strong blocks relative to the zone size', () => {
    expect(coverStrength(300, 60).block).toBe(24);
    expect(coverStrength(10, 10).block).toBe(4);
  });

  it('leaves almost no detail when pixelating', () => {
    const img = buffer(120, 40, (x, y) => [(x * 37 + y * 11) % 256, (x * 13) % 256, (y * 29) % 256]);
    const before = distinct(img);
    coverBuffer(img, 'pixelate');
    const blocks = Math.ceil(120 / 16) * Math.ceil(40 / 16);
    expect(distinct(img)).toBeLessThanOrEqual(blocks);
    expect(distinct(img)).toBeLessThan(before / 20);
  });

  it('blurs a checkerboard into a near-flat grey', () => {
    const img = checker(60, 30);
    coverBuffer(img, 'blur');
    for (const [x, y] of [
      [5, 5],
      [30, 15],
      [55, 25],
    ]) {
      const [r] = px(img, x, y);
      expect(r).toBeGreaterThan(100);
      expect(r).toBeLessThan(155);
    }
  });
});
