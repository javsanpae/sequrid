import { DNI_ES, zoneDef, zonesForSide, type Side, type ZoneKey } from './documents';
import { FULL_RECT, nextRotation, type Rect, type Rotation } from './geometry';
import { selectionFor, usage, type CoverSelection, type UsageId } from './presets';
import { composeWatermark, DEFAULT_WATERMARK, todayIso, type WatermarkSettings } from './watermark';
import type { CoverStyle } from './effects';
import type { PdfSize } from './pdf';

export type FaceId = 'd1a' | 'd1r' | 'd2a' | 'd2r';
export const FACE_IDS: FaceId[] = ['d1a', 'd1r', 'd2a', 'd2r'];

export const FACE_META: Record<FaceId, { doc: 1 | 2; side: Side; label: string; hint: string }> = {
  d1a: { doc: 1, side: 'anverso', label: 'Anverso', hint: 'Cara con la foto' },
  d1r: { doc: 1, side: 'reverso', label: 'Reverso', hint: 'Cara con el domicilio' },
  d2a: { doc: 2, side: 'anverso', label: 'Anverso', hint: 'Cara con la foto' },
  d2r: { doc: 2, side: 'reverso', label: 'Reverso', hint: 'Cara con el domicilio' },
};

export const faceName = (id: FaceId) => `DNI ${FACE_META[id].doc} · ${FACE_META[id].label}`;

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

export function defaultZones(side: Side): ZoneInstance[] {
  return zonesForSide(side, DNI_ES).flatMap((def) =>
    def.rects.map((rect) => ({ id: newZoneId(), key: def.key, rect: { ...rect } })),
  );
}

class AppState {
  faces = $state<Record<FaceId, Face | null>>({ d1a: null, d1r: null, d2a: null, d2r: null });
  active = $state<FaceId>('d1a');
  twoDocs = $state(false);

  usage = $state<UsageId>('otro');
  recipient = $state('');
  date = $state(todayIso());

  coverMode = $state<CoverMode>('auto');
  selection = $state<CoverSelection>(selectionFor('otro'));
  coverStyle = $state<CoverStyle>('black');

  watermark = $state<WatermarkSettings>({ ...DEFAULT_WATERMARK });
  grayscale = $state(false);
  pdfSize = $state<PdfSize>('real');

  view = $state<View>('edit');
  tool = $state<Tool>('move');
  zoom = $state(1);
  selectedZone = $state<string | null>(null);
  status = $state('');

  get slots(): FaceId[] {
    return this.twoDocs ? FACE_IDS : FACE_IDS.slice(0, 2);
  }

  get loaded(): FaceId[] {
    return this.slots.filter((id) => this.faces[id]);
  }

  get activeFace(): Face | null {
    return this.faces[this.active];
  }

  get watermarkText(): string {
    return composeWatermark(usage(this.usage).watermark, this.recipient, this.date, this.watermark.custom);
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
    this.faces[id] = { image, rotation: 0, frame: { ...FULL_RECT }, zones: defaultZones(FACE_META[id].side) };
    if (FACE_META[id].doc === 2) this.twoDocs = true;
    this.active = id;
    this.selectedZone = null;
    this.zoom = 1;
    if (this.tool === 'frame') this.tool = 'move';
  }

  removeFace(id: FaceId) {
    this.faces[id] = null;
    this.selectedZone = null;
    if (this.active === id) this.view = 'edit';
  }

  /** Puts files into free slots in order, enabling the second DNI if needed. Returns the slots used. */
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
    f.zones = [...defaultZones(FACE_META[id].side), ...f.zones.filter((z) => z.key === null)];
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
      this.status = `${zoneDef(z.key).label} queda visible. Vuelve a marcarlo en «Qué tapar» si quieres taparlo.`;
    }
    if (this.selectedZone === zoneId) this.selectedZone = null;
  }

  setTwoDocs(on: boolean) {
    this.twoDocs = on;
    if (!on && FACE_META[this.active].doc === 2) this.active = 'd1a';
  }
}

export const app = new AppState();
