import { ZONE_KEYS, type ZoneKey } from './documents';
import type { Messages } from './i18n/en';

export type UsageId = 'other' | 'rental' | 'job' | 'sale' | 'hotel' | 'bank' | 'government';

/** What a usage covers. Its label, note and watermark text live in the i18n dictionaries. */
export interface UsagePreset {
  id: UsageId;
  /** Zones that are covered by default for this use. */
  cover: ZoneKey[];
}

// Keys a document does not have are simply ignored (e.g. the 2D-Doc seal on a DNI).
const PRUDENT: ZoneKey[] = [
  'serial',
  'birthDate',
  'signature',
  'can',
  'birthPlace',
  'parents',
  'height',
  'seal',
  'taxCode',
  'birthRecord',
  'mrz',
];
const STRICT: ZoneKey[] = ['number', ...PRUDENT, 'address', 'issuer'];

export const USAGES: UsagePreset[] = [
  { id: 'other', cover: PRUDENT },
  { id: 'rental', cover: PRUDENT },
  { id: 'job', cover: STRICT },
  { id: 'sale', cover: STRICT },
  { id: 'hotel', cover: ['signature', 'can', 'birthPlace', 'parents', 'height', 'seal', 'taxCode', 'birthRecord', 'mrz'] },
  { id: 'bank', cover: ['can'] },
  { id: 'government', cover: ['can'] },
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

export type ProtectionLevel = 'low' | 'medium' | 'high';

export interface ProtectionSummary {
  usage: UsageId;
  manual: boolean;
  watermark: boolean;
  /** Recommended fields covered, or zones drawn in manual mode. */
  covered: number;
  total: number;
  /** 0..1 */
  score: number;
  level: ProtectionLevel;
}

/**
 * How well the current settings follow the recommendation for the chosen use.
 * Covering recommended fields weighs 80% and having a watermark the other 20%.
 */
export function protectionSummary(
  id: UsageId,
  selection: CoverSelection,
  opts: {
    manual: boolean;
    manualZones: number;
    watermark: boolean;
    /** Keys present on the documents in use; recommendations for other keys are ignored. */
    available?: readonly ZoneKey[];
  },
): ProtectionSummary {
  const preset = usage(id);
  const available = new Set(opts.available ?? ZONE_KEYS);
  const recommended = preset.cover.filter((k) => available.has(k));
  const total = recommended.length;
  const wm = opts.watermark ? 0.2 : 0;
  const base = { usage: id, manual: opts.manual, watermark: opts.watermark, total };

  if (opts.manual) {
    const score = Math.min(1, wm + (opts.manualZones > 0 ? 0.4 : 0));
    return { ...base, covered: opts.manualZones, score, level: score >= 0.6 ? 'medium' : 'low' };
  }

  const covered = recommended.filter((k) => selection[k]).length;
  const ratio = total === 0 ? 1 : covered / total;
  const score = Math.round((ratio * 0.8 + wm) * 100) / 100;
  const level: ProtectionLevel = score >= 0.95 ? 'high' : score >= 0.6 ? 'medium' : 'low';
  return { ...base, covered, score, level };
}

/** Sentence that explains a summary, in the language of the given dictionary. */
export function protectionMessage(s: ProtectionSummary, t: Messages): string {
  const p = t.protection;
  if (s.manual) return p.manual(s.covered) + (s.watermark ? '' : ` ${p.addWatermark}`);
  return p.covered(s.covered, s.total, t.usages[s.usage].short) + (s.watermark ? '' : ` ${p.noWatermark}`);
}
