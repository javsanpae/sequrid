import { countryName, nativeCountryName } from './countries';
import { compareModels, type CountryCode, type DocumentInfo } from './documents';
import { DICTIONARIES, LANGUAGES, type Lang } from './i18n/lang';

/**
 * Grouping and search for the document picker. Pure functions over any list
 * of documents, so the catalog can grow to every nation and many models per
 * nation (current and historical) without changing the UI.
 */

export interface CountryGroup<D extends DocumentInfo = DocumentInfo> {
  country: CountryCode;
  /** Country name in the UI language. */
  name: string;
  /** Models of this country: current first, then the most recent. */
  documents: D[];
}

/** Where display texts come from. The default reads the i18n dictionaries. */
export interface CatalogText {
  /** Name of the model ("DNI (2021 model)"), if translated in that language. */
  modelName(doc: DocumentInfo, lang: Lang): string | undefined;
  /** Country name from the dictionary, used only when Intl does not know the country. */
  countryName(doc: DocumentInfo, lang: Lang): string | undefined;
}

type DictionaryEntry = { name: string; countryName: string } | undefined;
const entry = (doc: DocumentInfo, lang: Lang): DictionaryEntry =>
  (DICTIONARIES[lang].documents as Record<string, DictionaryEntry>)[doc.id];

export const DICTIONARY_TEXT: CatalogText = {
  modelName: (doc, lang) => entry(doc, lang)?.name,
  countryName: (doc, lang) => entry(doc, lang)?.countryName,
};

/** Country name of a document in a language: Intl, then the dictionary, then the code. */
export const documentCountryName = (doc: DocumentInfo, lang: Lang, text: CatalogText = DICTIONARY_TEXT): string =>
  countryName(doc.country, lang, text.countryName(doc, lang));

/** Letters that do not decompose with NFD but that people type without the accent. */
const FOLD: Record<string, string> = { ß: 'ss', æ: 'ae', œ: 'oe', ø: 'o', ł: 'l', đ: 'd', ð: 'd', þ: 'th', ı: 'i' };

/** Lowercase, without diacritics: "España" → "espana", "Œuvre" → "oeuvre". */
export function normalizeText(text: string): string {
  return text
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .replace(/[ßæœøłđðþı]/g, (c) => FOLD[c]);
}

/** Normalized words: "carte d’identité" → ["carte", "d", "identite"]. */
export const words = (text: string): string[] => normalizeText(text).split(/[^\p{L}\p{N}]+/u).filter(Boolean);

const phrase = (text: string): string => words(text).join(' ');

interface Indexed<D extends DocumentInfo> {
  doc: D;
  /** Country names (every UI language and the native one) and the ISO code, as phrases. */
  countryTerms: string[];
  short: string;
  words: string[];
}

function index<D extends DocumentInfo>(doc: D, text: CatalogText): Indexed<D> {
  const countries = [
    ...LANGUAGES.map((l) => documentCountryName(doc, l.code, text)),
    nativeCountryName(doc.country) ?? '',
    doc.country,
  ];
  const models = LANGUAGES.map((l) => text.modelName(doc, l.code) ?? '');
  const years = [doc.issuedFrom, doc.issuedUntil ?? ''].map(String);
  const all = [...countries, doc.short, ...models, ...(doc.aliases ?? []), ...years];
  return {
    doc,
    countryTerms: [...new Set(countries.map(phrase).filter(Boolean))],
    short: phrase(doc.short),
    words: [...new Set(all.flatMap(words))],
  };
}

const isYear = (token: string) => /^\d{4}$/.test(token);

/** A word matches by prefix; a year also matches every model issued that year. */
function matches(item: Indexed<DocumentInfo>, token: string): boolean {
  if (item.words.some((w) => w.startsWith(token))) return true;
  if (!isYear(token)) return false;
  const year = Number(token);
  return year >= item.doc.issuedFrom && year <= (item.doc.issuedUntil ?? Infinity);
}

/** 0: the query is a country name, code or acronym; 1: it starts one; 2: anything else. */
function rank(item: Indexed<DocumentInfo>, query: string): number {
  const names = [...item.countryTerms, item.short];
  if (names.includes(query)) return 0;
  if (names.some((n) => n.startsWith(query))) return 1;
  return 2;
}

function collator(lang: Lang): Intl.Collator {
  try {
    return new Intl.Collator(lang, { sensitivity: 'base' });
  } catch {
    return new Intl.Collator();
  }
}

/** Groups documents by country: countries by localized name, models current first then newest. */
export function groupByCountry<D extends DocumentInfo>(
  documents: readonly D[],
  lang: Lang,
  text: CatalogText = DICTIONARY_TEXT,
): CountryGroup<D>[] {
  const groups = new Map<CountryCode, CountryGroup<D>>();
  for (const doc of documents) {
    const code = doc.country.toUpperCase();
    let group = groups.get(code);
    if (!group) {
      group = { country: code, name: documentCountryName(doc, lang, text), documents: [] };
      groups.set(code, group);
    }
    group.documents.push(doc);
  }
  const compare = collator(lang);
  const list = [...groups.values()];
  for (const g of list) g.documents.sort(compareModels);
  return list.sort((a, b) => compare.compare(a.name, b.name) || a.country.localeCompare(b.country));
}

/**
 * Filters documents by a free-text query and groups them by country.
 *
 * Case- and accent-insensitive; every word of the query must match the start
 * of some word among: the country name in every UI language and in its own
 * language, the ISO code, the acronym, the model name in every UI language,
 * the aliases and the years. Countries whose name or acronym is (or starts
 * with) the query come first. An empty query returns everything.
 */
export function searchDocuments<D extends DocumentInfo>(
  query: string,
  documents: readonly D[],
  lang: Lang,
  text: CatalogText = DICTIONARY_TEXT,
): CountryGroup<D>[] {
  const tokens = words(query);
  const groups = groupByCountry(documents, lang, text);
  if (tokens.length === 0) return groups;

  const q = tokens.join(' ');
  const ranked: { group: CountryGroup<D>; rank: number; order: number }[] = [];
  groups.forEach((group, order) => {
    const found = group.documents
      .map((doc) => index(doc, text))
      .filter((item) => tokens.every((t) => matches(item, t)));
    if (found.length === 0) return;
    ranked.push({
      group: { ...group, documents: found.map((i) => i.doc) },
      rank: Math.min(...found.map((i) => rank(i, q))),
      order,
    });
  });
  return ranked.sort((a, b) => a.rank - b.rank || a.order - b.order).map((r) => r.group);
}
