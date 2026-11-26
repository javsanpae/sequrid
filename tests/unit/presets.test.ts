import { describe, expect, it } from 'vitest';
import { DNI_ES, ZONE_KEYS, zoneDef, zonesForSide } from '../../src/lib/documents';
import { protectionSummary, selectionFor, usage, USAGES } from '../../src/lib/presets';

describe('DNI zone catalog', () => {
  it('has unique keys and rects inside the card', () => {
    expect(new Set(ZONE_KEYS).size).toBe(ZONE_KEYS.length);
    for (const z of DNI_ES.zones) {
      expect(z.rects.length).toBeGreaterThan(0);
      for (const r of z.rects) {
        expect(r.x).toBeGreaterThanOrEqual(0);
        expect(r.y).toBeGreaterThanOrEqual(0);
        expect(r.x + r.w).toBeLessThanOrEqual(1);
        expect(r.y + r.h).toBeLessThanOrEqual(1);
        expect(r.w).toBeGreaterThan(0);
        expect(r.h).toBeGreaterThan(0);
      }
    }
  });

  it('splits zones by side', () => {
    const front = zonesForSide('anverso').map((z) => z.key);
    const back = zonesForSide('reverso').map((z) => z.key);
    expect(front).toContain('can');
    expect(front).toContain('firma');
    expect(back).toEqual(['domicilio', 'lugar', 'padres', 'mrz']);
    expect(front.length + back.length).toBe(ZONE_KEYS.length);
  });

  it('finds zone definitions', () => {
    expect(zoneDef('can').label).toBe('Código CAN');
    expect(() => zoneDef('nope' as never)).toThrow();
  });

  it('has the ID-1 card size', () => {
    expect(DNI_ES.widthMm).toBeCloseTo(85.6);
    expect(DNI_ES.heightMm).toBeCloseTo(53.98);
  });
});

describe('usage presets', () => {
  it('only reference known zones', () => {
    for (const u of USAGES) for (const k of u.cover) expect(ZONE_KEYS).toContain(k);
  });

  it('always cover the CAN', () => {
    for (const u of USAGES) expect(u.cover).toContain('can');
  });

  it('cover more for riskier uses', () => {
    expect(usage('trabajo').cover.length).toBeGreaterThan(usage('alquiler').cover.length);
    expect(usage('banco').cover).toEqual(['can']);
    expect(usage('hotel').cover).not.toContain('soporte');
    expect(usage('hotel').cover).not.toContain('domicilio');
  });

  it('builds the checkbox selection from the recommendation', () => {
    const sel = selectionFor('alquiler');
    expect(Object.keys(sel).sort()).toEqual([...ZONE_KEYS].sort());
    expect(sel.can).toBe(true);
    expect(sel.nombre).toBe(false);
    expect(sel.numero).toBe(false);
    expect(selectionFor('trabajo').numero).toBe(true);
  });
});

describe('protectionSummary', () => {
  const auto = { manual: false, manualZones: 0, watermark: true };

  it('is high when following the recommendation with a watermark', () => {
    const s = protectionSummary('otro', selectionFor('otro'), auto);
    expect(s.covered).toBe(s.total);
    expect(s.score).toBe(1);
    expect(s.level).toBe('alta');
    expect(s.message).toContain(`${s.total} de ${s.total}`);
  });

  it('drops without watermark or with fields uncovered', () => {
    const sel = selectionFor('otro');
    expect(protectionSummary('otro', sel, { ...auto, watermark: false }).level).toBe('media');
    sel.can = false;
    sel.firma = false;
    sel.mrz = false;
    sel.padres = false;
    const s = protectionSummary('otro', sel, { ...auto, watermark: false });
    expect(s.level).toBe('baja');
    expect(s.message).toContain('Sin marca de agua');
  });

  it('describes manual mode', () => {
    const s = protectionSummary('otro', selectionFor('otro'), { manual: true, manualZones: 3, watermark: true });
    expect(s.message).toContain('3 zonas dibujadas');
    expect(s.level).toBe('media');
    expect(protectionSummary('otro', selectionFor('otro'), { manual: true, manualZones: 0, watermark: false }).level).toBe('baja');
  });
});
