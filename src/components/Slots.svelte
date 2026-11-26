<script lang="ts">
  import { app, FACE_META, faceName, type FaceId } from '../lib/state.svelte';
  import { loadSample, pickFiles } from '../lib/files';
  import Icon from './Icon.svelte';
  import Thumb from './Thumb.svelte';
  import Toggle from './Toggle.svelte';

  const docs = $derived(app.twoDocs ? [1, 2] : [1]);
  const slotsOf = (doc: number) => app.slots.filter((id) => FACE_META[id].doc === doc);

  function onSlot(id: FaceId) {
    app.active = id;
    app.selectedZone = null;
    if (!app.faces[id]) pickFiles(id);
  }
</script>

<section class="card slots" aria-labelledby="slots-title">
  <h2 id="slots-title" class="step"><span class="num">1</span>Fotos del DNI</h2>

  <div class="docs">
    {#each docs as doc (doc)}
      <div class="doc">
        <p class="doc-label">DNI {doc}</p>
        <div class="faces">
          {#each slotsOf(doc) as id (id)}
            {@const face = app.faces[id]}
            <button
              type="button"
              class="slot"
              class:active={app.active === id}
              class:filled={!!face}
              aria-pressed={app.active === id}
              aria-label="{faceName(id)}: {face ? 'cargada, pulsa para editar' : 'vacía, pulsa para subir'}"
              onclick={() => onSlot(id)}
            >
              <span class="preview">
                {#if face}
                  <Thumb {face} />
                {:else}
                  <Icon name="plus" size={18} />
                {/if}
              </span>
              <span class="meta">
                <strong>{FACE_META[id].label}</strong>
                <small>
                  {#if face}<span class="ok"><Icon name="check" size={12} stroke={3} /></span>{/if}
                  {FACE_META[id].hint}
                </small>
              </span>
            </button>
          {/each}
        </div>
      </div>
    {/each}
  </div>

  <Toggle checked={app.twoDocs} onchange={(v) => app.setTwoDocs(v)}>Añadir un segundo DNI</Toggle>

  <button type="button" class="btn block" onclick={loadSample}>
    <Icon name="sparkle" size={16} /> Probar con un ejemplo
  </button>
  <p class="tip">Arrastra varias fotos a la vez y se colocan solas en los huecos libres.<span class="paste"> También puedes pegar con <kbd>Ctrl</kbd>+<kbd>V</kbd>.</span></p>
</section>

<style>
  .slots {
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    gap: 14px;
  }
  .docs {
    display: grid;
    gap: 14px;
  }
  .doc-label {
    font: 700 11px var(--mono);
    letter-spacing: 0.08em;
    color: var(--muted);
    margin-bottom: 6px;
  }
  .faces {
    display: grid;
    gap: 8px;
  }
  .slot {
    display: flex;
    align-items: center;
    gap: 10px;
    width: 100%;
    padding: 6px;
    text-align: left;
    border: 1px solid var(--border);
    border-radius: 12px;
    background: var(--surface);
    transition: border-color 0.15s, background 0.15s, box-shadow 0.15s;
  }
  .slot:hover {
    border-color: var(--border-strong);
    background: var(--surface-2);
  }
  .slot.active {
    border-color: var(--accent);
    box-shadow: 0 0 0 1px var(--accent);
    background: var(--accent-soft);
  }
  .preview {
    flex: none;
    display: grid;
    place-items: center;
    width: 64px;
    aspect-ratio: 85.6 / 54;
    border-radius: 7px;
    overflow: hidden;
    border: 1.5px dashed var(--border-strong);
    color: var(--muted);
    background: var(--surface-2);
  }
  .filled .preview {
    border-style: solid;
    border-color: var(--border);
  }
  .meta {
    display: grid;
    min-width: 0;
  }
  .meta strong {
    font-size: 14px;
  }
  .meta small {
    font-size: 12px;
    color: var(--muted);
    display: flex;
    gap: 4px;
    align-items: center;
  }
  .ok {
    color: var(--level-alta);
    display: inline-flex;
  }
  .tip {
    font-size: 12.5px;
    color: var(--muted);
  }

  @media (pointer: coarse) {
    .paste {
      display: none;
    }
  }
  @media (max-width: 1100px) {
    .docs {
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
    }
    .faces {
      grid-template-columns: 1fr 1fr;
    }
    .slot {
      flex-direction: column;
      align-items: stretch;
      text-align: center;
    }
    .preview {
      width: 100%;
    }
    .meta small {
      justify-content: center;
    }
  }
</style>
