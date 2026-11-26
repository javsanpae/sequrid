import type { Rect } from './geometry';

export type Side = 'anverso' | 'reverso';
export const SIDES: Side[] = ['anverso', 'reverso'];

/**
 * Kinds of data that can appear on an ID card. They are shared between
 * countries so usage presets work the same way for every document.
 */
export type ZoneKey =
  | 'numero'
  | 'soporte'
  | 'nacimiento'
  | 'firma'
  | 'can'
  | 'validez'
  | 'emision'
  | 'nombre'
  | 'foto'
  | 'domicilio'
  | 'lugar'
  | 'padres'
  | 'altura'
  | 'sello'
  | 'mrz';

export const ZONE_KEYS: ZoneKey[] = [
  'numero',
  'soporte',
  'nacimiento',
  'firma',
  'can',
  'validez',
  'emision',
  'nombre',
  'foto',
  'domicilio',
  'lugar',
  'padres',
  'altura',
  'sello',
  'mrz',
];

/** Country-neutral names, used when documents from different countries are mixed. */
export const KEY_LABELS: Record<ZoneKey, string> = {
  numero: 'Número de documento',
  soporte: 'Número de soporte o de serie',
  nacimiento: 'Fecha de nacimiento',
  firma: 'Firma',
  can: 'Código CAN',
  validez: 'Fechas de validez',
  emision: 'Fecha de expedición',
  nombre: 'Nombre y apellidos',
  foto: 'Fotografía',
  domicilio: 'Domicilio',
  lugar: 'Lugar de nacimiento',
  padres: 'Nombre de los padres',
  altura: 'Estatura',
  sello: 'Código 2D-Doc',
  mrz: 'Zona MRZ',
};

/** A rect relative to the card edges (0..1) on one side of the card. */
export interface SideRect extends Rect {
  side: Side;
}

export interface ZoneDef {
  key: ZoneKey;
  label: string;
  /** Why this field matters, shown as a hint in the UI. */
  hint: string;
  rects: SideRect[];
}

export type CountryCode = 'ES' | 'FR';
export type DocumentId = 'dni-es' | 'cni-fr';

export interface DocumentType {
  id: DocumentId;
  country: CountryCode;
  countryName: string;
  /** Short name used in labels and file names: "DNI 1 · Anverso". */
  short: string;
  /** Full name of the document model. */
  name: string;
  sides: Record<Side, { label: string; hint: string }>;
  /** Physical size of the card (ISO/IEC 7810 ID-1). */
  widthMm: number;
  heightMm: number;
  zones: ZoneDef[];
}

const front = (x: number, y: number, w: number, h: number): SideRect => ({ side: 'anverso', x, y, w, h });
const back = (x: number, y: number, w: number, h: number): SideRect => ({ side: 'reverso', x, y, w, h });

/**
 * Spanish DNI 4.0 (issued since 2021). Coordinates are approximate and
 * relative to the card edges; users can adjust them in the editor.
 */
export const DNI_ES: DocumentType = {
  id: 'dni-es',
  country: 'ES',
  countryName: 'España',
  short: 'DNI',
  name: 'DNI (modelo 2021)',
  sides: {
    anverso: { label: 'Anverso', hint: 'Cara con la foto' },
    reverso: { label: 'Reverso', hint: 'Cara con el domicilio' },
  },
  widthMm: 85.6,
  heightMm: 53.98,
  zones: [
    {
      key: 'numero',
      label: 'Número de DNI',
      hint: 'Aparece dos veces en el anverso y otra en la MRZ. Suele hacer falta en trámites formales.',
      rects: [front(0.012, 0.18, 0.175, 0.065), front(0.385, 0.16, 0.39, 0.095)],
    },
    {
      key: 'soporte',
      label: 'Número de soporte',
      hint: 'Identifica la tarjeta física y se usa en verificaciones online junto al número de DNI.',
      rects: [front(0.77, 0.13, 0.13, 0.09), front(0.385, 0.695, 0.2, 0.07)],
    },
    {
      key: 'nacimiento',
      label: 'Fecha de nacimiento',
      hint: 'Muy usada en preguntas de seguridad y recuperación de cuentas.',
      rects: [front(0.78, 0.49, 0.19, 0.085)],
    },
    {
      key: 'firma',
      label: 'Firma',
      hint: 'Una firma escaneada se puede pegar en cualquier contrato o autorización.',
      rects: [front(0.43, 0.765, 0.32, 0.14)],
    },
    {
      key: 'can',
      label: 'Código CAN',
      hint: 'Las seis cifras que dan acceso al chip por NFC. Nadie que reciba una copia lo necesita.',
      rects: [front(0.78, 0.815, 0.19, 0.09)],
    },
    {
      key: 'validez',
      label: 'Fechas de expedición y validez',
      hint: 'Rara vez son necesarias para quien recibe la copia.',
      rects: [front(0.385, 0.58, 0.39, 0.075)],
    },
    {
      key: 'nombre',
      label: 'Nombre y apellidos',
      hint: 'Casi siempre hace falta: es lo que te identifica.',
      rects: [front(0.385, 0.295, 0.3, 0.215)],
    },
    {
      key: 'foto',
      label: 'Fotografía',
      hint: 'Útil para quien tiene que comprobar que eres tú en persona.',
      rects: [front(0.01, 0.265, 0.365, 0.72)],
    },
    {
      key: 'domicilio',
      label: 'Domicilio',
      hint: 'Tu dirección. Solo la necesita quien tenga que enviarte algo o registrarte.',
      rects: [back(0.275, 0.04, 0.35, 0.18)],
    },
    {
      key: 'lugar',
      label: 'Lugar de nacimiento',
      hint: 'Otro dato típico de las preguntas de seguridad.',
      rects: [back(0.275, 0.31, 0.23, 0.145)],
    },
    {
      key: 'padres',
      label: 'Nombre de los padres',
      hint: 'No aporta nada a quien recibe la copia y sí a quien quiere suplantarte.',
      rects: [back(0.275, 0.49, 0.28, 0.095)],
    },
    {
      key: 'mrz',
      label: 'Zona MRZ (líneas inferiores)',
      hint: 'Las tres líneas legibles por máquina repiten número, soporte y fecha de nacimiento.',
      rects: [back(0.03, 0.65, 0.94, 0.27)],
    },
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
  countryName: 'Francia',
  short: 'CNI',
  name: "Carte nationale d'identité (desde 2021)",
  sides: {
    anverso: { label: 'Anverso', hint: 'Recto, cara con la foto' },
    reverso: { label: 'Reverso', hint: 'Verso, cara con la MRZ' },
  },
  widthMm: 85.6,
  heightMm: 53.98,
  zones: [
    {
      key: 'numero',
      label: 'Número de documento',
      hint: 'Nueve caracteres que identifican la carta. Aparece también en vertical en ambas caras y en la MRZ.',
      rects: [front(0.393, 0.707, 0.283, 0.089), front(0.005, 0.279, 0.021, 0.151), back(0.971, 0.281, 0.024, 0.153)],
    },
    {
      key: 'soporte',
      label: 'Número vertical del reverso',
      hint: 'Identificador de la tarjeta impreso en vertical junto al chip.',
      rects: [back(0.034, 0.235, 0.036, 0.307)],
    },
    {
      key: 'nacimiento',
      label: 'Fecha de nacimiento',
      hint: 'Muy usada en preguntas de seguridad y recuperación de cuentas.',
      rects: [front(0.732, 0.46, 0.222, 0.078)],
    },
    {
      key: 'lugar',
      label: 'Lugar de nacimiento',
      hint: 'En la carta francesa está en el anverso. Otro dato típico de las preguntas de seguridad.',
      rects: [front(0.393, 0.541, 0.29, 0.072)],
    },
    {
      key: 'firma',
      label: 'Firma',
      hint: 'Una firma escaneada se puede pegar en cualquier contrato o autorización.',
      rects: [front(0.441, 0.799, 0.197, 0.126)],
    },
    {
      key: 'can',
      label: 'Código CAN',
      hint: 'Las seis cifras de abajo a la derecha dan acceso al chip por NFC. Nadie que reciba una copia lo necesita.',
      rects: [front(0.729, 0.827, 0.19, 0.075)],
    },
    {
      key: 'validez',
      label: 'Fecha de caducidad',
      hint: 'Aparece en grande en el anverso y en pequeño arriba en ambas caras.',
      rects: [front(0.732, 0.701, 0.208, 0.075), front(0.661, 0.011, 0.053, 0.024), back(0.28, 0.003, 0.052, 0.025)],
    },
    {
      key: 'emision',
      label: 'Fecha de expedición',
      hint: 'La fecha de entrega de la carta, en el reverso.',
      rects: [back(0.42, 0.052, 0.285, 0.086)],
    },
    {
      key: 'nombre',
      label: 'Apellidos, nombres y nombre de uso',
      hint: 'Casi siempre hace falta: es lo que te identifica.',
      rects: [front(0.393, 0.204, 0.36, 0.208), front(0.393, 0.623, 0.29, 0.072)],
    },
    {
      key: 'foto',
      label: 'Fotografía (y retratos secundarios)',
      hint: 'La foto principal y los retratos fantasma del anverso y del reverso.',
      rects: [front(0.048, 0.216, 0.345, 0.708), front(0.278, 0.312, 0.173, 0.352), back(0.747, 0.058, 0.2, 0.292)],
    },
    {
      key: 'altura',
      label: 'Estatura',
      hint: 'Un dato físico que no necesita nadie que reciba una copia.',
      rects: [back(0.269, 0.052, 0.116, 0.086)],
    },
    {
      key: 'domicilio',
      label: 'Dirección',
      hint: 'Tu dirección, si figura. Solo la necesita quien tenga que enviarte algo o registrarte.',
      rects: [back(0.269, 0.15, 0.35, 0.202)],
    },
    {
      key: 'sello',
      label: 'Código 2D-Doc (sello digital)',
      hint: 'El código cuadrado contiene tus datos firmados digitalmente: cualquiera puede leerlos con el móvil.',
      rects: [back(0.097, 0.052, 0.155, 0.242)],
    },
    {
      key: 'mrz',
      label: 'Zona MRZ (líneas inferiores)',
      hint: 'Las tres líneas legibles por máquina repiten número, fechas y nombre.',
      rects: [back(0.051, 0.687, 0.907, 0.238)],
    },
  ],
};

export const DOCUMENTS: DocumentType[] = [DNI_ES, CNI_FR];

export function documentType(id: DocumentId): DocumentType {
  const doc = DOCUMENTS.find((d) => d.id === id);
  if (!doc) throw new Error(`Unknown document: ${id}`);
  return doc;
}

export function zoneDef(key: ZoneKey, doc: DocumentType = DNI_ES): ZoneDef | undefined {
  return doc.zones.find((z) => z.key === key);
}

/** Label of a zone in a document, falling back to the generic one. */
export const zoneLabel = (key: ZoneKey, doc?: DocumentType): string =>
  (doc && zoneDef(key, doc)?.label) || KEY_LABELS[key];

/** Zone definitions with at least one rect on the given side. */
export function zonesForSide(side: Side, doc: DocumentType = DNI_ES): ZoneDef[] {
  return doc.zones.filter((z) => z.rects.some((r) => r.side === side));
}

/** Sides on which a zone appears, in card order. */
export const zoneSides = (def: ZoneDef): Side[] => SIDES.filter((s) => def.rects.some((r) => r.side === s));

export const documentKeys = (doc: DocumentType): ZoneKey[] => doc.zones.map((z) => z.key);
