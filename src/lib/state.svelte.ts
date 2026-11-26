import { documentKeys, documentType, type DocumentId, type DocumentType, type Side, type ZoneKey } from './documents';
import { FULL_RECT, nextRotation, type Rect, type Rotation } from './geometry';
import { getLang, m, type Messages } from './i18n/index.svelte';
import { docText, faceTitle, zoneLabel } from './i18n/text';
import { selectionFor, type CoverSelection, type UsageId } from './presets';
import { composeWatermark, DEFAULT_WATERMARK, todayIso, type WatermarkSettings } from './watermark';
import type { CoverStyle } from './effects';
import type { PdfSize } from './pdf';

/** Photo slots: document 1 or 2, front or back. */
export type FaceId = 'd1f' | 'd1b' | 'd2f' | 'd2b';
export const FACE_IDS: FaceId[] = ['d1f', 'd1b', 'd2f', 'd2b'];

export type DocNumber = 1 | 2;

export const FACE_META: Record<FaceId, { doc: DocNumber; side: Side }> = {
  d1f: { doc: 1, side: 'front' },
  d1b: { doc: 1, side: 'back' },
  d2f: { doc: 2, side: 'front' },
  d2b: { doc: 2, side: 'back' },
};

/**
 * A status line, rendered with the current dictionary so it follows
 * language changes like the rest of the UI.
 */
export type StatusMessage = ((t: Messages) => string) | null;

/** "DNI 1 · Front", "CNI 2 · Verso"… */
export const faceName = (id: FaceId, t: Messages = m()): string =>
  faceTitle(t, app.docOf(id), FACE_META[id].doc, FACE_META[id].side);
export const faceLabel = (id: FaceId, t: Messages = m()): string =>
  docText(t, app.docOf(id)).sides[FACE_META[id].side].label;
export const faceHint = (id: FaceId, t: Messages = m()): string =>
  docText(t, app.docOf(id)).sides[FACE_META[id].side].hint;

export interface ZoneInstance {
  id: string;
  /** null for zones drawn by hand. */
  key: ZoneKey | null;
  /** Relative to the card frame. */
  rect: Rect;
}

export interface Face {
  image: HTMLCanvasElement;
  rotation: Rotation;
  /** Card bounds inside the rotated image. */
  frame: Rect;
  zones: ZoneInstance[];
}

export type Tool = 'move' | 'draw' | 'frame';
export type View = 'edit' | 'compare';
export type CoverMode = 'auto' | 'manual';

let zoneSeq = 0;
export const newZoneId = () => `z${++zoneSeq}`;

export function defaultZones(doc: DocumentType, side: Side): ZoneInstance[] {
  return doc.zones.flatMap((def) =>
    def.rects
      .filter((r) => r.side === side)
      .map(({ x, y, w, h }) => ({ id: newZoneId(), key: def.key, rect: { x, y, w, h } })),
  );
}

class AppState {
  faces = $state<Record<FaceId, Face | null>>({ d1f: null, d1b: null, d2f: null, d2b: null });
  active = $state<FaceId>('d1f');
  twoDocs = $state(false);
  /** Country / document model of each ID. */
  // Custom by default: it works with any ID; the user picks a country for predefined zones.
  docTypes = $state<Record<DocNumber, DocumentId>>({ 1: 'custom', 2: 'custom' });

  usage = $state<UsageId>('other');
  recipient = $state('');
  date = $state(todayIso());

  coverMode = $state<CoverMode>('auto');
  selection = $state<CoverSelection>(selectionFor('other'));
  coverStyle = $state<CoverStyle>('black');

  watermark = $state<WatermarkSettings>({ ...DEFAULT_WATERMARK });
  grayscale = $state(false);
  pdfSize = $state<PdfSize>('real');

  view = $state<View>('edit');
  tool = $state<Tool>('move');
  zoom = $state(1);
  selectedZone = $state<string | null>(null);
  status = $state<StatusMessage>(null);

  get slots(): FaceId[] {
    return this.twoDocs ? FACE_IDS : FACE_IDS.slice(0, 2);
  }

  get loaded(): FaceId[] {
    return this.slots.filter((id) => this.faces[id]);
  }

  get activeFace(): Face | null {
    return this.faces[this.active];
  }

  docOf(id: FaceId): DocumentType {
    return documentType(this.docTypes[FACE_META[id].doc]);
  }

  /** Document models of the IDs in use, without repeats. */
  get activeDocs(): DocumentType[] {
    const ids = this.twoDocs ? [this.docTypes[1], this.docTypes[2]] : [this.docTypes[1]];
    return [...new Set(ids)].map(documentType);
  }

  /** Data fields that exist on the documents in use. */
  get availableKeys(): ZoneKey[] {
    return [...new Set(this.activeDocs.flatMap(documentKeys))];
  }

  /** Changes the country of an ID. Its automatic zones move to the new layout; drawn ones stay. */
  setDocType(doc: DocNumber, id: DocumentId) {
    if (this.docTypes[doc] === id) return;
    this.docTypes[doc] = id;
    for (const faceId of FACE_IDS.filter((f) => FACE_META[f].doc === doc)) {
      if (this.faces[faceId]) this.resetZones(faceId);
    }
    this.selectedZone = null;
    // A custom document has no predefined zones: start ready to draw them.
    if (documentType(id).custom) this.tool = 'draw';
  }

  /** Follows the UI language: the default text comes from the current dictionary. */
  get watermarkText(): string {
    return composeWatermark(m().usages[this.usage].watermark, this.recipient, this.date, this.watermark.custom, getLang());
  }

  /** Zones that are actually applied to a face with the current settings. */
  visibleZones(face: Face): ZoneInstance[] {
    return face.zones.filter((z) => (z.key === null ? true : this.coverMode === 'auto' && this.selection[z.key]));
  }

  get manualZoneCount(): number {
    return this.loaded.reduce((n, id) => n + (this.faces[id]?.zones.filter((z) => z.key === null).length ?? 0), 0);
  }

  setUsage(id: UsageId) {
    this.usage = id;
    this.selection = selectionFor(id);
  }

  setFace(id: FaceId, image: HTMLCanvasElement) {
    // Enable the second ID first: it inherits the first one's document, which decides the zones.
    if (FACE_META[id].doc === 2 && !this.twoDocs) this.setTwoDocs(true);
    this.faces[id] = { image, rotation: 0, frame: { ...FULL_RECT }, zones: defaultZones(this.docOf(id), FACE_META[id].side) };
    this.active = id;
    this.selectedZone = null;
    this.zoom = 1;
    if (this.tool === 'frame') this.tool = 'move';
    if (this.docOf(id).custom) this.tool = 'draw';
  }

  removeFace(id: FaceId) {
    this.faces[id] = null;
    this.selectedZone = null;
    if (this.active === id) this.view = 'edit';
  }

  /** Puts files into free slots in order, enabling the second ID if needed. Returns the slots used. */
  freeSlotsFor(count: number, preferred: FaceId): FaceId[] {
    if (count === 1) return [preferred];
    const order = [preferred, ...FACE_IDS.filter((id) => id !== preferred)];
    const free = order.filter((id) => !this.faces[id]);
    return free.slice(0, count);
  }

  rotate(id: FaceId) {
    const f = this.faces[id];
    if (!f) return;
    f.rotation = nextRotation(f.rotation);
    f.frame = { ...FULL_RECT };
  }

  resetZones(id: FaceId) {
    const f = this.faces[id];
    if (!f) return;
    f.zones = [...defaultZones(this.docOf(id), FACE_META[id].side), ...f.zones.filter((z) => z.key === null)];
    this.selectedZone = null;
  }

  removeZone(faceId: FaceId, zoneId: string) {
    const f = this.faces[faceId];
    if (!f) return;
    const z = f.zones.find((zz) => zz.id === zoneId);
    if (!z) return;
    if (z.key === null) {
      f.zones = f.zones.filter((zz) => zz.id !== zoneId);
    } else {
      // Automatic zones follow their checkbox: removing one uncovers that field.
      this.selection[z.key] = false;
      const key = z.key;
      const doc = this.docOf(faceId);
      this.status = (t) => t.status.zoneVisible(zoneLabel(t, key, doc));
    }
    if (this.selectedZone === zoneId) this.selectedZone = null;
  }

  setTwoDocs(on: boolean) {
    // A second ID usually comes from the same country as the first one.
    if (on && !this.faces.d2f && !this.faces.d2b) this.docTypes[2] = this.docTypes[1];
    this.twoDocs = on;
    if (!on && FACE_META[this.active].doc === 2) this.active = 'd1f';
  }
}

export const app = new AppState();
