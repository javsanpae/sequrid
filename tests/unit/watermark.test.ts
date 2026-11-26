import { describe, expect, it } from 'vitest';
import { composeWatermark, formatDate, todayIso, watermarkLayout } from '../../src/lib/watermark';

describe('watermark text', () => {
  it('formats ISO dates the Spanish way', () => {
    expect(formatDate('2026-11-26')).toBe('26/11/2026');
    expect(formatDate('26/11/2026')).toBe('');
    expect(formatDate('')).toBe('');
  });

  it('gives today in local time', () => {
    expect(todayIso(new Date(2026, 0, 5, 23, 59))).toBe('2026-01-05');
  });

  it('joins use, recipient and date in uppercase', () => {
    expect(composeWatermark('Solo para alquiler', 'Inmobiliaria Sol', '2026-11-26')).toBe(
      'SOLO PARA ALQUILER · INMOBILIARIA SOL · 26/11/2026',
    );
  });

  it('skips empty parts and collapses whitespace', () => {
    expect(composeWatermark('Copia de uso limitado', '   ', '')).toBe('COPIA DE USO LIMITADO');
    expect(composeWatermark('Solo  para   hotel', ' Hotel  Mar ', '2026-01-02')).toBe('SOLO PARA HOTEL · HOTEL MAR · 02/01/2026');
  });

  it('uses the custom text when given', () => {
    expect(composeWatermark('Solo para alquiler', 'X', '2026-11-26', '  solo para ñoño ')).toBe('SOLO PARA ÑOÑO');
  });
});

describe('watermarkLayout', () => {
  it('grows with the size setting', () => {
    const small = watermarkLayout(1000, 630, 0);
    const big = watermarkLayout(1000, 630, 1);
    expect(big.fontSize).toBeGreaterThan(small.fontSize);
    expect(big.lineGap).toBeGreaterThan(big.fontSize);
  });

  it('scales with the canvas so preview and export match', () => {
    const a = watermarkLayout(500, 315, 0.5);
    const b = watermarkLayout(2000, 1260, 0.5);
    expect(b.fontSize / a.fontSize).toBeCloseTo(4, 0);
  });

  it('has enough rows to cover the whole diagonal', () => {
    const w = 1200;
    const h = 760;
    const l = watermarkLayout(w, h, 0.4);
    const half = Math.hypot(w, h) / 2;
    expect(l.rows[0]).toBeLessThanOrEqual(-half);
    expect(l.rows[l.rows.length - 1]).toBeGreaterThanOrEqual(half - l.lineGap);
    expect(l.halfSpan).toBeGreaterThanOrEqual(half);
    expect(l.angle).toBeLessThan(0);
  });
});
