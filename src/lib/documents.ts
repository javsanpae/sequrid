import type { Rect } from './geometry';

export type Side = 'front' | 'back';
export const SIDES: Side[] = ['front', 'back'];

/**
 * Kinds of data that can appear on an ID card. They are shared between
 * countries so usage presets work the same way for every document.
 * Display names and hints live in the i18n dictionaries.
 */
export type ZoneKey =
  | 'number'
  | 'serial'
  | 'birthDate'
  | 'signature'
  | 'can'
  | 'expiry'
  | 'issueDate'
  | 'name'
  | 'photo'
  | 'address'
  | 'birthPlace'
  | 'parents'
  | 'height'
  | 'seal'
  | 'taxCode'
  | 'birthRecord'
  | 'issuer'
  | 'mrz';

export const ZONE_KEYS: ZoneKey[] = [
  'number',
  'serial',
  'birthDate',
  'signature',
  'can',
  'expiry',
  'issueDate',
  'name',
  'photo',
  'address',
  'birthPlace',
  'parents',
  'height',
  'seal',
  'taxCode',
  'birthRecord',
  'issuer',
  'mrz',
];

/** A rect relative to the card edges (0..1) on one side of the card. */
export interface SideRect extends Rect {
  side: Side;
}

export interface ZoneDef {
  key: ZoneKey;
  rects: SideRect[];
}

/**
 * ISO 3166-1 alpha-2 code, uppercase ("ES", "FR"). Kept as a plain string so
 * any nation can be added without touching this type.
 */
export type CountryCode = string;
export type DocumentId = 'dni-es' | 'cni-fr' | 'cie-it';

/**
 * What the picker needs to list and search a document model. Countries can
 * have several models, current and historical; each one is its own entry.
 */
export interface DocumentInfo {
  id: string;
  country: CountryCode;
  /** Acronym used in labels and file names: "DNI 1 · Front", "dni-protected.pdf". */
  short: string;
  /** Year the model started to be issued. */
  issuedFrom: number;
  /** Last year it was issued; absent while it is still issued. */
  issuedUntil?: number;
  /** Extra search terms: official names, nicknames, older spellings. */
  aliases?: readonly string[];
}

export interface DocumentType extends DocumentInfo {
  id: DocumentId;
  /** Physical size of the card (ISO/IEC 7810 ID-1). */
  widthMm: number;
  heightMm: number;
  zones: ZoneDef[];
}

const front = (x: number, y: number, w: number, h: number): SideRect => ({ side: 'front', x, y, w, h });
const back = (x: number, y: number, w: number, h: number): SideRect => ({ side: 'back', x, y, w, h });

/**
 * Spanish DNI 4.0 (issued since 2021). Coordinates are approximate and
 * relative to the card edges; users can adjust them in the editor.
 */
export const DNI_ES: DocumentType = {
  id: 'dni-es',
  country: 'ES',
  short: 'DNI',
  issuedFrom: 2021,
  aliases: ['DNI 4.0', 'DNIe', 'documento nacional de identidad', 'carné de identidad', 'carnet de identidad'],
  widthMm: 85.6,
  heightMm: 53.98,
  zones: [
    { key: 'number', rects: [front(0.012, 0.18, 0.175, 0.065), front(0.385, 0.16, 0.39, 0.095)] },
    { key: 'serial', rects: [front(0.77, 0.13, 0.13, 0.09), front(0.385, 0.695, 0.2, 0.07)] },
    { key: 'birthDate', rects: [front(0.78, 0.49, 0.19, 0.085)] },
    { key: 'signature', rects: [front(0.43, 0.765, 0.32, 0.14)] },
    { key: 'can', rects: [front(0.78, 0.815, 0.19, 0.09)] },
    { key: 'expiry', rects: [front(0.385, 0.58, 0.39, 0.075)] },
    { key: 'name', rects: [front(0.385, 0.295, 0.3, 0.215)] },
    { key: 'photo', rects: [front(0.01, 0.265, 0.365, 0.72)] },
    { key: 'address', rects: [back(0.275, 0.04, 0.35, 0.18)] },
    { key: 'birthPlace', rects: [back(0.275, 0.31, 0.23, 0.145)] },
    { key: 'parents', rects: [back(0.275, 0.49, 0.28, 0.095)] },
    { key: 'mrz', rects: [back(0.03, 0.65, 0.94, 0.27)] },
  ],
};

/**
 * French national identity card (carte nationale d'identité électronique,
 * issued since August 2021). Positions follow the official specimen; small
 * repeated prints (vertical numbers, tiny expiry date) are included because
 * they leak the same data.
 */
export const CNI_FR: DocumentType = {
  id: 'cni-fr',
  country: 'FR',
  short: 'CNI',
  issuedFrom: 2021,
  aliases: ['CNIe', 'carte nationale d’identité', 'carte d’identité'],
  widthMm: 85.6,
  heightMm: 53.98,
  zones: [
    {
      key: 'number',
      rects: [front(0.393, 0.707, 0.283, 0.089), front(0.005, 0.279, 0.021, 0.151), back(0.971, 0.281, 0.024, 0.153)],
    },
    { key: 'serial', rects: [back(0.034, 0.235, 0.036, 0.307)] },
    { key: 'birthDate', rects: [front(0.732, 0.46, 0.222, 0.078)] },
    { key: 'birthPlace', rects: [front(0.393, 0.541, 0.29, 0.072)] },
    { key: 'signature', rects: [front(0.441, 0.799, 0.197, 0.126)] },
    { key: 'can', rects: [front(0.729, 0.827, 0.19, 0.075)] },
    {
      key: 'expiry',
      rects: [front(0.732, 0.701, 0.208, 0.075), front(0.661, 0.011, 0.053, 0.024), back(0.28, 0.003, 0.052, 0.025)],
    },
    { key: 'issueDate', rects: [back(0.42, 0.052, 0.285, 0.086)] },
    { key: 'name', rects: [front(0.393, 0.204, 0.36, 0.208), front(0.393, 0.623, 0.29, 0.072)] },
    {
      key: 'photo',
      rects: [front(0.048, 0.216, 0.345, 0.708), front(0.278, 0.312, 0.173, 0.352), back(0.747, 0.058, 0.2, 0.292)],
    },
    { key: 'height', rects: [back(0.269, 0.052, 0.116, 0.086)] },
    { key: 'address', rects: [back(0.269, 0.15, 0.35, 0.202)] },
    { key: 'seal', rects: [back(0.097, 0.052, 0.155, 0.242)] },
    { key: 'mrz', rects: [back(0.051, 0.687, 0.907, 0.238)] },
  ],
};

/**
 * Italian electronic identity card (Carta d'Identità Elettronica, CIE 3.0),
 * in the design used since 29 September 2022 to comply with Regulation (EU)
 * 2019/1157 ("IT" inside the EU flag and in an optically variable square).
 * Positions follow the official specimen. The barcode on the back encodes
 * the tax code, so it belongs to the tax code zone.
 */
export const CIE_IT: DocumentType = {
  id: 'cie-it',
  country: 'IT',
  short: 'CIE',
  issuedFrom: 2022,
  aliases: [
    'CIE 3.0',
    'carta d’identità elettronica',
    'carta di identità elettronica',
    'carta d’identità',
    'carta di identità',
  ],
  widthMm: 85.6,
  heightMm: 53.98,
  zones: [
    { key: 'number', rects: [front(0.755, 0.045, 0.214, 0.06)] },
    { key: 'issuer', rects: [front(0.145, 0.205, 0.26, 0.073)] },
    { key: 'name', rects: [front(0.323, 0.292, 0.42, 0.137)] },
    // Place and date of birth share one line whose split depends on the
    // place's length, so a single zone covers both.
    { key: 'birthDate', rects: [front(0.323, 0.45, 0.62, 0.092)] },
    { key: 'height', rects: [front(0.474, 0.55, 0.084, 0.092)] },
    { key: 'issueDate', rects: [front(0.323, 0.655, 0.148, 0.07)] },
    { key: 'expiry', rects: [front(0.65, 0.655, 0.128, 0.07)] },
    { key: 'signature', rects: [front(0.323, 0.783, 0.265, 0.12)] },
    { key: 'can', rects: [front(0.755, 0.805, 0.175, 0.072)] },
    {
      key: 'photo',
      rects: [front(0.026, 0.317, 0.284, 0.542), front(0.789, 0.158, 0.163, 0.25), back(0.816, 0.133, 0.126, 0.245)],
    },
    { key: 'parents', rects: [back(0.047, 0.062, 0.621, 0.097)] },
    { key: 'taxCode', rects: [back(0.047, 0.163, 0.26, 0.098), back(0.045, 0.467, 0.907, 0.208)] },
    { key: 'birthRecord', rects: [back(0.447, 0.163, 0.23, 0.07)] },
    { key: 'address', rects: [back(0.047, 0.272, 0.6, 0.065)] },
    { key: 'mrz', rects: [back(0.053, 0.725, 0.9, 0.245)] },
  ],
};

export const DOCUMENTS: DocumentType[] = [DNI_ES, CNI_FR, CIE_IT];

/** True while the model is still being issued. */
export const isCurrent = (doc: DocumentInfo): boolean => doc.issuedUntil === undefined;

/** Order of the models of one country: current ones first, then the most recent. */
export function compareModels(a: DocumentInfo, b: DocumentInfo): number {
  return (
    Number(isCurrent(b)) - Number(isCurrent(a)) ||
    b.issuedFrom - a.issuedFrom ||
    (b.issuedUntil ?? 0) - (a.issuedUntil ?? 0) ||
    a.id.localeCompare(b.id)
  );
}

export function documentType(id: DocumentId): DocumentType {
  const doc = DOCUMENTS.find((d) => d.id === id);
  if (!doc) throw new Error(`Unknown document: ${id}`);
  return doc;
}

export function zoneDef(key: ZoneKey, doc: DocumentType = DNI_ES): ZoneDef | undefined {
  return doc.zones.find((z) => z.key === key);
}

/** Zone definitions with at least one rect on the given side. */
export function zonesForSide(side: Side, doc: DocumentType = DNI_ES): ZoneDef[] {
  return doc.zones.filter((z) => z.rects.some((r) => r.side === side));
}

/** Sides on which a zone appears, in card order. */
export const zoneSides = (def: ZoneDef): Side[] => SIDES.filter((s) => def.rects.some((r) => r.side === s));

export const documentKeys = (doc: DocumentType): ZoneKey[] => doc.zones.map((z) => z.key);
