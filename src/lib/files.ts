import { documentType } from './documents';
import { documentCountryName } from './document-search';
import { getLang } from './i18n/index.svelte';
import { faceTitle } from './i18n/text';
import { ACCEPTED_TYPES, loadImageFile, UnsupportedImageError } from './image';
import { sampleCards } from './sample';
import { app, FACE_META, type FaceId } from './state.svelte';

/** Loads photos into slots: one file replaces the target, several fill free slots in order. */
export async function loadFiles(files: File[], target: FaceId): Promise<void> {
  const images = files.filter((f) => !f.type || f.type.startsWith('image/'));
  if (!images.length) {
    app.status = (t) => t.status.notImage;
    return;
  }
  const slots = app.freeSlotsFor(images.length, target);
  if (!slots.length) {
    app.status = (t) => t.status.noFreeSlots;
    return;
  }
  const loaded: FaceId[] = [];
  for (let i = 0; i < slots.length; i++) {
    try {
      app.setFace(slots[i], await loadImageFile(images[i]));
      loaded.push(slots[i]);
    } catch (e) {
      const reason = e instanceof UnsupportedImageError ? e.reason : 'unreadable';
      app.status = (t) => t.errors[reason];
      return;
    }
  }
  if (loaded.length) app.active = loaded[0];
  const skipped = images.length - loaded.length;
  if (loaded.length === 1) {
    const id = loaded[0];
    const doc = app.docOf(id);
    app.status = (t) => t.status.loadedOne(faceTitle(t, doc, FACE_META[id].doc, FACE_META[id].side));
  } else {
    const count = loaded.length;
    app.status = (t) => t.status.loadedMany(count, skipped);
  }
}

/** Opens the system file picker (on phones it also offers the camera). */
export function pickFiles(target: FaceId): void {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = [...ACCEPTED_TYPES, 'image/*'].join(',');
  input.multiple = true;
  input.addEventListener('change', () => {
    const files = Array.from(input.files ?? []);
    if (files.length) void loadFiles(files, target);
  });
  input.click();
}

/** Loads a fictitious card of the country chosen for the first ID. */
export function loadSample(): void {
  const doc = documentType(app.docTypes[1]);
  const { front, back } = sampleCards(doc.id);
  app.setFace('d1f', front);
  app.setFace('d1b', back);
  app.active = 'd1f';
  // Same country name as the picker (Intl first, then the dictionary).
  app.status = (t) => t.status.sample(doc.short, documentCountryName(doc, getLang()));
}
