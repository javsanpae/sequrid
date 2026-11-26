import { describe, expect, it } from 'vitest';
import { countryName, nativeCountryName, nativeLanguage } from '../../src/lib/countries';
import {
  documentCountryName,
  groupByCountry,
  normalizeText,
  searchDocuments,
  words,
  type CatalogText,
  type CountryGroup,
} from '../../src/lib/document-search';
import { CNI_FR, compareModels, DNI_ES, DOCUMENTS, isCurrent, type DocumentInfo } from '../../src/lib/documents';
import { DICTIONARIES } from '../../src/lib/i18n/lang';
import { modelYears } from '../../src/lib/i18n/text';

const ids = (groups: CountryGroup[]) => groups.flatMap((g) => g.documents.map((d) => d.id));
const countries = (groups: CountryGroup[]) => groups.map((g) => g.country);
const search = (query: string, lang: 'en' | 'es' | 'fr' = 'en') => searchDocuments(query, DOCUMENTS, lang);

describe('document metadata', () => {
  it('describes the supported models', () => {
    expect(DNI_ES).toMatchObject({ country: 'ES', short: 'DNI', issuedFrom: 2021 });
    expect(CNI_FR).toMatchObject({ country: 'FR', short: 'CNI', issuedFrom: 2021 });
    expect(DNI_ES.aliases).toEqual(expect.arrayContaining(['DNI 4.0', 'DNIe']));
    expect(CNI_FR.aliases).toEqual(expect.arrayContaining(['CNIe', 'carte nationale d’identité', 'carte d’identité']));
    for (const doc of DOCUMENTS) expect(isCurrent(doc)).toBe(true);
  });

  it('labels the years of a model in every language', () => {
    const old: DocumentInfo = { id: 'old', country: 'ES', short: 'DNI', issuedFrom: 2015, issuedUntil: 2021 };
    const once: DocumentInfo = { ...old, issuedFrom: 2006, issuedUntil: 2006 };
    expect(modelYears(DICTIONARIES.en, DNI_ES)).toBe('2021–present');
    expect(modelYears(DICTIONARIES.es, DNI_ES)).toBe('2021–actualidad');
    expect(modelYears(DICTIONARIES.fr, DNI_ES)).toBe('2021–aujourd’hui');
    expect(modelYears(DICTIONARIES.en, old)).toBe('2015–2021');
    expect(modelYears(DICTIONARIES.fr, once)).toBe('2006');
  });
});

describe('country names', () => {
  it('come from Intl in the UI language', () => {
    expect(countryName('ES', 'en')).toBe('Spain');
    expect(countryName('ES', 'es')).toBe('España');
    expect(countryName('ES', 'fr')).toBe('Espagne');
    expect(countryName('FR', 'es')).toBe('Francia');
    expect(documentCountryName(CNI_FR, 'en')).toBe('France');
  });

  it('fall back to the given name, then to the code', () => {
    expect(countryName('XZ', 'en', 'Narnia')).toBe('Narnia');
    expect(countryName('XZ', 'en')).toBe('XZ');
    expect(countryName('not a code', 'en')).toBe('NOT A CODE');
  });

  it('know the native name of a country', () => {
    expect(nativeLanguage('ES')).toBe('es');
    expect(nativeLanguage('FR')).toBe('fr');
    expect(nativeCountryName('ES')).toBe('España');
    expect(nativeCountryName('DE')).toBe('Deutschland');
  });
});

describe('normalizeText', () => {
  it('ignores case and diacritics', () => {
    expect(normalizeText('ESPAÑA')).toBe('espana');
    expect(normalizeText('Carte d’identité')).toBe('carte d’identite');
    expect(normalizeText('Œsterreich Straße')).toBe('oesterreich strasse');
    expect(words('carte d’identité (CNIe)')).toEqual(['carte', 'd', 'identite', 'cnie']);
  });
});

describe('searchDocuments with the real catalog', () => {
  it('returns everything, grouped and sorted by localized name, for an empty query', () => {
    // France, Italy, Spain, United Kingdom, United States
    expect(countries(search(''))).toEqual(['FR', 'IT', 'ES', 'GB', 'US', 'ZZ']);
    // España, Estados Unidos, Francia, Italia, Reino Unido
    expect(countries(search('   ', 'es'))).toEqual(['ES', 'US', 'FR', 'IT', 'GB', 'ZZ']);
    // Espagne, États-Unis, France, Italie, Royaume-Uni
    expect(countries(search('', 'fr'))).toEqual(['ES', 'US', 'FR', 'IT', 'GB', 'ZZ']);
    expect(search('')[0].name).toBe('France');
  });

  it.each(['espana', 'ESPAÑA', 'España', 'spain', 'espagne', 'Espa', 'es'])('finds Spain with %j in English', (q) => {
    expect(countries(search(q))).toContain('ES');
  });

  it('matches country names in every UI language whatever the current one', () => {
    expect(ids(search('espagne', 'en'))).toEqual(['dni-es']);
    expect(ids(search('francia', 'fr'))).toEqual(['cni-fr']);
    expect(ids(search('spain', 'es'))).toEqual(['dni-es']);
  });

  it('matches ISO codes, acronyms and aliases', () => {
    expect(ids(search('fr'))).toEqual(['cni-fr']);
    expect(ids(search('cni'))).toEqual(['cni-fr']);
    expect(ids(search('DNI'))).toEqual(['dni-es']);
    expect(ids(search('dnie'))).toEqual(['dni-es']);
    expect(ids(search('DNI 4.0'))).toEqual(['dni-es']);
    expect(ids(search('CNIe'))).toEqual(['cni-fr']);
    // The French name of the Italian card also says "carte d'identité".
    expect(ids(search("carte d'identite"))).toEqual(['cni-fr', 'cie-it']);
    expect(ids(search('carte nationale'))).toEqual(['cni-fr']);
  });

  it('finds the Italian CIE', () => {
    for (const q of ['italy', 'Italia', 'italie', 'IT', 'cie', 'CIE 3.0', 'carta d’identità', 'carta di identita', 'italy 2022']) {
      expect(ids(search(q)), q).toEqual(['cie-it']);
    }
    // Issued since 2022, so a 2021 search does not include it.
    expect(ids(search('2021'))).not.toContain('cie-it');
  });

  it('finds both UK driving licences, Great Britain first', () => {
    for (const q of ['united kingdom', 'reino unido', 'royaume-uni', 'GB', 'driving licence', 'DL']) {
      expect(ids(search(q)), q).toEqual(['dl-gb', 'dl-ni']);
    }
    expect(ids(search('DVLA'))).toEqual(['dl-gb']);
    expect(ids(search('northern ireland'))).toEqual(['dl-ni']);
    expect(ids(search('scotland'))).toEqual(['dl-gb']);
  });

  it('finds the custom document by its own words only, and lists it last', () => {
    for (const q of ['custom', 'other', 'personalizado', 'otro', 'personnalisé', 'autre', 'personalizzato', 'altro']) {
      expect(ids(search(q)), q).toEqual(['custom']);
    }
    // Not a country: no ISO code, no years.
    expect(ids(search('zz'))).toEqual([]);
    expect(ids(search('2021'))).not.toContain('custom');
    const all = search('');
    expect(all[all.length - 1].name).toBe('Custom');
    expect(search('', 'es').at(-1)!.name).toBe('Personalizado');
  });

  it('finds the US passport card', () => {
    for (const q of ['united states', 'estados unidos', 'états-unis', 'usa', 'US', 'passport card', 'pass card', 'real id']) {
      expect(ids(search(q)), q).toEqual(['ppc-us']);
    }
  });

  it('matches model names in every language', () => {
    expect(ids(search('national identity card', 'es'))).toEqual(['cni-fr']);
    expect(ids(search('modelo', 'fr'))).toEqual(['dni-es']);
  });

  it('requires every word to match', () => {
    expect(ids(search('france cni'))).toEqual(['cni-fr']);
    expect(ids(search('cni france'))).toEqual(['cni-fr']);
    expect(ids(search('spain cni'))).toEqual([]);
  });

  it('matches by year', () => {
    // Every model issued at some point in 2021, including the passport card (2008–present).
    expect(ids(search('2021')).sort()).toEqual(['cni-fr', 'dl-gb', 'dl-ni', 'dni-es', 'ppc-us']);
    expect(ids(search('france 2023'))).toEqual(['cni-fr']);
    expect(ids(search('2015'))).toEqual(['ppc-us']);
    expect(ids(search('2005'))).toEqual([]);
  });

  it('returns nothing when nothing matches', () => {
    expect(search('zzz')).toEqual([]);
    expect(search('narnia passport')).toEqual([]);
  });
});

describe('groupByCountry and searchDocuments with a large catalog', () => {
  /** Fake models for several countries, current and historical. Names come from the injected text. */
  const catalog: DocumentInfo[] = [
    { id: 'de-pa-2010', country: 'DE', short: 'PA', issuedFrom: 2010, issuedUntil: 2021 },
    { id: 'de-pa-2021', country: 'DE', short: 'PA', issuedFrom: 2021, aliases: ['Personalausweis', 'nPA'] },
    { id: 'es-dni-2006', country: 'ES', short: 'DNI', issuedFrom: 2006, issuedUntil: 2015, aliases: ['DNIe 1.0'] },
    { id: 'es-dni-2021', country: 'ES', short: 'DNI', issuedFrom: 2021, aliases: ['DNI 4.0'] },
    { id: 'es-dni-2015', country: 'ES', short: 'DNI', issuedFrom: 2015, issuedUntil: 2021, aliases: ['DNI 3.0'] },
    { id: 'es-old', country: 'ES', short: 'DNI', issuedFrom: 1990, issuedUntil: 2006 },
    { id: 'it-cie', country: 'IT', short: 'CIE', issuedFrom: 2016, aliases: ['carta d’identità elettronica'] },
    { id: 'fr-cni-1995', country: 'FR', short: 'CNI', issuedFrom: 1995, issuedUntil: 2021 },
    { id: 'fr-cni-2021', country: 'FR', short: 'CNI', issuedFrom: 2021 },
    { id: 'xz-id', country: 'XZ', short: 'NID', issuedFrom: 2000 },
  ];
  const names: Record<string, string> = {
    'de-pa-2010': 'Identity card (2010)',
    'de-pa-2021': 'Identity card (2021)',
    'es-dni-2006': 'Electronic DNI',
    'es-dni-2015': 'DNI 3.0',
    'es-dni-2021': 'DNI 4.0',
    'es-old': 'Laminated DNI',
    'it-cie': 'Electronic identity card',
    'fr-cni-1995': 'Laminated card',
    'fr-cni-2021': 'Electronic card',
    'xz-id': 'National ID',
  };
  const text: CatalogText = {
    modelName: (doc) => names[doc.id],
    countryName: (doc) => (doc.country === 'XZ' ? 'Zedland' : undefined),
  };
  const find = (q: string) => searchDocuments(q, catalog, 'en', text);

  it('sorts countries by localized name', () => {
    expect(groupByCountry(catalog, 'en', text).map((g) => g.name)).toEqual(['France', 'Germany', 'Italy', 'Spain', 'Zedland']);
    expect(groupByCountry(catalog, 'es', text).map((g) => g.name)).toEqual(['Alemania', 'España', 'Francia', 'Italia', 'Zedland']);
    expect(groupByCountry(catalog, 'fr', text).map((g) => g.name)).toEqual(['Allemagne', 'Espagne', 'France', 'Italie', 'Zedland']);
  });

  it('puts current models first, then the most recent', () => {
    const spain = groupByCountry(catalog, 'en', text).find((g) => g.country === 'ES')!;
    expect(spain.documents.map((d) => d.id)).toEqual(['es-dni-2021', 'es-dni-2015', 'es-dni-2006', 'es-old']);
    expect([...catalog].sort(compareModels)[0].issuedUntil).toBeUndefined();
  });

  it('keeps the model order inside a country when filtering', () => {
    expect(ids(find('dni'))).toEqual(['es-dni-2021', 'es-dni-2015', 'es-dni-2006', 'es-old']);
    expect(ids(find('laminated'))).toEqual(['fr-cni-1995', 'es-old']);
  });

  it('ranks exact and prefix matches on country names and acronyms first', () => {
    // "ital" starts "Italy" and "Italia", and nothing else.
    expect(countries(find('ital'))).toEqual(['IT']);
    // "electronic" is in model names only: alphabetical order.
    expect(countries(find('electronic'))).toEqual(['FR', 'IT', 'ES']);
    // "cie" is Italy's acronym (exact) and nothing else.
    expect(countries(find('cie'))).toEqual(['IT']);
    // "card" matches model names of FR, DE and IT, but nobody's country name.
    expect(countries(find('card'))).toEqual(['FR', 'DE', 'IT']);
    // "pa" is Germany's acronym (exact) and a prefix of nothing else, so Germany comes first.
    expect(countries(find('pa'))[0]).toBe('DE');
  });

  it('puts an exact country name before a prefix match elsewhere', () => {
    const docs: DocumentInfo[] = [
      { id: 'ni', country: 'NI', short: 'CI', issuedFrom: 2000 }, // Nicaragua
      { id: 'ne', country: 'NE', short: 'CNI', issuedFrom: 2000 }, // Niger
      { id: 'ng', country: 'NG', short: 'NIN', issuedFrom: 2000 }, // Nigeria
    ];
    const t: CatalogText = { modelName: () => 'ID card', countryName: () => undefined };
    expect(countries(searchDocuments('niger', docs, 'en', t))).toEqual(['NE', 'NG']);
    expect(countries(searchDocuments('ni', docs, 'en', t))).toEqual(['NI', 'NE', 'NG']);
  });

  it('finds historical models by alias and by year', () => {
    expect(ids(find('DNIe 1.0'))).toEqual(['es-dni-2006']);
    expect(ids(find('dni 2010'))).toEqual(['es-dni-2006']);
    // Every model issued during 2018, in country order.
    expect(ids(find('2018'))).toEqual(['fr-cni-1995', 'de-pa-2010', 'it-cie', 'es-dni-2015', 'xz-id']);
    expect(ids(find('germany 2021'))).toEqual(['de-pa-2021', 'de-pa-2010']);
  });

  it('finds native names and countries unknown to Intl', () => {
    expect(ids(find('deutschland'))).toEqual(['de-pa-2021', 'de-pa-2010']);
    expect(ids(find('italia'))).toEqual(['it-cie']);
    expect(ids(find('zedland'))).toEqual(['xz-id']);
    expect(ids(find('xz'))).toEqual(['xz-id']);
    expect(ids(find('carta identita'))).toEqual(['it-cie']);
  });

  it('labels historical and current models', () => {
    const [current, old] = groupByCountry(catalog, 'es', text).find((g) => g.country === 'DE')!.documents;
    expect(modelYears(DICTIONARIES.es, current)).toBe('2021–actualidad');
    expect(modelYears(DICTIONARIES.es, old)).toBe('2010–2021');
  });
});
