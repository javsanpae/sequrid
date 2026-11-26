import { describe, expect, it } from 'vitest';
import {
  CNI_FR,
  DNI_ES,
  DOCUMENTS,
  documentKeys,
  documentType,
  ZONE_KEYS,
  zoneDef,
  zoneSides,
  zonesForSide,
} from '../../src/lib/documents';
import { en } from '../../src/lib/i18n/en';
import { es } from '../../src/lib/i18n/es';
import { fr } from '../../src/lib/i18n/fr';
import { protectionMessage, protectionSummary, selectionFor, usage, USAGES } from '../../src/lib/presets';

describe.each(DOCUMENTS.map((d) => [d.id, d] as const))('%s zone catalog', (_, doc) => {
  it('has unique known keys and rects inside the card', () => {
    const keys = documentKeys(doc);
    expect(new Set(keys).size).toBe(keys.length);
    for (const z of doc.zones) {
      expect(ZONE_KEYS).toContain(z.key);
      expect(z.rects.length).toBeGreaterThan(0);
      for (const r of z.rects) {
        expect(['front', 'back']).toContain(r.side);
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
    expect(zonesForSide('front', doc).length).toBeGreaterThan(0);
    expect(zonesForSide('back', doc).length).toBeGreaterThan(0);
    expect(doc.widthMm).toBeCloseTo(85.6);
    expect(doc.heightMm).toBeCloseTo(53.98);
  });

  it('always lets you cover the riskiest data', () => {
    for (const k of ['number', 'birthDate', 'signature', 'can', 'mrz', 'photo'] as const) expect(zoneDef(k, doc)).toBeDefined();
  });
});

describe('documents', () => {
  it('keeps the Spanish DNI layout', () => {
    expect(zonesForSide('back', DNI_ES).map((z) => z.key)).toEqual(['address', 'birthPlace', 'parents', 'mrz']);
    expect(zoneDef('seal', DNI_ES)).toBeUndefined();
  });

  it('describes the French card', () => {
    expect(documentType('cni-fr')).toBe(CNI_FR);
    expect(CNI_FR.short).toBe('CNI');
    // Place of birth is on the front of the French card, unlike the DNI.
    expect(zoneSides(zoneDef('birthPlace', CNI_FR)!)).toEqual(['front']);
    expect(zoneSides(zoneDef('photo', CNI_FR)!)).toEqual(['front', 'back']);
    expect(zoneSides(zoneDef('seal', CNI_FR)!)).toEqual(['back']);
    expect(zoneDef('parents', CNI_FR)).toBeUndefined();
  });

  it('rejects unknown documents', () => {
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
    expect(usage('job').cover.length).toBeGreaterThan(usage('rental').cover.length);
    expect(usage('bank').cover).toEqual(['can']);
    expect(usage('hotel').cover).not.toContain('serial');
    expect(usage('hotel').cover).not.toContain('address');
    expect(() => usage('xx' as never)).toThrow();
  });

  it('builds the checkbox selection from the recommendation', () => {
    const sel = selectionFor('rental');
    expect(Object.keys(sel).sort()).toEqual([...ZONE_KEYS].sort());
    expect(sel.can).toBe(true);
    expect(sel.name).toBe(false);
    expect(sel.number).toBe(false);
    expect(selectionFor('job').number).toBe(true);
  });
});

describe('protectionSummary', () => {
  const auto = { manual: false, manualZones: 0, watermark: true };

  it('only counts recommendations that exist on the documents in use', () => {
    const esDoc = protectionSummary('other', selectionFor('other'), { ...auto, available: documentKeys(DNI_ES) });
    const frDoc = protectionSummary('other', selectionFor('other'), { ...auto, available: documentKeys(CNI_FR) });
    expect(esDoc.total).toBe(7);
    expect(frDoc.total).toBe(8);
    expect(frDoc.level).toBe('high');
    const both = protectionSummary('other', selectionFor('other'), {
      ...auto,
      available: [...new Set([...documentKeys(DNI_ES), ...documentKeys(CNI_FR)])],
    });
    expect(both.total).toBe(9);
  });

  it('is high when following the recommendation with a watermark', () => {
    const s = protectionSummary('other', selectionFor('other'), auto);
    expect(s.covered).toBe(s.total);
    expect(s.score).toBe(1);
    expect(s.level).toBe('high');
    expect(protectionMessage(s, en)).toBe(`You have covered ${s.total} of ${s.total} recommended details for any use.`);
    expect(protectionMessage(s, es)).toContain(`${s.total} de ${s.total} datos recomendados para cualquier uso`);
    expect(protectionMessage(s, fr)).toContain(`${s.total} sur ${s.total}`);
  });

  it('drops without watermark or with fields uncovered', () => {
    const sel = selectionFor('other');
    expect(protectionSummary('other', sel, { ...auto, watermark: false }).level).toBe('medium');
    sel.can = false;
    sel.signature = false;
    sel.mrz = false;
    sel.parents = false;
    const s = protectionSummary('other', sel, { ...auto, watermark: false });
    expect(s.level).toBe('low');
    expect(protectionMessage(s, en)).toContain('Without a watermark');
    expect(protectionMessage(s, es)).toContain('Sin marca de agua');
  });

  it('describes manual mode', () => {
    const s = protectionSummary('other', selectionFor('other'), { manual: true, manualZones: 3, watermark: true });
    expect(s.level).toBe('medium');
    expect(protectionMessage(s, en)).toContain('3 zones drawn');
    expect(protectionMessage(s, es)).toContain('3 zonas dibujadas');
    const one = protectionSummary('other', selectionFor('other'), { manual: true, manualZones: 1, watermark: false });
    expect(one.level).toBe('low');
    expect(protectionMessage(one, en)).toMatch(/1 zone drawn\..*Add the watermark\.$/);
    expect(protectionMessage(one, fr)).toContain('1 zone dessinée');
  });
});
