import type { Rect } from './geometry';

export type Side = 'anverso' | 'reverso';

export type ZoneKey =
  | 'numero'
  | 'soporte'
  | 'nacimiento'
  | 'firma'
  | 'can'
  | 'validez'
  | 'nombre'
  | 'foto'
  | 'domicilio'
  | 'lugar'
  | 'padres'
  | 'mrz';

export interface ZoneDef {
  key: ZoneKey;
  label: string;
  side: Side;
  /** Why this field matters, shown as a hint in the UI. */
  hint: string;
  /** Where the field sits on the card, relative to the card edges (0..1). */
  rects: Rect[];
}

export interface DocumentType {
  id: string;
  name: string;
  /** Physical size of the card (ISO/IEC 7810 ID-1). */
  widthMm: number;
  heightMm: number;
  zones: ZoneDef[];
}

/**
 * Spanish DNI 4.0 (issued since 2021). Coordinates are approximate and
 * relative to the card edges; users can adjust them in the editor.
 */
export const DNI_ES: DocumentType = {
  id: 'dni-es',
  name: 'DNI español (modelo 2021)',
  widthMm: 85.6,
  heightMm: 53.98,
  zones: [
    {
      key: 'numero',
      label: 'Número de DNI',
      side: 'anverso',
      hint: 'Aparece dos veces en el anverso y otra en la MRZ. Suele hacer falta en trámites formales.',
      rects: [
        { x: 0.012, y: 0.18, w: 0.175, h: 0.065 },
        { x: 0.385, y: 0.16, w: 0.39, h: 0.095 },
      ],
    },
    {
      key: 'soporte',
      label: 'Número de soporte',
      side: 'anverso',
      hint: 'Identifica la tarjeta física y se usa en verificaciones online junto al número de DNI.',
      rects: [
        { x: 0.77, y: 0.13, w: 0.13, h: 0.09 },
        { x: 0.385, y: 0.695, w: 0.2, h: 0.07 },
      ],
    },
    {
      key: 'nacimiento',
      label: 'Fecha de nacimiento',
      side: 'anverso',
      hint: 'Muy usada en preguntas de seguridad y recuperación de cuentas.',
      rects: [{ x: 0.78, y: 0.49, w: 0.19, h: 0.085 }],
    },
    {
      key: 'firma',
      label: 'Firma',
      side: 'anverso',
      hint: 'Una firma escaneada se puede pegar en cualquier contrato o autorización.',
      rects: [{ x: 0.43, y: 0.765, w: 0.32, h: 0.14 }],
    },
    {
      key: 'can',
      label: 'Código CAN',
      side: 'anverso',
      hint: 'Las seis cifras que dan acceso al chip por NFC. Nadie que reciba una copia lo necesita.',
      rects: [{ x: 0.78, y: 0.815, w: 0.19, h: 0.09 }],
    },
    {
      key: 'validez',
      label: 'Fechas de expedición y validez',
      side: 'anverso',
      hint: 'Rara vez son necesarias para quien recibe la copia.',
      rects: [{ x: 0.385, y: 0.58, w: 0.39, h: 0.075 }],
    },
    {
      key: 'nombre',
      label: 'Nombre y apellidos',
      side: 'anverso',
      hint: 'Casi siempre hace falta: es lo que te identifica.',
      rects: [{ x: 0.385, y: 0.295, w: 0.3, h: 0.215 }],
    },
    {
      key: 'foto',
      label: 'Fotografía',
      side: 'anverso',
      hint: 'Útil para quien tiene que comprobar que eres tú en persona.',
      rects: [{ x: 0.01, y: 0.265, w: 0.365, h: 0.72 }],
    },
    {
      key: 'domicilio',
      label: 'Domicilio',
      side: 'reverso',
      hint: 'Tu dirección. Solo la necesita quien tenga que enviarte algo o registrarte.',
      rects: [{ x: 0.275, y: 0.04, w: 0.35, h: 0.18 }],
    },
    {
      key: 'lugar',
      label: 'Lugar de nacimiento',
      side: 'reverso',
      hint: 'Otro dato típico de las preguntas de seguridad.',
      rects: [{ x: 0.275, y: 0.31, w: 0.23, h: 0.145 }],
    },
    {
      key: 'padres',
      label: 'Nombre de los padres',
      side: 'reverso',
      hint: 'No aporta nada a quien recibe la copia y sí a quien quiere suplantarte.',
      rects: [{ x: 0.275, y: 0.49, w: 0.28, h: 0.095 }],
    },
    {
      key: 'mrz',
      label: 'Zona MRZ (líneas inferiores)',
      side: 'reverso',
      hint: 'Las tres líneas legibles por máquina repiten número, soporte y fecha de nacimiento.',
      rects: [{ x: 0.03, y: 0.65, w: 0.94, h: 0.27 }],
    },
  ],
};

export const ZONE_KEYS: ZoneKey[] = DNI_ES.zones.map((z) => z.key);

export function zoneDef(key: ZoneKey, doc: DocumentType = DNI_ES): ZoneDef {
  const def = doc.zones.find((z) => z.key === key);
  if (!def) throw new Error(`Unknown zone: ${key}`);
  return def;
}

export function zonesForSide(side: Side, doc: DocumentType = DNI_ES): ZoneDef[] {
  return doc.zones.filter((z) => z.side === side);
}
