<script lang="ts">
  import { downloadPdf } from './lib/export';
  import { loadFiles } from './lib/files';
  import { app } from './lib/state.svelte';
  import { SOURCE_URL, VERSION } from './lib/config';
  import Editor from './components/Editor.svelte';
  import Header from './components/Header.svelte';
  import Icon from './components/Icon.svelte';
  import Info from './components/Info.svelte';
  import Settings from './components/Settings.svelte';
  import Slots from './components/Slots.svelte';

  function onPaste(e: ClipboardEvent) {
    const target = e.target as HTMLElement | null;
    if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) return;
    const files = Array.from(e.clipboardData?.files ?? []).filter((f) => f.type.startsWith('image/'));
    if (files.length) {
      e.preventDefault();
      void loadFiles(files, app.active);
    }
  }

  // Dropping a file outside the editor would make the browser navigate to it.
  const block = (e: DragEvent) => e.preventDefault();

  let mobileBusy = $state(false);
  async function mobilePdf() {
    mobileBusy = true;
    try {
      await downloadPdf();
    } finally {
      mobileBusy = false;
    }
  }
</script>

<svelte:window onpaste={onPaste} ondragover={block} ondrop={block} />

<Header />

<main>
  <section class="hero">
    <div class="badges">
      <span class="badge"><Icon name="lock" size={13} /> Sin subir tu foto</span>
      <span class="badge"><Icon name="check" size={13} stroke={3} /> Sin registro</span>
      <span class="badge"><Icon name="code" size={13} /> Código abierto</span>
    </div>
    <h1>Protege tu DNI antes de enviarlo</h1>
    <p>Tapa los datos que nadie necesita, añade una marca de agua con el destinatario y la fecha, y descarga un PDF o JPG listo para enviar.</p>
  </section>

  <div class="layout" id="editor">
    <div class="col-slots"><Slots /></div>
    <div class="col-editor"><Editor /></div>
    <div class="col-settings"><Settings /></div>
  </div>

  <Info />
</main>

<footer>
  <p>
    Sequrid procesa todo en tu navegador. Ninguna imagen se envía ni se guarda.
    <a href={SOURCE_URL} target="_blank" rel="noopener noreferrer">Código fuente</a> · Licencia AGPL-3.0 · v{VERSION}
  </p>
</footer>

{#if app.loaded.length > 0}
  <div class="mobile-bar">
    <a class="btn" href="#descargar">Ajustes</a>
    <button type="button" class="btn primary" disabled={mobileBusy} onclick={mobilePdf}>
      <Icon name="download" size={18} /> {mobileBusy ? 'Generando…' : 'Descargar PDF'}
    </button>
  </div>
{/if}

<style>
  main {
    padding-bottom: 40px;
  }
  .hero {
    max-width: 1360px;
    margin: 0 auto;
    padding: 28px 16px 20px;
    display: grid;
    gap: 10px;
  }
  .badges {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
  }
  h1 {
    font-size: clamp(26px, 4vw, 40px);
    line-height: 1.1;
    letter-spacing: -0.03em;
    font-weight: 800;
  }
  .hero p {
    color: var(--text-2);
    max-width: 68ch;
    font-size: 16px;
  }
  .layout {
    max-width: 1360px;
    margin: 0 auto;
    padding: 0 16px;
    display: grid;
    grid-template-columns: 230px minmax(0, 1fr) 350px;
    grid-template-areas: 'slots editor settings';
    gap: 16px;
    align-items: start;
  }
  .col-slots {
    grid-area: slots;
    position: sticky;
    top: 72px;
  }
  .col-editor {
    grid-area: editor;
    position: sticky;
    top: 72px;
    min-width: 0;
  }
  .col-settings {
    grid-area: settings;
    min-width: 0;
  }
  :global(.card) {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    box-shadow: var(--shadow);
    padding: 16px;
  }
  :global(.step) {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 16px;
    font-weight: 700;
    letter-spacing: -0.01em;
  }
  :global(.step .num) {
    display: grid;
    place-items: center;
    width: 24px;
    height: 24px;
    border-radius: 7px;
    background: var(--accent);
    color: var(--on-accent);
    font: 700 12px var(--mono);
  }
  footer {
    max-width: 1100px;
    margin: 0 auto;
    padding: 40px 16px 48px;
    text-align: center;
    font-size: 13px;
    color: var(--muted);
  }
  .mobile-bar {
    display: none;
  }

  @media (max-width: 1100px) {
    .layout {
      grid-template-columns: minmax(0, 1fr) 330px;
      grid-template-areas: 'slots slots' 'editor settings';
    }
    .col-slots {
      position: static;
    }
  }

  @media (max-width: 760px) {
    .hero {
      padding-top: 18px;
    }
    .hero p {
      font-size: 15px;
    }
    .layout {
      grid-template-columns: minmax(0, 1fr);
      grid-template-areas: 'slots' 'editor' 'settings';
      gap: 12px;
    }
    .col-editor {
      position: static;
    }
    footer {
      padding-bottom: 96px;
    }
    .mobile-bar {
      position: fixed;
      left: 0;
      right: 0;
      bottom: 0;
      z-index: 30;
      display: grid;
      grid-template-columns: auto 1fr;
      gap: 8px;
      padding: 10px 16px calc(10px + env(safe-area-inset-bottom));
      background: color-mix(in srgb, var(--surface) 90%, transparent);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      border-top: 1px solid var(--border);
    }
    .mobile-bar a {
      text-decoration: none;
      color: var(--text);
    }
  }
</style>
