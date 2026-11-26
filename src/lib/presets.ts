import { ZONE_KEYS, type ZoneKey } from './documents';

export type UsageId = 'otro' | 'alquiler' | 'trabajo' | 'compraventa' | 'hotel' | 'banco' | 'administracion';

export interface UsagePreset {
  id: UsageId;
  label: string;
  /** Short name used in sentences ("recomendados para …"). */
  short: string;
  /** Default watermark text, before recipient and date. */
  watermark: string;
  /** Zones that are covered by default for this use. */
  cover: ZoneKey[];
  note: string;
}

const PRUDENT: ZoneKey[] = ['soporte', 'nacimiento', 'firma', 'can', 'lugar', 'padres', 'mrz'];
const STRICT: ZoneKey[] = ['numero', ...PRUDENT, 'domicilio'];

export const USAGES: UsagePreset[] = [
  {
    id: 'otro',
    label: 'Otro / no lo tengo claro',
    short: 'cualquier uso',
    watermark: 'Copia de uso limitado',
    cover: PRUDENT,
    note: 'Opción prudente: se tapa lo que casi nunca hace falta. Si te rechazan la copia, destapa solo lo que te pidan.',
  },
  {
    id: 'alquiler',
    label: 'Alquiler de vivienda',
    short: 'alquiler',
    watermark: 'Solo para alquiler',
    cover: PRUDENT,
    note: 'Para alquilar suelen bastar el nombre, el número de DNI y la foto. Lo demás se tapa.',
  },
  {
    id: 'trabajo',
    label: 'Oferta de trabajo o selección',
    short: 'proceso de selección',
    watermark: 'Solo para proceso de selección',
    cover: STRICT,
    note: 'Nadie necesita tu DNI antes de firmar un contrato. Si te lo piden antes de la entrevista, desconfía: solo quedan visibles nombre y foto.',
  },
  {
    id: 'compraventa',
    label: 'Compraventa (Wallapop, Vinted…)',
    short: 'compraventa',
    watermark: 'Solo para verificar compraventa',
    cover: STRICT,
    note: 'Un comprador o vendedor particular no necesita tu DNI. Que insista en verlo es una señal típica de estafa.',
  },
  {
    id: 'hotel',
    label: 'Hotel o alojamiento',
    short: 'hotel',
    watermark: 'Solo para registro de viajeros',
    cover: ['firma', 'can', 'lugar', 'padres', 'mrz'],
    note: 'El registro de viajeros pide número, soporte, fecha de nacimiento y domicilio, así que se quedan visibles.',
  },
  {
    id: 'banco',
    label: 'Banco o financiera',
    short: 'banco',
    watermark: 'Solo para identificación bancaria',
    cover: ['can'],
    note: 'Los bancos deben identificarte con el documento completo. Tu protección aquí es la marca de agua.',
  },
  {
    id: 'administracion',
    label: 'Administración pública',
    short: 'trámite administrativo',
    watermark: 'Solo para trámite administrativo',
    cover: ['can'],
    note: 'La Administración suele necesitar la copia completa. Solo se tapa el CAN y se deja claro el uso.',
  },
];

export function usage(id: UsageId): UsagePreset {
  const u = USAGES.find((p) => p.id === id);
  if (!u) throw new Error(`Unknown usage: ${id}`);
  return u;
}

export type CoverSelection = Record<ZoneKey, boolean>;

/** Checkbox state for a use: recommended zones on, the rest off. */
export function selectionFor(id: UsageId): CoverSelection {
  const rec = new Set(usage(id).cover);
  return Object.fromEntries(ZONE_KEYS.map((k) => [k, rec.has(k)])) as CoverSelection;
}

export type ProtectionLevel = 'baja' | 'media' | 'alta';

export interface ProtectionSummary {
  covered: number;
  total: number;
  /** 0..1 */
  score: number;
  level: ProtectionLevel;
  message: string;
}

/**
 * How well the current settings follow the recommendation for the chosen use.
 * Covering recommended fields weighs 80% and having a watermark the other 20%.
 */
export function protectionSummary(
  id: UsageId,
  selection: CoverSelection,
  opts: { manual: boolean; manualZones: number; watermark: boolean },
): ProtectionSummary {
  const preset = usage(id);
  const total = preset.cover.length;
  const wm = opts.watermark ? 0.2 : 0;

  if (opts.manual) {
    const score = Math.min(1, wm + (opts.manualZones > 0 ? 0.4 : 0));
    const zones = opts.manualZones === 1 ? '1 zona dibujada' : `${opts.manualZones} zonas dibujadas`;
    return {
      covered: opts.manualZones,
      total,
      score,
      level: score >= 0.6 ? 'media' : 'baja',
      message: `Modo manual: ${zones}. Revisa que tapan lo que quieres.${opts.watermark ? '' : ' Añade la marca de agua.'}`,
    };
  }

  const covered = preset.cover.filter((k) => selection[k]).length;
  const ratio = total === 0 ? 1 : covered / total;
  const score = Math.round((ratio * 0.8 + wm) * 100) / 100;
  const level: ProtectionLevel = score >= 0.95 ? 'alta' : score >= 0.6 ? 'media' : 'baja';
  let message = `Has tapado ${covered} de ${total} datos recomendados para ${preset.short}.`;
  if (!opts.watermark) message += ' Sin marca de agua la copia sirve para cualquier cosa.';
  return { covered, total, score, level, message };
}
