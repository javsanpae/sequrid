<script lang="ts">
  import { loadFiles, loadSample, pickFiles } from '../lib/files';
  import { app, FACE_META, faceName, type Tool, type View } from '../lib/state.svelte';
  import Compare from './Compare.svelte';
  import Icon from './Icon.svelte';
  import Segmented from './Segmented.svelte';
  import Stage from './Stage.svelte';

  let innerHeight = $state(800);
  let innerWidth = $state(1200);
  const maxHeight = $derived(Math.max(220, Math.min(innerHeight * (innerWidth < 760 ? 0.5 : 0.62), 720)));
  const face = $derived(app.activeFace);
  let dragOver = $state(false);

  const ZOOM_STEPS = [0.5, 0.75, 1, 1.25, 1.5, 2, 3, 4];
  function zoom(dir: 1 | -1) {
    const i = ZOOM_STEPS.findIndex((z) => z >= app.zoom - 1e-6);
    const next = ZOOM_STEPS[Math.min(ZOOM_STEPS.length - 1, Math.max(0, (i === -1 ? 2 : i) + dir))];
    app.zoom = next;
  }

  function onDrop(e: DragEvent) {
    e.preventDefault();
    dragOver = false;
    const files = Array.from(e.dataTransfer?.files ?? []);
    if (files.length) void loadFiles(files, app.active);
  }

  const hints: Record<Tool, string> = {
    move: 'Arrastra una zona para moverla o tira de sus esquinas para cambiar su tamaño.',
    draw: 'Arrastra sobre la imagen para tapar lo que quieras.',
    frame: 'Arrastra las esquinas o los lados del marco hasta los bordes de la tarjeta. Las zonas se recolocan solas.',
  };

  function setTool(t: Tool) {
    app.tool = t;
    app.selectedZone = null;
    if (t === 'frame') app.zoom = 1;
  }
</script>

<svelte:window bind:innerHeight bind:innerWidth />

<section
  class="card editor"
  class:over={dragOver}
  aria-label="Editor"
  ondragover={(e) => {
    e.preventDefault();
    dragOver = true;
  }}
  ondragleave={(e) => {
    if (e.currentTarget === e.target) dragOver = false;
  }}
  ondrop={onDrop}
>
  <div class="toolbar">
    <Segmented
      label="Vista"
      size="sm"
      bind:value={app.view}
      disabled={!face}
      options={[
        { value: 'edit' as View, label: 'Editar', icon: 'edit' },
        { value: 'compare' as View, label: 'Antes / después', icon: 'compare' },
      ]}
    />
    <Segmented
      label="Herramienta"
      size="sm"
      value={app.tool}
      onchange={setTool}
      disabled={!face || app.view === 'compare'}
      options={[
        { value: 'move' as Tool, label: 'Mover', icon: 'move', title: 'Mover y ajustar zonas' },
        { value: 'draw' as Tool, label: 'Dibujar', icon: 'pen', title: 'Dibuja un rectángulo para tapar lo que quieras' },
        { value: 'frame' as Tool, label: 'Encuadre', icon: 'crop', title: 'Ajusta el marco a los bordes de la tarjeta' },
      ]}
    />
    <div class="group" role="group" aria-label="Zoom">
      <button type="button" class="btn ghost icon sm" aria-label="Alejar" disabled={!face || app.view === 'compare'} onclick={() => zoom(-1)}>
        <Icon name="minus" size={16} />
      </button>
      <span class="zoom">{Math.round(app.zoom * 100)}%</span>
      <button type="button" class="btn ghost icon sm" aria-label="Acercar" disabled={!face || app.view === 'compare'} onclick={() => zoom(1)}>
        <Icon name="plus" size={16} />
      </button>
      <button type="button" class="btn ghost sm" disabled={!face} onclick={() => (app.zoom = 1)} title="Ajustar a la pantalla">
        <Icon name="fit" size={16} /><span class="hide-xs">Ajustar</span>
      </button>
    </div>
    <div class="group end">
      <button type="button" class="btn icon sm" aria-label="Girar 90 grados" title="Girar 90°" disabled={!face} onclick={() => app.rotate(app.active)}>
        <Icon name="rotate" size={17} />
      </button>
      <button
        type="button"
        class="btn icon sm"
        aria-label="Quitar la zona seleccionada"
        title="Quitar la zona seleccionada (Supr)"
        disabled={!face || !app.selectedZone}
        onclick={() => app.selectedZone && app.removeZone(app.active, app.selectedZone)}
      >
        <Icon name="trash" size={17} />
      </button>
    </div>
  </div>

  <div class="stage-area">
    {#if face}
      {#key app.active}
        {#if app.view === 'compare'}
          <Compare faceId={app.active} {maxHeight} />
        {:else}
          <Stage faceId={app.active} {maxHeight} />
        {/if}
      {/key}
    {:else}
      <button type="button" class="drop" style:min-height="{Math.min(maxHeight, 380)}px" onclick={() => pickFiles(app.active)}>
        <span class="drop-icon"><Icon name="upload" size={26} /></span>
        <strong>Sube o arrastra la foto del {FACE_META[app.active].side}</strong>
        <span>JPG, PNG o WebP. En el móvil puedes hacer la foto directamente.</span>
        <span class="drop-badge"><Icon name="lock" size={14} /> La imagen no sale de tu dispositivo</span>
      </button>
      <div class="empty-actions">
        <button type="button" class="link" onclick={loadSample}>o prueba con un documento de ejemplo</button>
      </div>
    {/if}
    {#if dragOver}
      <div class="drop-veil" aria-hidden="true"><Icon name="upload" size={28} /> Suelta aquí las fotos</div>
    {/if}
  </div>

  <div class="foot">
    {#if face}
      <p class="hint">
        {#if app.view === 'compare'}
          Estás viendo {faceName(app.active)}.
        {:else}
          {hints[app.tool]}
          {#if app.tool === 'move'}
            <span class="keys">Con el lienzo seleccionado: <kbd>Tab</kbd> recorre las zonas, flechas para moverlas (<kbd>Mayús</kbd> + flechas las agranda), <kbd>Supr</kbd> elimina.</span>
          {/if}
        {/if}
      </p>
      <div class="actions">
        <button type="button" class="link" onclick={() => pickFiles(app.active)}>Cambiar foto</button>
        <button type="button" class="link" onclick={() => app.resetZones(app.active)}>Restablecer zonas</button>
        <button type="button" class="link danger" onclick={() => app.removeFace(app.active)}>Quitar esta cara</button>
      </div>
    {/if}
    <p class="status" role="status" aria-live="polite">{app.status}</p>
  </div>
</section>

<style>
  .editor {
    display: grid;
    gap: 12px;
    position: relative;
    min-width: 0;
  }
  .toolbar {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    align-items: center;
    padding-bottom: 12px;
    border-bottom: 1px solid var(--border);
  }
  .group {
    display: flex;
    align-items: center;
    gap: 2px;
    padding: 2px;
    border-radius: 12px;
    border: 1px solid var(--border);
  }
  .group.end {
    margin-left: auto;
    border: 0;
    gap: 6px;
  }
  .btn.sm {
    min-height: 34px;
    font-size: 13px;
    padding: 0 10px;
  }
  .btn.icon.sm {
    width: 34px;
    padding: 0;
  }
  .zoom {
    min-width: 46px;
    text-align: center;
    font: 600 12px var(--mono);
    color: var(--text-2);
  }
  .stage-area {
    position: relative;
    min-width: 0;
  }
  .drop {
    width: 100%;
    display: grid;
    place-content: center;
    justify-items: center;
    gap: 10px;
    padding: 32px 20px;
    border: 2px dashed var(--border-strong);
    border-radius: 14px;
    background: var(--surface-2);
    text-align: center;
    color: var(--text-2);
    transition: border-color 0.15s, background 0.15s;
  }
  .drop:hover {
    border-color: var(--accent);
    background: var(--accent-soft);
  }
  .drop strong {
    font-size: 18px;
    color: var(--text);
  }
  .drop span {
    font-size: 14px;
    max-width: 340px;
  }
  .drop-icon {
    display: grid;
    place-items: center;
    width: 56px;
    height: 56px;
    border-radius: 16px;
    background: var(--accent);
    color: var(--on-accent);
    margin-bottom: 4px;
  }
  .drop .drop-badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    margin-top: 6px;
    font-size: 12px;
    font-weight: 600;
    color: var(--accent-text);
  }
  .empty-actions {
    text-align: center;
    margin-top: 10px;
  }
  .drop-veil {
    position: absolute;
    inset: 0;
    display: grid;
    place-content: center;
    justify-items: center;
    gap: 8px;
    border-radius: 12px;
    border: 2px dashed var(--accent);
    background: color-mix(in srgb, var(--accent-soft) 85%, var(--surface));
    color: var(--accent-text);
    font-weight: 700;
    pointer-events: none;
    z-index: 5;
  }
  .foot {
    display: grid;
    gap: 8px;
  }
  .hint {
    font-size: 13px;
    color: var(--text-2);
  }
  .keys {
    display: block;
    margin-top: 2px;
    color: var(--muted);
    font-size: 12px;
  }
  .actions {
    display: flex;
    flex-wrap: wrap;
    gap: 16px;
  }
  .link.danger {
    color: var(--danger);
  }
  .status {
    font-size: 13px;
    font-weight: 600;
    min-height: 1em;
  }
  .status:empty {
    display: none;
  }

  @media (max-width: 760px) {
    .keys {
      display: none;
    }
    .hide-xs {
      display: none;
    }
    .toolbar > :global(.seg) {
      flex: 1 1 100%;
    }
    .group:not(.end) {
      flex: 1;
      justify-content: space-between;
    }
  }
</style>
