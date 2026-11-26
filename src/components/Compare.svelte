<script lang="ts">
  import { renderSettings } from '../lib/export';
  import { clamp } from '../lib/geometry';
  import { renderOriginal, renderProtected, rotatedImage } from '../lib/render';
  import { app, type FaceId } from '../lib/state.svelte';

  let { faceId, maxHeight }: { faceId: FaceId; maxHeight: number } = $props();

  const face = $derived(app.faces[faceId]!);
  const rot = $derived(rotatedImage(face.image, face.rotation));
  const aspect = $derived((face.frame.w * rot.width) / Math.max(1e-6, face.frame.h * rot.height));

  let boxWidth = $state(0);
  const dispW = $derived(Math.round(Math.max(120, Math.min(boxWidth, maxHeight * aspect))));
  const dispH = $derived(Math.round(dispW / aspect));

  let pos = $state(50);
  let before: HTMLCanvasElement;
  let after: HTMLCanvasElement;
  let sheet: HTMLDivElement;
  let dragging = false;

  $effect(() => {
    const target = Math.round(dispW * Math.min(window.devicePixelRatio || 1, 2));
    const snapshot = { image: face.image, rotation: face.rotation, frame: { ...face.frame } };
    const settings = renderSettings(face);
    const id = requestAnimationFrame(() => {
      renderOriginal(snapshot, target, before);
      renderProtected(snapshot, settings, target, after);
    });
    return () => cancelAnimationFrame(id);
  });

  function setFromPointer(e: PointerEvent) {
    const r = sheet.getBoundingClientRect();
    pos = Math.round(clamp(((e.clientX - r.left) / r.width) * 100, 0, 100));
  }
</script>

<div class="wrap" bind:clientWidth={boxWidth}>
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div
    class="sheet"
    bind:this={sheet}
    style:width="{dispW}px"
    style:height="{dispH}px"
    onpointerdown={(e) => {
      dragging = true;
      sheet.setPointerCapture(e.pointerId);
      setFromPointer(e);
    }}
    onpointermove={(e) => dragging && setFromPointer(e)}
    onpointerup={() => (dragging = false)}
    onpointercancel={() => (dragging = false)}
  >
    <canvas bind:this={before} aria-label="Foto original"></canvas>
    <canvas bind:this={after} class="after" style:clip-path="inset(0 0 0 {pos}%)" aria-label="Copia protegida"></canvas>
    <span class="label left">Original</span>
    <span class="label right">Protegida</span>
    <span class="divider" style:left="{pos}%"><span class="knob" aria-hidden="true">‹ ›</span></span>
  </div>
  <label class="range">
    <span class="sr-only">Posición del comparador</span>
    <input type="range" min="0" max="100" bind:value={pos} />
  </label>
  <p class="hint">Desliza para comparar la foto original con la copia protegida.</p>
</div>

<style>
  .wrap {
    display: grid;
    gap: 10px;
  }
  .sheet {
    position: relative;
    margin: auto;
    border-radius: 6px;
    overflow: hidden;
    touch-action: none;
    cursor: ew-resize;
    box-shadow: 0 2px 12px rgb(0 0 0 / 0.18);
    user-select: none;
  }
  canvas {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    display: block;
  }
  .label {
    position: absolute;
    top: 8px;
    padding: 2px 8px;
    border-radius: 6px;
    background: rgb(0 0 0 / 0.72);
    color: #fff;
    font: 700 10px var(--mono);
    letter-spacing: 0.08em;
    text-transform: uppercase;
    pointer-events: none;
  }
  .left {
    left: 8px;
  }
  .right {
    right: 8px;
    background: var(--accent);
    color: var(--on-accent);
  }
  .divider {
    position: absolute;
    top: 0;
    bottom: 0;
    width: 2px;
    margin-left: -1px;
    background: #fff;
    box-shadow: 0 0 0 1px rgb(0 0 0 / 0.25);
    pointer-events: none;
  }
  .knob {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 34px;
    height: 34px;
    border-radius: 50%;
    display: grid;
    place-items: center;
    background: #fff;
    color: #111;
    font-weight: 800;
    font-size: 14px;
    box-shadow: 0 2px 8px rgb(0 0 0 / 0.3);
  }
  .range {
    display: block;
    max-width: 420px;
    width: 100%;
    margin: 0 auto;
  }
  .hint {
    text-align: center;
    font-size: 12.5px;
    color: var(--muted);
  }
</style>
