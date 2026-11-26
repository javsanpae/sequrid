export interface WatermarkSettings {
  enabled: boolean;
  /** Replaces the automatic text when not empty. */
  custom: string;
  /** 0..1 */
  opacity: number;
  /** 0..1, relative size of the text. */
  size: number;
  tone: 'dark' | 'light';
}

export const DEFAULT_WATERMARK: WatermarkSettings = {
  enabled: true,
  custom: '',
  opacity: 0.45,
  size: 0.4,
  tone: 'dark',
};

/** "2026-11-26" → "26/11/2026". Returns '' for invalid input. */
export function formatDate(iso: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso.trim());
  if (!m) return '';
  return `${m[3]}/${m[2]}/${m[1]}`;
}

/** Today's date as YYYY-MM-DD in local time. */
export function todayIso(now: Date = new Date()): string {
  const p = (n: number) => String(n).padStart(2, '0');
  return `${now.getFullYear()}-${p(now.getMonth() + 1)}-${p(now.getDate())}`;
}

/** Builds the watermark line: "SOLO PARA ALQUILER · INMOBILIARIA SOL · 26/11/2026". */
export function composeWatermark(base: string, recipient: string, isoDate: string, custom = ''): string {
  const own = custom.replace(/\s+/g, ' ').trim();
  if (own) return own.toLocaleUpperCase('es-ES');
  return [base, recipient, formatDate(isoDate)]
    .map((s) => s.replace(/\s+/g, ' ').trim())
    .filter(Boolean)
    .join(' · ')
    .toLocaleUpperCase('es-ES');
}

export interface WatermarkLayout {
  fontSize: number;
  lineGap: number;
  angle: number;
  /** Lines to draw, as y offsets from the centre in the rotated frame. */
  rows: number[];
  /** Half-length of each line in the rotated frame. */
  halfSpan: number;
}

/**
 * Geometry for a tiled diagonal watermark that covers a canvas of the given
 * size completely, whatever the rotation.
 */
export function watermarkLayout(width: number, height: number, size: number): WatermarkLayout {
  const base = Math.min(width, height * 1.586);
  const fontSize = Math.max(8, Math.round(base * (0.028 + 0.05 * Math.min(1, Math.max(0, size)))));
  const lineGap = Math.round(fontSize * 2.6);
  const angle = -Math.atan2(height, width) * 0.85;
  const diag = Math.ceil(Math.hypot(width, height) / 2) + fontSize;
  const rows: number[] = [];
  for (let y = -diag; y <= diag; y += lineGap) rows.push(y);
  return { fontSize, lineGap, angle, rows, halfSpan: diag };
}
