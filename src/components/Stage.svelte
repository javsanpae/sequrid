<script lang="ts">
  import { zoneDef } from '../lib/documents';
  import { renderSettings } from '../lib/export';
  import { clamp, clampRect, moveRect, rectFromPoints, resizeRect, type Handle, type Rect } from '../lib/geometry';
  import { renderOriginal, renderProtected, rotatedImage } from '../lib/render';
  import { app, newZoneId, type FaceId, type ZoneInstance } from '../lib/state.svelte';
  import Icon from './Icon.svelte';

  let { faceId, maxHeight }: { faceId: FaceId; maxHeight: number } = $props();

  const face = $derived(app.faces[faceId]!);
  const framing = $derived(app.tool === 'frame');
  const rot = $derived(rotatedImage(face.image, face.rotation));
  const aspect = $derived(
    framing ? rot.width / rot.height : (face.frame.w * rot.width) / Math.max(1e-6, face.frame.h * rot.height),
  );

  let boxWidth = $state(0);
  const fitWidth = $derived(Math.max(120, Math.min(boxWidth - 28, maxHeight * aspect)));
  const dispW = $derived(Math.round(fitWidth * app.zoom));
  const dispH = $derived(Math.round(dispW / aspect));

  let canvas: HTMLCanvasElement;
  let overlay: HTMLDivElement;
  let raf = 0;

  // Re-render the preview whenever anything that affects it changes.
  $effect(() => {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const target = Math.max(200, Math.round(dispW * dpr));
    const snapshot = { image: face.image, rotation: face.rotation, frame: { ...face.frame } };
    const isFraming = framing;
    const settings = renderSettings(face);
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(() => {
      if (!canvas) return;
      if (isFraming) renderOriginal({ ...snapshot, frame: { x: 0, y: 0, w: 1, h: 1 } }, target, canvas);
      else renderProtected(snapshot, settings, target, canvas);
    });
    return () => cancelAnimationFrame(raf);
  });

  const zones = $derived(framing ? [] : app.visibleZones(face));
  const selected = $derived(zones.find((z) => z.id === app.selectedZone) ?? null);

  const zoneLabel = (z: ZoneInstance) => (z.key ? zoneDef(z.key).label : 'Zona propia');

  type Drag =
    | { kind: 'move' | 'resize' | 'draw'; zone: ZoneInstance; handle?: Handle; sx: number; sy: number; start: Rect }
    | { kind: 'frame-move' | 'frame-resize'; handle?: Handle; sx: number; sy: number; start: Rect };
  let drag: Drag | null = null;
  let dragging = $state(false);

  function point(e: PointerEvent) {
    const r = overlay.getBoundingClientRect();
    return { x: clamp((e.clientX - r.left) / r.width, 0, 1), y: clamp((e.clientY - r.top) / r.height, 0, 1) };
  }

  function begin(e: PointerEvent, d: Drag) {
    if (e.button !== 0) return;
    e.preventDefault();
    e.stopPropagation();
    overlay.focus({ preventScroll: true });
    overlay.setPointerCapture(e.pointerId);
    drag = d;
    dragging = true;
  }

  function onZoneDown(e: PointerEvent, z: ZoneInstance) {
    if (app.tool !== 'move') return;
    app.selectedZone = z.id;
    const p = point(e);
    begin(e, { kind: 'move', zone: z, sx: p.x, sy: p.y, start: { ...z.rect } });
  }

  function onHandleDown(e: PointerEvent, z: ZoneInstance, handle: Handle) {
    const p = point(e);
    begin(e, { kind: 'resize', zone: z, handle, sx: p.x, sy: p.y, start: { ...z.rect } });
  }

  function onFrameDown(e: PointerEvent, handle?: Handle) {
    const p = point(e);
    begin(e, { kind: handle ? 'frame-resize' : 'frame-move', handle, sx: p.x, sy: p.y, start: { ...face.frame } });
  }

  function onOverlayDown(e: PointerEvent) {
    if (app.tool === 'draw') {
      const p = point(e);
      const zone: ZoneInstance = { id: newZoneId(), key: null, rect: { x: p.x, y: p.y, w: 0, h: 0 } };
      face.zones.push(zone);
      const added = face.zones[face.zones.length - 1];
      app.selectedZone = zone.id;
      begin(e, { kind: 'draw', zone: added, sx: p.x, sy: p.y, start: { ...zone.rect } });
    } else if (app.tool === 'move') {
      app.selectedZone = null;
    }
  }

  function onMove(e: PointerEvent) {
    if (!drag) return;
    const p = point(e);
    const dx = p.x - drag.sx;
    const dy = p.y - drag.sy;
    switch (drag.kind) {
      case 'move':
        drag.zone.rect = moveRect(drag.start, dx, dy);
        break;
      case 'resize':
        drag.zone.rect = resizeRect(drag.start, drag.handle!, dx, dy, 0.01);
        break;
      case 'draw':
        drag.zone.rect = clampRect(rectFromPoints(drag.sx, drag.sy, p.x, p.y));
        break;
      case 'frame-move':
        face.frame = moveRect(drag.start, dx, dy);
        break;
      case 'frame-resize':
        face.frame = resizeRect(drag.start, drag.handle!, dx, dy, 0.1);
        break;
    }
  }

  function onUp() {
    if (drag?.kind === 'draw') {
      const r = drag.zone.rect;
      if (r.w < 0.012 || r.h < 0.012) app.removeZone(faceId, drag.zone.id);
      else app.status = 'Zona añadida. Arrástrala para moverla o usa las esquinas para ajustarla.';
    }
    drag = null;
    dragging = false;
  }

  function onKey(e: KeyboardEvent) {
    if (framing) return;
    if (e.key === 'Tab' && zones.length && app.tool === 'move') {
      const i = zones.findIndex((z) => z.id === app.selectedZone);
      const next = i === -1 ? (e.shiftKey ? zones.length - 1 : 0) : i + (e.shiftKey ? -1 : 1);
      if (next >= 0 && next < zones.length) {
        e.preventDefault();
        app.selectedZone = zones[next].id;
        app.status = `${zoneLabel(zones[next])} seleccionada.`;
      } else {
        app.selectedZone = null;
      }
      return;
    }
    if (!selected) return;
    const step = e.altKey ? 0.002 : 0.008;
    const arrows: Record<string, [number, number]> = {
      ArrowLeft: [-step, 0],
      ArrowRight: [step, 0],
      ArrowUp: [0, -step],
      ArrowDown: [0, step],
    };
    if (e.key in arrows) {
      e.preventDefault();
      const [dx, dy] = arrows[e.key];
      selected.rect = e.shiftKey ? resizeRect(selected.rect, 'se', dx, dy, 0.01) : moveRect(selected.rect, dx, dy);
    } else if (e.key === 'Delete' || e.key === 'Backspace') {
      e.preventDefault();
      app.removeZone(faceId, selected.id);
    } else if (e.key === 'Escape') {
      app.selectedZone = null;
    }
  }

  const pct = (r: Rect) => `left:${r.x * 100}%;top:${r.y * 100}%;width:${r.w * 100}%;height:${r.h * 100}%`;
  // Top-right corner holds the remove button.
  const CORNERS: Handle[] = ['nw', 'sw', 'se'];
  const ALL: Handle[] = ['nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w'];
</script>

<div class="scroller" bind:clientWidth={boxWidth} style:max-height="{maxHeight + 28}px">
  <div class="sheet" style:width="{dispW}px" style:height="{dispH}px">
    <canvas bind:this={canvas} style:width="{dispW}px" style:height="{dispH}px" aria-hidden="true"></canvas>

    <!-- svelte-ignore a11y_no_noninteractive_tabindex, a11y_no_noninteractive_element_interactions -->
    <div
      bind:this={overlay}
      class="overlay tool-{app.tool}"
      class:dragging
      role="application"
      tabindex="0"
      aria-label={framing
        ? 'Encuadre: arrastra el marco hasta los bordes de la tarjeta'
        : 'Lienzo de edición. Tab recorre las zonas, flechas para moverlas, Mayús más flechas para cambiar su tamaño y Supr para quitarlas.'}
      onpointerdown={onOverlayDown}
      onpointermove={onMove}
      onpointerup={onUp}
      onpointercancel={onUp}
      onkeydown={onKey}
    >
      {#if framing}
        <!-- svelte-ignore a11y_no_static_element_interactions -->
        <div class="frame" style={pct(face.frame)} onpointerdown={(e) => onFrameDown(e)}>
          <span class="frame-tip">Ajusta el marco a los bordes de la tarjeta</span>
          {#each ALL as h (h)}
            <!-- svelte-ignore a11y_no_static_element_interactions -->
            <span class="handle h-{h}" onpointerdown={(e) => onFrameDown(e, h)}></span>
          {/each}
        </div>
      {:else}
        {#each zones as z (z.id)}
          <!-- svelte-ignore a11y_no_static_element_interactions -->
          <div
            class="zone"
            class:selected={z.id === app.selectedZone}
            class:custom={z.key === null}
            style={pct(z.rect)}
            title={zoneLabel(z)}
            onpointerdown={(e) => onZoneDown(e, z)}
          >
            {#if z.id === app.selectedZone && app.tool === 'move'}
              <span class="tag">{zoneLabel(z)}</span>
              <button
                type="button"
                class="remove"
                aria-label="Quitar {zoneLabel(z)}"
                onpointerdown={(e) => e.stopPropagation()}
                onclick={() => app.removeZone(faceId, z.id)}><Icon name="x" size={12} stroke={3} /></button
              >
              {#each CORNERS as h (h)}
                <!-- svelte-ignore a11y_no_static_element_interactions -->
                <span class="handle h-{h}" onpointerdown={(e) => onHandleDown(e, z, h)}></span>
              {/each}
            {/if}
          </div>
        {/each}
      {/if}
    </div>
  </div>
</div>

<style>
  .scroller {
    overflow: auto;
    display: grid;
    padding: 14px;
    border-radius: 12px;
    background-color: var(--surface-2);
    background-image: linear-gradient(45deg, var(--checker) 25%, transparent 25%, transparent 75%, var(--checker) 75%),
      linear-gradient(45deg, var(--checker) 25%, transparent 25%, transparent 75%, var(--checker) 75%);
    background-size: 20px 20px;
    background-position: 0 0, 10px 10px;
    overscroll-behavior: contain;
  }
  .sheet {
    position: relative;
    margin: auto;
    flex: none;
  }
  canvas {
    display: block;
    border-radius: 6px;
    box-shadow: 0 2px 12px rgb(0 0 0 / 0.18);
  }
  .overlay {
    position: absolute;
    inset: 0;
    touch-action: pan-x pan-y pinch-zoom;
    border-radius: 6px;
  }
  .overlay:focus-visible {
    outline: 2px solid var(--accent);
    outline-offset: 3px;
    box-shadow: none;
  }
  .overlay.tool-draw,
  .overlay.tool-frame,
  .overlay.dragging {
    touch-action: none;
  }
  .tool-draw {
    cursor: crosshair;
  }
  .zone {
    position: absolute;
    border: 1.5px dashed rgb(255 255 255 / 0.9);
    outline: 1.5px dashed rgb(0 0 0 / 0.75);
    outline-offset: -3px;
    touch-action: none;
  }
  .tool-move .zone {
    cursor: move;
  }
  .tool-draw .zone {
    pointer-events: none;
  }
  .zone.custom {
    border-color: color-mix(in srgb, var(--accent) 70%, white);
  }
  .zone.selected {
    border: 2px solid var(--accent);
    outline: none;
    box-shadow: 0 0 0 9999px rgb(0 0 0 / 0.12);
    z-index: 2;
  }
  .tag {
    position: absolute;
    bottom: calc(100% + 6px);
    left: -2px;
    padding: 2px 8px;
    border-radius: 6px;
    background: var(--accent);
    color: var(--on-accent);
    font-size: 11px;
    font-weight: 700;
    white-space: nowrap;
    pointer-events: none;
  }
  .remove {
    position: absolute;
    top: -12px;
    right: -12px;
    width: 24px;
    height: 24px;
    display: grid;
    place-items: center;
    border-radius: 50%;
    border: 2px solid #fff;
    background: #dc2626;
    color: #fff;
    padding: 0;
    z-index: 3;
  }
  .handle {
    position: absolute;
    width: 14px;
    height: 14px;
    margin: -7px 0 0 -7px;
    border-radius: 4px;
    background: #fff;
    border: 2px solid var(--accent);
    touch-action: none;
    z-index: 2;
  }
  /* Bigger invisible hit area for fingers. */
  .handle::after {
    content: '';
    position: absolute;
    inset: -10px;
  }
  .h-nw { left: 0; top: 0; cursor: nwse-resize; }
  .h-n { left: 50%; top: 0; cursor: ns-resize; }
  .h-ne { left: 100%; top: 0; cursor: nesw-resize; }
  .h-e { left: 100%; top: 50%; cursor: ew-resize; }
  .h-se { left: 100%; top: 100%; cursor: nwse-resize; }
  .h-s { left: 50%; top: 100%; cursor: ns-resize; }
  .h-sw { left: 0; top: 100%; cursor: nesw-resize; }
  .h-w { left: 0; top: 50%; cursor: ew-resize; }
  .frame {
    position: absolute;
    border: 2px solid var(--accent);
    box-shadow: 0 0 0 9999px rgb(0 0 0 / 0.5);
    cursor: move;
    touch-action: none;
  }
  .frame-tip {
    position: absolute;
    top: 8px;
    left: 8px;
    max-width: calc(100% - 16px);
    padding: 3px 8px;
    border-radius: 6px;
    background: rgb(0 0 0 / 0.7);
    color: #fff;
    font-size: 11px;
    font-weight: 600;
    pointer-events: none;
  }
</style>
