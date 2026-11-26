import { describe, expect, it } from 'vitest';
import { DOCUMENTS, documentKeys, DNI_ES, CNI_FR, CIE_IT, ZONE_KEYS } from '../../src/lib/documents';
import { en } from '../../src/lib/i18n/en';
import {
  browserLang,
  DEFAULT_LANG,
  detectLang,
  DICTIONARIES,
  isLang,
  LANGUAGES,
  preferenceFor,
  type Lang,
} from '../../src/lib/i18n/lang';
import { downloadBase, faceFileName, faceTitle, zoneLabel, zoneText } from '../../src/lib/i18n/text';
import { USAGES } from '../../src/lib/presets';

/** Every leaf path with its kind, e.g. "status.loadedOne: function" or "info.faq.items: array(10)". */
function shape(value: unknown, path = ''): string[] {
  if (typeof value === 'function') return [`${path}: function`];
  if (typeof value === 'string') return [`${path}: string`];
  if (Array.isArray(value)) return [`${path}: array(${value.length})`, ...value.flatMap((v, i) => shape(v, `${path}[${i}]`))];
  if (value && typeof value === 'object') {
    return Object.keys(value)
      .sort()
      .flatMap((k) => shape((value as Record<string, unknown>)[k], path ? `${path}.${k}` : k));
  }
  return [`${path}: ${typeof value}`];
}

/** All strings, including those returned by functions called with sample arguments. */
function strings(value: unknown): string[] {
  if (typeof value === 'string') return [value];
  if (typeof value === 'function') return [String(value(1, 2, 'x'))];
  if (Array.isArray(value)) return value.flatMap(strings);
  if (value && typeof value === 'object') return Object.values(value).flatMap(strings);
  return [];
}

const others = LANGUAGES.map((l) => l.code).filter((c) => c !== 'en');

describe('dictionaries', () => {
  it('offer English, Spanish, French and Italian with native names', () => {
    expect(LANGUAGES).toEqual([
      { code: 'en', name: 'English' },
      { code: 'es', name: 'Español' },
      { code: 'fr', name: 'Français' },
      { code: 'it', name: 'Italiano' },
    ]);
    expect(DICTIONARIES.en).toBe(en);
    expect(Object.keys(DICTIONARIES).sort()).toEqual(LANGUAGES.map((l) => l.code).sort());
  });

  it.each(others)('%s has exactly the same keys as en, and functions stay functions', (lang) => {
    expect(shape(DICTIONARIES[lang])).toEqual(shape(en));
  });

  it.each(LANGUAGES.map((l) => l.code))('%s has no empty texts', (lang) => {
    for (const s of strings(DICTIONARIES[lang])) expect(s.trim()).not.toBe('');
  });

  it.each(LANGUAGES.map((l) => l.code))('%s names every field, document zone and usage', (lang) => {
    const t = DICTIONARIES[lang];
    expect(Object.keys(t.fields).sort()).toEqual([...ZONE_KEYS].sort());
    for (const doc of DOCUMENTS) expect(Object.keys(t.documents[doc.id].zones).sort()).toEqual(documentKeys(doc).sort());
    expect(Object.keys(t.usages).sort()).toEqual(USAGES.map((u) => u.id).sort());
  });

  it.each(LANGUAGES.map((l) => l.code))('%s uses lowercase ASCII words in file names', (lang) => {
    const { files } = DICTIONARIES[lang];
    for (const word of [files.protected, files.document, files.sides.front, files.sides.back]) expect(word).toMatch(/^[a-z]+$/);
  });

  it('French uses no-break spaces before double punctuation', () => {
    for (const s of strings(DICTIONARIES.fr)) {
      expect(s, s).not.toMatch(/ [?!:;»]/);
      expect(s, s).not.toMatch(/« /);
      expect(s, s).not.toMatch(/\d %/);
    }
  });

  it('Italian puts no space before punctuation and uses curly quotes', () => {
    for (const s of strings(DICTIONARIES.it).map((s) => s.replace(/`[^`]*`/g, ''))) {
      expect(s, s).not.toMatch(/\s[?!:;]/);
      expect(s, s).not.toMatch(/[«»"]/);
      expect(s, s).not.toMatch(/\d\s%/);
    }
  });

  it.each(LANGUAGES.map((l) => l.code))('%s uses typographic apostrophes in words', (lang) => {
    // Straight quotes are only allowed in code (`connect-src 'none'`).
    for (const s of strings(DICTIONARIES[lang])) expect(s.replace(/`[^`]*`/g, ''), s).not.toMatch(/\p{L}'\p{L}/u);
  });
});

describe('detectLang', () => {
  it('prefers a valid saved choice', () => {
    expect(detectLang('es', ['fr-FR', 'en'])).toBe('es');
    expect(detectLang('de', ['fr-FR'])).toBe('fr');
    expect(detectLang('', [])).toBe(DEFAULT_LANG);
  });

  it('picks the first supported browser language by prefix', () => {
    expect(detectLang(null, ['fr-CA', 'en'])).toBe('fr');
    expect(detectLang(null, ['it-IT'])).toBe('it');
    expect(detectLang(null, ['it-CH', 'fr'])).toBe('it');
    expect(detectLang(null, ['de-CH', 'it_ch', 'fr-CH'])).toBe('it');
    expect(detectLang('it', ['es-ES'])).toBe('it');
    expect(detectLang(null, ['de-DE', 'es-419', 'en'])).toBe('es');
    expect(detectLang(undefined, ['EN_gb'])).toBe('en');
  });

  it('falls back to English', () => {
    expect(detectLang(null, ['de-DE', 'pt-BR'])).toBe('en');
    expect(detectLang(null)).toBe('en');
  });

  it('validates codes', () => {
    expect(isLang('fr')).toBe(true);
    expect(isLang('it')).toBe(true);
    expect(isLang('IT')).toBe(false);
    expect(isLang('fr-FR')).toBe(false);
    expect(isLang(undefined)).toBe(false);
  });
});

describe('browserLang', () => {
  it('maps browser tags to a supported language', () => {
    expect(browserLang(['it-IT'])).toBe('it');
    expect(browserLang([' IT-ch ', 'en'])).toBe('it');
    expect(browserLang(['pt-PT', 'it'])).toBe('it');
    expect(browserLang([])).toBe(DEFAULT_LANG);
  });
});

describe('preferenceFor', () => {
  it('remembers nothing for "auto" or the browser language', () => {
    expect(preferenceFor('auto', ['it-IT'])).toBeNull();
    expect(preferenceFor('it', ['it-IT', 'en'])).toBeNull();
    expect(preferenceFor('en', ['de-DE'])).toBeNull();
    expect(preferenceFor('en')).toBeNull();
  });

  it('remembers any other language', () => {
    expect(preferenceFor('it', ['es-ES'])).toBe('it');
    expect(preferenceFor('es', ['it-IT'])).toBe('es');
    expect(preferenceFor('fr')).toBe('fr');
  });
});

describe('text helpers', () => {
  const { es, fr } = DICTIONARIES as Record<Lang, typeof en>;
  const italian = DICTIONARIES.it;

  it('labels zones per document, falling back to generic names', () => {
    expect(zoneLabel(en, 'number', DNI_ES)).toBe('DNI number');
    expect(zoneLabel(es, 'number', DNI_ES)).toBe('Número de DNI');
    expect(zoneLabel(fr, 'number', CNI_FR)).toBe('Numéro du document');
    expect(zoneLabel(italian, 'taxCode', CIE_IT)).toBe('Codice fiscale (e relativo codice a barre)');
    expect(zoneLabel(italian, 'seal', CIE_IT)).toBe(italian.fields.seal);
    expect(zoneLabel(en, 'seal', DNI_ES)).toBe(en.fields.seal);
    expect(zoneText(es, 'seal')).toEqual({ label: 'Código 2D-Doc', hint: '' });
  });

  it('names faces with the localized side', () => {
    expect(faceTitle(en, DNI_ES, 1, 'front')).toBe('DNI 1 · Front');
    expect(faceTitle(es, DNI_ES, 2, 'back')).toBe('DNI 2 · Reverso');
    expect(faceTitle(fr, CNI_FR, 1, 'back')).toBe('CNI 1 · Verso');
    expect(faceTitle(italian, CIE_IT, 1, 'front')).toBe('CIE 1 · Fronte');
  });

  it('builds localized download names', () => {
    expect(downloadBase(en, [DNI_ES])).toBe('dni-protected');
    expect(downloadBase(es, [DNI_ES])).toBe('dni-protegido');
    expect(downloadBase(fr, [DNI_ES])).toBe('dni-protege');
    expect(downloadBase(en, [DNI_ES, CNI_FR])).toBe('document-protected');
    expect(downloadBase(es, [DNI_ES, CNI_FR])).toBe('documento-protegido');
    expect(faceFileName(en, [DNI_ES], DNI_ES, 1, 'front')).toBe('dni-protected-dni1-front');
    expect(faceFileName(es, [DNI_ES], DNI_ES, 1, 'front')).toBe('dni-protegido-dni1-anverso');
    expect(faceFileName(fr, [CNI_FR], CNI_FR, 2, 'back')).toBe('cni-protege-cni2-verso');
    expect(downloadBase(italian, [CIE_IT, DNI_ES])).toBe('documento-protetto');
    expect(faceFileName(italian, [CIE_IT], CIE_IT, 1, 'back')).toBe('cie-protetto-cie1-retro');
  });
});
