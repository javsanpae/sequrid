import type { DocumentInfo, DocumentType, Side, ZoneKey } from '../documents';
import type { Messages } from './en';

/**
 * Helpers that turn catalog data into display text. They take the dictionary
 * as an argument so they stay pure and testable in any language.
 */

export interface ZoneText {
  label: string;
  hint: string;
}

export const docText = (t: Messages, doc: DocumentType) => t.documents[doc.id];

/** Years a model has been issued: "2021–present", "2015–2021". */
export const modelYears = (t: Messages, doc: DocumentInfo): string =>
  doc.issuedUntil === undefined ? t.country.since(doc.issuedFrom) : t.country.years(doc.issuedFrom, doc.issuedUntil);

/** Label and hint of a zone in a document, falling back to the generic label. */
export function zoneText(t: Messages, key: ZoneKey, doc?: DocumentType): ZoneText {
  const own = doc ? (docText(t, doc).zones as Partial<Record<ZoneKey, ZoneText>>)[key] : undefined;
  return own ?? { label: t.fields[key], hint: '' };
}

export const zoneLabel = (t: Messages, key: ZoneKey, doc?: DocumentType): string => zoneText(t, key, doc).label;

export const sideLabel = (t: Messages, doc: DocumentType, side: Side): string => docText(t, doc).sides[side].label;

/** "DNI 1 · Front", "CNI 2 · Verso"… */
export const faceTitle = (t: Messages, doc: DocumentType, n: number, side: Side): string =>
  `${doc.short} ${n} · ${sideLabel(t, doc, side)}`;

/** "dni-protected", "cni-protege", or "document-protected" when countries are mixed. */
export function downloadBase(t: Messages, docs: readonly DocumentType[]): string {
  const prefix = docs.length === 1 ? docs[0].short.toLowerCase() : t.files.document;
  return `${prefix}-${t.files.protected}`;
}

/** "dni-protected-dni1-front", "dni-protegido-dni1-anverso", "cni-protege-cni2-verso"… */
export const faceFileName = (t: Messages, docs: readonly DocumentType[], doc: DocumentType, n: number, side: Side): string =>
  `${downloadBase(t, docs)}-${doc.short.toLowerCase()}${n}-${t.files.sides[side]}`;
