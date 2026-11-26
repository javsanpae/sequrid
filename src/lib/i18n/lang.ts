import { en, type Messages } from './en';
import { es } from './es';
import { fr } from './fr';

export type { Messages };

export type Lang = 'en' | 'es' | 'fr';

/** Languages offered in the UI, with their native names. */
export const LANGUAGES: readonly { code: Lang; name: string }[] = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Español' },
  { code: 'fr', name: 'Français' },
];

export const DEFAULT_LANG: Lang = 'en';

/** localStorage key of the language preference (public/theme-init.js reads it too). */
export const LANG_STORAGE_KEY = 'sequrid-lang';

export const DICTIONARIES: Record<Lang, Messages> = { en, es, fr };

export const isLang = (value: unknown): value is Lang =>
  typeof value === 'string' && LANGUAGES.some((l) => l.code === value);

/**
 * Picks the UI language: the saved preference if valid, else the first
 * browser language whose primary subtag we support ("fr-CA" → "fr"),
 * else English.
 */
export function detectLang(saved: string | null | undefined, preferred: readonly string[] = []): Lang {
  if (isLang(saved)) return saved;
  for (const tag of preferred) {
    const primary = tag.trim().toLowerCase().split(/[-_]/)[0];
    if (isLang(primary)) return primary;
  }
  return DEFAULT_LANG;
}
