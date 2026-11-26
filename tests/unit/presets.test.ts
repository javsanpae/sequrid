import { describe, expect, it } from 'vitest';
import {
  CNI_FR,
  DNI_ES,
  DOCUMENTS,
  documentKeys,
  documentType,
  KEY_LABELS,
  ZONE_KEYS,
  zoneDef,
  zoneLabel,
  zoneSides,
  zonesForSide,
} from '../../src/lib/documents';
import { protectionSummary, selectionFor, usage, USAGES } from '../../src/lib/presets';

describe.each(DOCUMENTS.map((d) => [d.id, d] as const))('%s zone catalog', (_, doc) => {
  it('has unique known keys and rects inside the card', () => {
    const keys = documentKeys(doc);
    expect(new Set(keys).size).toBe(keys.length);
    for (const z of doc.zones) {
      expect(ZONE_KEYS).toContain(z.key);
      expect(z.label).not.toBe('');
      expect(z.hint).not.toBe('');
      expect(z.rects.length).toBeGreaterThan(0);
      for (const r of z.rects) {
        expect(['anverso', 'reverso']).toContain(r.side);
        expect(r.x).toBeGreaterThanOrEqual(0);
        expect(r.y).toBeGreaterThanOrEqual(0);
        expect(r.x + r.w).toBeLessThanOrEqual(1);
        expect(r.y + r.h).toBeLessThanOrEqual(1);
        expect(r.w).toBeGreaterThan(0);
        expect(r.h).toBeGreaterThan(0);
      }
    }
  });

  it('has zones on both sides and the ID-1 card size', () => {
    expect(zonesForSide('anverso', doc).length).toBeGreaterThan(0);
    expect(zonesForSide('reverso', doc).length).toBeGreaterThan(0);
    expect(doc.widthMm).toBeCloseTo(85.6);
    expect(doc.heightMm).toBeCloseTo(53.98);
  });

  it('always lets you cover the riskiest data', () => {
    for (const k of ['numero', 'nacimiento', 'firma', 'can', 'mrz', 'foto'] as const) expect(zoneDef(k, doc)).toBeDefined();
  });
});

describe('documents', () => {
  it('names every key', () => {
    expect(Object.keys(KEY_LABELS).sort()).toEqual([...ZONE_KEYS].sort());
  });

  it('keeps the Spanish DNI layout', () => {
    expect(zonesForSide('reverso', DNI_ES).map((z) => z.key)).toEqual(['domicilio', 'lugar', 'padres', 'mrz']);
    expect(zoneDef('sello', DNI_ES)).toBeUndefined();
    expect(zoneLabel('numero', DNI_ES)).toBe('Número de DNI');
  });

  it('describes the French card', () => {
    expect(documentType('cni-fr')).toBe(CNI_FR);
    expect(CNI_FR.short).toBe('CNI');
    // Place of birth is on the front of the French card, unlike the DNI.
    expect(zoneSides(zoneDef('lugar', CNI_FR)!)).toEqual(['anverso']);
    expect(zoneSides(zoneDef('foto', CNI_FR)!)).toEqual(['anverso', 'reverso']);
    expect(zoneSides(zoneDef('sello', CNI_FR)!)).toEqual(['reverso']);
    expect(zoneDef('padres', CNI_FR)).toBeUndefined();
  });

  it('falls back to generic labels', () => {
    expect(zoneLabel('sello', DNI_ES)).toBe(KEY_LABELS.sello);
    expect(zoneLabel('sello')).toBe('Código 2D-Doc');
    expect(() => documentType('xx' as never)).toThrow();
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

  it('only counts recommendations that exist on the documents in use', () => {
    const es = protectionSummary('otro', selectionFor('otro'), { ...auto, available: documentKeys(DNI_ES) });
    const fr = protectionSummary('otro', selectionFor('otro'), { ...auto, available: documentKeys(CNI_FR) });
    expect(es.total).toBe(7);
    expect(fr.total).toBe(8);
    expect(fr.level).toBe('alta');
    const both = protectionSummary('otro', selectionFor('otro'), {
      ...auto,
      available: [...new Set([...documentKeys(DNI_ES), ...documentKeys(CNI_FR)])],
    });
    expect(both.total).toBe(9);
  });

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
