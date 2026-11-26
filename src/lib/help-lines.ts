import type { CountryCode } from './documents';

/**
 * Official places to turn to when someone misuses your ID, by country.
 * Only add entries checked on the service's official website. Names of
 * services are proper nouns and are not translated; what each one does is
 * described in the i18n dictionaries (`info.help.lines`).
 */
export type HelpLineId = 'es-incibe' | 'fr-17cyber' | 'it-postale' | 'gb-reportfraud' | 'us-ftc';

export type ContactKind = 'phone' | 'whatsapp' | 'telegram' | 'web';

export interface HelpContact {
  kind: ContactKind;
  /** What is shown: a number, a handle or a domain. */
  value: string;
  href: string;
  /** Free of charge, as stated by the service. */
  free?: boolean;
}

export interface HelpLine {
  id: HelpLineId;
  country: CountryCode;
  service: string;
  /** Who runs it, when it is not obvious from the name. */
  operator?: string;
  contacts: HelpContact[];
  /** National emergency numbers, for crimes in progress. */
  emergency: string[];
  /** Emergency number by SMS for people who cannot speak or hear, if any. */
  emergencySms?: string;
  /** Official page the details were checked against. */
  source: string;
}

export const HELP_LINES: HelpLine[] = [
  {
    id: 'es-incibe',
    country: 'ES',
    service: 'Tu Ayuda en Ciberseguridad',
    operator: 'INCIBE',
    contacts: [
      { kind: 'phone', value: '017', href: 'tel:017', free: true },
      { kind: 'whatsapp', value: '900 116 117', href: 'https://wa.me/34900116117' },
      { kind: 'telegram', value: '@INCIBE017', href: 'https://t.me/INCIBE017' },
      { kind: 'web', value: 'incibe.es', href: 'https://www.incibe.es/linea-de-ayuda-en-ciberseguridad' },
    ],
    emergency: ['112'],
    source: 'https://www.incibe.es/linea-de-ayuda-en-ciberseguridad',
  },
  {
    id: 'fr-17cyber',
    country: 'FR',
    service: '17Cyber',
    operator: 'Police nationale · Gendarmerie nationale · Cybermalveillance.gouv.fr',
    contacts: [
      { kind: 'web', value: '17cyber.gouv.fr', href: 'https://www.17cyber.gouv.fr/' },
    ],
    emergency: ['17', '112'],
    emergencySms: '114',
    source: 'https://www.17cyber.gouv.fr/',
  },
  {
    id: 'it-postale',
    country: 'IT',
    service: 'Commissariato di P.S. online',
    operator: 'Polizia Postale e per la Sicurezza Cibernetica',
    contacts: [{ kind: 'web', value: 'commissariatodips.it', href: 'https://www.commissariatodips.it/' }],
    emergency: ['112', '113'],
    source: 'https://www.commissariatodips.it/',
  },
  {
    id: 'gb-reportfraud',
    country: 'GB',
    // Formerly Action Fraud. Covers England, Wales and Northern Ireland;
    // in Scotland, crimes are reported to Police Scotland on 101.
    service: 'Report Fraud',
    operator: 'Police (England, Wales and Northern Ireland)',
    contacts: [
      { kind: 'phone', value: '0300 123 2040', href: 'tel:03001232040' },
      { kind: 'web', value: 'reportfraud.police.uk', href: 'https://www.reportfraud.police.uk/' },
    ],
    emergency: ['999'],
    source: 'https://www.reportfraud.police.uk/contact-us/',
  },
  {
    id: 'us-ftc',
    country: 'US',
    service: 'IdentityTheft.gov',
    operator: 'Federal Trade Commission (FTC)',
    contacts: [
      { kind: 'web', value: 'identitytheft.gov', href: 'https://www.identitytheft.gov/' },
      { kind: 'phone', value: '1-877-382-4357', href: 'tel:1-877-382-4357' },
    ],
    emergency: ['911'],
    source: 'https://www.ftc.gov/about-ftc/contact',
  },
];

/** Help lines with the given countries first (e.g. those of the documents in use), then the rest in order. */
export function sortHelpLines(lines: readonly HelpLine[], first: readonly CountryCode[], name: (code: CountryCode) => string): HelpLine[] {
  const rank = (l: HelpLine) => {
    const i = first.indexOf(l.country);
    return i === -1 ? first.length : i;
  };
  return [...lines].sort((a, b) => rank(a) - rank(b) || name(a.country).localeCompare(name(b.country)));
}
