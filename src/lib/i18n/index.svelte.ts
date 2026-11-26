import { detectLang, DICTIONARIES, LANG_STORAGE_KEY, type Lang, type Messages } from './lang';

export * from './lang';

function savedLang(): string | null {
  try {
    return localStorage.getItem(LANG_STORAGE_KEY);
  } catch {
    // No storage (private mode, tests): fall back to the browser languages.
    return null;
  }
}

function browserLangs(): readonly string[] {
  if (typeof navigator === 'undefined') return [];
  if (navigator.languages?.length) return navigator.languages;
  return navigator.language ? [navigator.language] : [];
}

let current = $state<Lang>(detectLang(savedLang(), browserLangs()));

/** Current UI language. Reactive: reading it inside a template or $derived tracks changes. */
export const getLang = (): Lang => current;

/** Messages of the current language. Reactive, like `getLang()`. */
export const m = (): Messages => DICTIONARIES[current];

/** Keeps `<html lang>`, the title and the description in sync with the current language. */
export function syncDocument(): void {
  if (typeof document === 'undefined') return;
  const t = DICTIONARIES[current];
  document.documentElement.lang = current;
  document.title = t.meta.title;
  document.querySelector('meta[name="description"]')?.setAttribute('content', t.meta.description);
}

/** Switches the UI language and remembers it (a preference, like the theme). */
export function setLang(lang: Lang): void {
  current = lang;
  try {
    localStorage.setItem(LANG_STORAGE_KEY, lang);
  } catch {
    /* private mode: the choice just won't persist */
  }
  syncDocument();
}
