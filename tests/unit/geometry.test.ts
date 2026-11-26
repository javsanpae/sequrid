import { describe, expect, it } from 'vitest';
import {
  clampRect,
  fitSize,
  moveRect,
  nextRotation,
  rectFromPoints,
  resizeRect,
  rotatedSize,
  toPixels,
} from '../../src/lib/geometry';

describe('geometry', () => {
  it('builds rects from points in any order', () => {
    expect(rectFromPoints(0.5, 0.6, 0.2, 0.1)).toEqual({ x: 0.2, y: 0.1, w: 0.3, h: 0.5 });
  });

  it('keeps rects inside the unit square', () => {
    expect(clampRect({ x: 0.9, y: -0.2, w: 0.3, h: 0.5 })).toEqual({ x: 0.7, y: 0, w: 0.3, h: 0.5 });
    expect(clampRect({ x: 0, y: 0, w: 2, h: 0 }, 0.01)).toEqual({ x: 0, y: 0, w: 1, h: 0.01 });
  });

  it('moves without leaving the canvas or resizing', () => {
    const r = { x: 0.1, y: 0.1, w: 0.2, h: 0.2 };
    expect(moveRect(r, 0.5, 0.1)).toEqual({ x: 0.6, y: 0.2, w: 0.2, h: 0.2 });
    expect(moveRect(r, 5, -5)).toEqual({ x: 0.8, y: 0, w: 0.2, h: 0.2 });
  });

  it('resizes from each handle and respects the minimum size', () => {
    const r = { x: 0.2, y: 0.2, w: 0.4, h: 0.4 };
    expect(resizeRect(r, 'se', 0.1, 0.1)).toEqual({ x: 0.2, y: 0.2, w: 0.5, h: 0.5 });
    const nw = resizeRect(r, 'nw', -0.1, -0.1);
    expect(nw.x).toBeCloseTo(0.1);
    expect(nw.w).toBeCloseTo(0.5);
    const e = resizeRect(r, 'e', -1, 0, 0.05);
    expect(e.w).toBeCloseTo(0.05);
    expect(e.x).toBeCloseTo(0.2);
    expect(resizeRect(r, 'n', 0, -1).y).toBe(0);
  });

  it('converts to pixels covering every touched pixel', () => {
    expect(toPixels({ x: 0.1, y: 0.25, w: 0.3, h: 0.5 }, 100, 40)).toEqual({ x: 10, y: 10, w: 30, h: 20 });
    expect(toPixels({ x: 0.333, y: 0, w: 0.333, h: 1 }, 10, 10)).toEqual({ x: 3, y: 0, w: 4, h: 10 });
  });

  it('handles rotations', () => {
    expect(rotatedSize(400, 300, 90)).toEqual({ width: 300, height: 400 });
    expect(rotatedSize(400, 300, 180)).toEqual({ width: 400, height: 300 });
    expect(nextRotation(270)).toBe(0);
    expect(nextRotation(0)).toBe(90);
  });

  it('fits sizes keeping aspect ratio', () => {
    expect(fitSize(2000, 1000, 500, 500)).toEqual({ width: 500, height: 250 });
    expect(fitSize(100, 50, 500, 500)).toEqual({ width: 100, height: 50 });
    expect(fitSize(100, 50, 500, 500, true)).toEqual({ width: 500, height: 250 });
  });
});
