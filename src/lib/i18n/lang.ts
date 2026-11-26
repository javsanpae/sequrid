import { en, type Messages } from './en';
import { es } from './es';
import { fr } from './fr';
import { it } from './it';

export type { Messages };

export type Lang = 'en' | 'es' | 'fr' | 'it';

/** Languages offered in the UI, with their native names. */
export const LANGUAGES: readonly { code: Lang; name: string }[] = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Español' },
  { code: 'fr', name: 'Français' },
  { code: 'it', name: 'Italiano' },
];

export const DEFAULT_LANG: Lang = 'en';

/**
 * localStorage key of an explicit language choice (public/theme-init.js reads
 * it too). Absent means "follow the browser".
 */
export const LANG_STORAGE_KEY = 'sequrid-language';

/**
 * Key used by 0.3.0, which saved any pick, even the browser's own language.
 * It is dropped once so everyone goes back to automatic detection.
 */
export const LEGACY_LANG_STORAGE_KEY = 'sequrid-lang';

export const DICTIONARIES: Record<Lang, Messages> = { en, es, fr, it };

export const isLang = (value: unknown): value is Lang =>
  typeof value === 'string' && LANGUAGES.some((l) => l.code === value);

/** First browser language whose primary subtag we support ("fr-CA" → "fr"), else English. */
export function browserLang(preferred: readonly string[] = []): Lang {
  for (const tag of preferred) {
    const primary = tag.trim().toLowerCase().split(/[-_]/)[0];
    if (isLang(primary)) return primary;
  }
  return DEFAULT_LANG;
}

/**
 * Picks the UI language: an explicit choice saved by the user if valid,
 * else the browser language (see `browserLang`).
 */
export function detectLang(saved: string | null | undefined, preferred: readonly string[] = []): Lang {
  return isLang(saved) ? saved : browserLang(preferred);
}

/**
 * What to remember when the user picks a language: nothing when it is what
 * the browser asks for anyway (so the app keeps following the browser), the
 * language otherwise. `null` means "automatic".
 */
export const preferenceFor = (choice: Lang | 'auto', preferred: readonly string[] = []): Lang | null =>
  choice === 'auto' || choice === browserLang(preferred) ? null : choice;
