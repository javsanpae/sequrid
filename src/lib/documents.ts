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
  | 'entitlements'
  | 'restrictions'
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
  'entitlements',
  'restrictions',
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
export type DocumentId = 'dni-es' | 'cni-fr' | 'cie-it' | 'dl-gb' | 'dl-ni' | 'ppc-us' | 'custom';

/**
 * Pseudo-country of the custom document. ZZ is user-assigned in ISO 3166-1
 * ("unknown or unspecified"), so it never clashes with a real nation.
 */
export const CUSTOM_COUNTRY: CountryCode = 'ZZ';

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
  /**
   * A placeholder for any document not in the catalog: no predefined zones,
   * no years, listed last in the picker and offered when a search finds nothing.
   */
  custom?: boolean;
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

/**
 * The United Kingdom has no national identity card: the photocard driving
 * licence is the everyday ID. Great Britain (DVLA) and Northern Ireland (DVA)
 * issue cards with the same layout (fields numbered as in the EU model), so
 * they share most of the geometry. Positions follow DVLA and nidirect.gov.uk
 * specimens. The back is a table of categories (9), valid from/to dates
 * (10, 11) and restriction codes (12), which can reveal health conditions.
 */
function ukLicenceZones(o: { name: number; number: number; dateOnPhoto: ZoneKey; photo: SideRect[] }): ZoneDef[] {
  return [
    { key: 'name', rects: [front(0.347, o.name, 0.43, 0.17)] },
    // Field 3: date and place of birth on one line.
    { key: 'birthDate', rects: [front(0.347, 0.342, 0.44, 0.055)] },
    {
      key: 'issueDate',
      rects: [front(0.347, 0.396, 0.155, 0.052), ...(o.dateOnPhoto === 'issueDate' ? [front(0.06, 0.615, 0.11, 0.036)] : [])],
    },
    { key: 'issuer', rects: [front(0.511, 0.396, 0.13, 0.052)] },
    {
      key: 'expiry',
      rects: [front(0.347, 0.451, 0.155, 0.052), ...(o.dateOnPhoto === 'expiry' ? [front(0.06, 0.615, 0.11, 0.036)] : [])],
    },
    { key: 'number', rects: [front(0.347, 0.506, o.number, 0.052)] },
    { key: 'signature', rects: [front(0.347, 0.58, 0.39, 0.13)] },
    { key: 'address', rects: [front(0.347, 0.726, 0.46, 0.143)] },
    { key: 'entitlements', rects: [front(0.347, 0.88, 0.5, 0.06), back(0.432, 0.069, 0.252, 0.775)] },
    { key: 'restrictions', rects: [back(0.679, 0.069, 0.195, 0.775)] },
    { key: 'serial', rects: [back(0.698, 0.912, 0.25, 0.07)] },
    { key: 'photo', rects: o.photo },
  ];
}

/** Great Britain photocard driving licence (DVLA), design issued since December 2021. */
export const DL_GB: DocumentType = {
  id: 'dl-gb',
  country: 'GB',
  short: 'DL',
  issuedFrom: 2021,
  aliases: ['driving licence', 'driver’s licence', 'photocard', 'DVLA', 'Great Britain', 'England', 'Scotland', 'Wales'],
  widthMm: 85.6,
  heightMm: 53.98,
  // The 16-character driver number encodes surname, date of birth and initials.
  zones: ukLicenceZones({
    name: 0.166,
    number: 0.34,
    dateOnPhoto: 'issueDate',
    photo: [front(0.055, 0.244, 0.22, 0.41), front(0.067, 0.713, 0.207, 0.195)],
  }),
};

/** Northern Ireland photocard driving licence (DVA), design issued since 2021. */
export const DL_NI: DocumentType = {
  id: 'dl-ni',
  country: 'GB',
  short: 'DL',
  issuedFrom: 2021,
  aliases: ['driving licence', 'driver’s licence', 'photocard', 'DVA', 'Northern Ireland', 'NI'],
  widthMm: 85.6,
  heightMm: 53.98,
  zones: ukLicenceZones({
    name: 0.176,
    number: 0.18,
    dateOnPhoto: 'expiry',
    photo: [front(0.058, 0.236, 0.216, 0.424), front(0.093, 0.712, 0.152, 0.164)],
  }),
};

/**
 * U.S. passport card (Department of State), the only nationwide federal ID
 * in card format, issued since 2008 in polycarbonate. Positions follow the
 * official exemplar. It has no signature. Control numbers (under the photo,
 * along the left edge, bottom right and on the back) and the barcode are
 * grouped as `serial`.
 */
export const PPC_US: DocumentType = {
  id: 'ppc-us',
  country: 'US',
  short: 'Passport Card',
  issuedFrom: 2008,
  aliases: ['passport card', 'US passport card', 'PASS card', 'REAL ID', 'United States', 'USA'],
  widthMm: 85.6,
  heightMm: 53.98,
  zones: [
    { key: 'number', rects: [front(0.715, 0.247, 0.2, 0.062), back(0.745, 0.374, 0.195, 0.067)] },
    {
      key: 'serial',
      rects: [
        front(0.06, 0.865, 0.205, 0.055),
        front(0.805, 0.875, 0.125, 0.045),
        front(0.002, 0.43, 0.026, 0.44),
        back(0.7, 0.138, 0.08, 0.046),
        back(0.043, 0.45, 0.31, 0.11),
      ],
    },
    { key: 'name', rects: [front(0.395, 0.338, 0.44, 0.212)] },
    { key: 'birthDate', rects: [front(0.578, 0.602, 0.17, 0.062)] },
    { key: 'birthPlace', rects: [front(0.48, 0.714, 0.28, 0.062)] },
    { key: 'issueDate', rects: [front(0.486, 0.82, 0.185, 0.055)] },
    { key: 'expiry', rects: [front(0.703, 0.82, 0.19, 0.055)] },
    { key: 'photo', rects: [front(0.03, 0.222, 0.31, 0.627), front(0.839, 0.454, 0.134, 0.251)] },
    { key: 'mrz', rects: [back(0.049, 0.67, 0.89, 0.222)] },
  ],
};

/**
 * Any document that is not in the list yet: the user draws the zones. ID-1
 * size is assumed for the "real size" PDF; other formats can use "Enlarged".
 */
export const CUSTOM_DOC: DocumentType = {
  id: 'custom',
  country: CUSTOM_COUNTRY,
  short: 'ID',
  issuedFrom: 0,
  custom: true,
  aliases: [
    'custom',
    'other',
    'unlisted',
    'manual',
    'personalizado',
    'otro',
    'personnalisé',
    'autre',
    'personalizzato',
    'altro',
  ],
  widthMm: 85.6,
  heightMm: 53.98,
  zones: [],
};

export const DOCUMENTS: DocumentType[] = [DNI_ES, CNI_FR, CIE_IT, DL_GB, DL_NI, PPC_US, CUSTOM_DOC];

/** Documents with a real catalog entry (measured zones), without the custom placeholder. */
export const CATALOG: DocumentType[] = DOCUMENTS.filter((d) => !d.custom);

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
