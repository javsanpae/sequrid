import { describe, expect, it } from 'vitest';
import { DOCUMENTS } from '../../src/lib/documents';
import { HELP_LINES, sortHelpLines } from '../../src/lib/help-lines';

const names: Record<string, string> = { ES: 'Spain', FR: 'France', IT: 'Italy' };
const name = (code: string) => names[code] ?? code;

describe('help lines', () => {
  it('cover every country with a supported document', () => {
    const countries = new Set(HELP_LINES.map((l) => l.country));
    for (const doc of DOCUMENTS) expect(countries.has(doc.country), doc.country).toBe(true);
  });

  it('have unique ids, official https sources and usable links', () => {
    expect(new Set(HELP_LINES.map((l) => l.id)).size).toBe(HELP_LINES.length);
    for (const line of HELP_LINES) {
      expect(line.source).toMatch(/^https:\/\//);
      expect(line.contacts.length).toBeGreaterThan(0);
      expect(line.emergency.length).toBeGreaterThan(0);
      for (const n of line.emergency) expect(n).toMatch(/^\d{2,4}$/);
      for (const c of line.contacts) {
        if (c.kind === 'phone') expect(c.href).toBe(`tel:${c.value.replace(/\s/g, '')}`);
        else expect(c.href).toMatch(/^https:\/\//);
      }
    }
  });

  it('keep the verified Spanish helpline', () => {
    const incibe = HELP_LINES.find((l) => l.id === 'es-incibe')!;
    expect(incibe.contacts.find((c) => c.kind === 'phone')).toMatchObject({ value: '017', free: true });
  });

  it('sort the countries in use first, then by name', () => {
    expect(sortHelpLines(HELP_LINES, [], name).map((l) => l.country)).toEqual(['FR', 'IT', 'ES']);
    expect(sortHelpLines(HELP_LINES, ['IT'], name).map((l) => l.country)).toEqual(['IT', 'FR', 'ES']);
    expect(sortHelpLines(HELP_LINES, ['ES', 'FR'], name).map((l) => l.country)).toEqual(['ES', 'FR', 'IT']);
  });
});
