import { documentType } from './documents';
import { ACCEPTED_TYPES, loadImageFile } from './image';
import { sampleCards } from './sample';
import { app, faceName, type FaceId } from './state.svelte';

/** Loads photos into slots: one file replaces the target, several fill free slots in order. */
export async function loadFiles(files: File[], target: FaceId): Promise<void> {
  const images = files.filter((f) => !f.type || f.type.startsWith('image/'));
  if (!images.length) {
    app.status = 'Eso no parece una imagen. Usa una foto JPG, PNG o WebP.';
    return;
  }
  const slots = app.freeSlotsFor(images.length, target);
  if (!slots.length) {
    app.status = 'No quedan huecos libres. Quita una cara para subir otra.';
    return;
  }
  const loaded: FaceId[] = [];
  for (let i = 0; i < slots.length; i++) {
    try {
      app.setFace(slots[i], await loadImageFile(images[i]));
      loaded.push(slots[i]);
    } catch (e) {
      app.status = e instanceof Error ? e.message : 'No se ha podido leer la imagen.';
      return;
    }
  }
  if (loaded.length) app.active = loaded[0];
  const skipped = images.length - loaded.length;
  app.status =
    loaded.length === 1
      ? `Foto cargada en ${faceName(loaded[0])}. Comprueba que las zonas caen en su sitio.`
      : `${loaded.length} fotos colocadas en los huecos libres.` +
        (skipped > 0 ? ` ${skipped} no cabían.` : '');
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
  const { anverso, reverso } = sampleCards(doc.id);
  app.setFace('d1a', anverso);
  app.setFace('d1r', reverso);
  app.active = 'd1a';
  app.status = `${doc.short} de ejemplo (${doc.countryName}) cargado en las dos caras. Los datos son ficticios.`;
}
