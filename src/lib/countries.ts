import type { CountryCode } from './documents';

/**
 * Country names come from the browser's own locale data (Intl.DisplayNames),
 * so adding a nation never requires translating its name. Everything here is
 * pure and cached: the picker asks for the same names on every keystroke.
 */

const displayNames = new Map<string, Intl.DisplayNames | null>();

function regionNames(locale: string): Intl.DisplayNames | null {
  let names = displayNames.get(locale);
  if (names === undefined) {
    try {
      names = new Intl.DisplayNames([locale], { type: 'region', fallback: 'none' });
    } catch {
      // Old engine or unknown locale: callers fall back to their own names.
      names = null;
    }
    displayNames.set(locale, names);
  }
  return names;
}

/** Name of a country in a language, or undefined if the engine does not know it. */
export function regionName(code: CountryCode, locale: string): string | undefined {
  try {
    const name = regionNames(locale)?.of(code.toUpperCase());
    return name && name.toUpperCase() !== code.toUpperCase() ? name : undefined;
  } catch {
    // Invalid code (not two letters, etc.).
    return undefined;
  }
}

/** Localized country name: Intl first, then the given fallback, then the code itself. */
export const countryName = (code: CountryCode, locale: string, fallback?: string): string =>
  regionName(code, locale) ?? fallback ?? code.toUpperCase();

const nativeLanguages = new Map<string, string | undefined>();

/** Most likely language spoken in a country ("ES" → "es", "DE" → "de"), from CLDR likely subtags. */
export function nativeLanguage(code: CountryCode): string | undefined {
  const key = code.toUpperCase();
  if (!nativeLanguages.has(key)) {
    let lang: string | undefined;
    try {
      lang = new Intl.Locale('und', { region: key }).maximize().language;
      if (lang === 'und') lang = undefined;
    } catch {
      lang = undefined;
    }
    nativeLanguages.set(key, lang);
  }
  return nativeLanguages.get(key);
}

/** The country's name in its own main language ("España", "Deutschland"), if known. */
export function nativeCountryName(code: CountryCode): string | undefined {
  const lang = nativeLanguage(code);
  return lang ? regionName(code, lang) : undefined;
}
