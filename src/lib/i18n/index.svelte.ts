import {
  browserLang,
  DICTIONARIES,
  isLang,
  LANG_STORAGE_KEY,
  LEGACY_LANG_STORAGE_KEY,
  preferenceFor,
  type Lang,
  type Messages,
} from './lang';

export * from './lang';

function savedLang(): string | null {
  try {
    localStorage.removeItem(LEGACY_LANG_STORAGE_KEY);
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

let saved = $state<Lang | null>(null);
let browser = $state<Lang>(browserLang(browserLangs()));
{
  const value = savedLang();
  saved = isLang(value) ? value : null;
}

/** Current UI language. Reactive: reading it inside a template or $derived tracks changes. */
export const getLang = (): Lang => saved ?? browser;

/** Language the browser asks for, used in automatic mode. */
export const getBrowserLang = (): Lang => browser;

/** True when no explicit choice is saved and the app follows the browser language. */
export const isAutoLang = (): boolean => saved === null;

/** Messages of the current language. Reactive, like `getLang()`. */
export const m = (): Messages => DICTIONARIES[getLang()];

/** Keeps `<html lang>`, the title and the description in sync with the current language. */
export function syncDocument(): void {
  if (typeof document === 'undefined') return;
  const lang = getLang();
  const t = DICTIONARIES[lang];
  document.documentElement.lang = lang;
  document.title = t.meta.title;
  document.querySelector('meta[name="description"]')?.setAttribute('content', t.meta.description);
}

/**
 * Switches the UI language. Choosing "auto", or the language the browser
 * already asks for, forgets any saved choice so the app keeps following the
 * browser; any other language is remembered (a preference, like the theme).
 */
export function setLang(choice: Lang | 'auto'): void {
  saved = preferenceFor(choice, browserLangs());
  try {
    if (saved) localStorage.setItem(LANG_STORAGE_KEY, saved);
    else localStorage.removeItem(LANG_STORAGE_KEY);
  } catch {
    /* private mode: the choice just won't persist */
  }
  syncDocument();
}

// Follow changes of the browser language while in automatic mode.
if (typeof window !== 'undefined') {
  window.addEventListener('languagechange', () => {
    browser = browserLang(browserLangs());
    syncDocument();
  });
}
