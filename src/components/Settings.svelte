<script lang="ts">
  import { zonesForSide, type ZoneKey } from '../lib/documents';
  import type { CoverStyle } from '../lib/effects';
  import { downloadAllJpg, downloadFaceJpg, downloadPdf } from '../lib/export';
  import type { PdfSize } from '../lib/pdf';
  import { protectionSummary, usage, USAGES, type UsageId } from '../lib/presets';
  import { app, type CoverMode } from '../lib/state.svelte';
  import Icon from './Icon.svelte';
  import Segmented from './Segmented.svelte';
  import Toggle from './Toggle.svelte';

  const preset = $derived(usage(app.usage));
  const recommended = $derived(new Set<ZoneKey>(preset.cover));
  const summary = $derived(
    protectionSummary(app.usage, app.selection, {
      manual: app.coverMode === 'manual',
      manualZones: app.manualZoneCount,
      watermark: app.watermark.enabled && app.watermarkText.length > 0,
    }),
  );
  const hasFaces = $derived(app.loaded.length > 0);
  let busy = $state<'' | 'pdf' | 'jpg' | 'all'>('');

  async function run(kind: 'pdf' | 'jpg' | 'all') {
    busy = kind;
    try {
      // Let the button repaint before the heavy work.
      await new Promise((r) => setTimeout(r, 30));
      if (kind === 'pdf') await downloadPdf();
      else if (kind === 'jpg') await downloadFaceJpg(app.active);
      else await downloadAllJpg();
      app.status = 'Descarga lista. Recuerda: solo para quien la necesita.';
    } catch (e) {
      app.status = e instanceof Error ? e.message : 'No se ha podido generar la descarga.';
    } finally {
      busy = '';
    }
  }

  function setMode(m: CoverMode) {
    app.coverMode = m;
    app.selectedZone = null;
    if (m === 'manual' && app.tool === 'move') app.tool = 'draw';
    if (m === 'auto' && app.tool === 'draw') app.tool = 'move';
  }

  const sides = [
    { side: 'anverso' as const, label: 'Anverso' },
    { side: 'reverso' as const, label: 'Reverso' },
  ];
</script>

<div class="card settings">
  <section aria-labelledby="s-usage">
    <h2 id="s-usage" class="step"><span class="num">2</span>¿Para qué es la copia?</h2>
    <label class="field">
      <span>Uso</span>
      <select class="input" value={app.usage} onchange={(e) => app.setUsage(e.currentTarget.value as UsageId)}>
        {#each USAGES as u (u.id)}<option value={u.id}>{u.label}</option>{/each}
      </select>
    </label>
    <div class="row2">
      <label class="field">
        <span>Destinatario <small>(opcional)</small></span>
        <input class="input" type="text" maxlength="60" placeholder="Ej.: Inmobiliaria Sol" autocomplete="off" bind:value={app.recipient} />
      </label>
      <label class="field">
        <span>Fecha</span>
        <input class="input" type="date" bind:value={app.date} />
      </label>
    </div>
    <p class="note"><Icon name="info" size={16} /> <span>{preset.note}</span></p>
  </section>

  <section aria-labelledby="s-cover">
    <h2 id="s-cover" class="step"><span class="num">3</span>Qué tapar</h2>
    <Segmented
      label="Modo de tapado"
      value={app.coverMode}
      onchange={setMode}
      options={[
        { value: 'auto' as CoverMode, label: 'Automático' },
        { value: 'manual' as CoverMode, label: 'Manual' },
      ]}
    />
    {#if app.coverMode === 'auto'}
      <p class="help">Las zonas se colocan sobre los datos del DNI. Comprueba que caen en su sitio; si no, usa «Encuadre».</p>
      {#each sides as s (s.side)}
        <fieldset class="checks">
          <legend>{s.label}</legend>
          {#each zonesForSide(s.side) as z (z.key)}
            <label class="check" title={z.hint}>
              <input type="checkbox" bind:checked={app.selection[z.key]} />
              <span>{z.label}</span>
              {#if recommended.has(z.key)}<span class="rec">Recomendado</span>{/if}
            </label>
          {/each}
        </fieldset>
      {/each}
    {:else}
      <p class="help">Elige «Dibujar» en la barra del lienzo y marca con el ratón o el dedo todo lo que quieras tapar.</p>
    {/if}

    <div class="sub">
      <span class="sub-title">Cómo se tapa</span>
      <Segmented
        label="Cómo se tapa"
        bind:value={app.coverStyle}
        options={[
          { value: 'black' as CoverStyle, label: 'Negro' },
          { value: 'pixelate' as CoverStyle, label: 'Pixelado' },
          { value: 'blur' as CoverStyle, label: 'Desenfoque' },
        ]}
      />
      {#if app.coverStyle !== 'black'}
        <p class="help">El negro es lo más seguro. Pixelado y desenfoque se aplican con fuerza para que no se pueda leer, pero se nota menos que algo está tapado.</p>
      {/if}
    </div>
  </section>

  <section aria-labelledby="s-wm">
    <h2 id="s-wm" class="step"><span class="num">4</span>Marca de agua</h2>
    <Toggle bind:checked={app.watermark.enabled}>Añadir marca de agua</Toggle>
    {#if app.watermark.enabled}
      <p class="wm-preview" aria-label="Texto de la marca de agua">{app.watermarkText || '—'}</p>
      <label class="field">
        <span>Texto propio <small>(sustituye al automático)</small></span>
        <input class="input" type="text" maxlength="80" autocomplete="off" placeholder="Ej.: Solo para Inmobiliaria Sol" bind:value={app.watermark.custom} />
      </label>
      <label class="slider">
        <span>Intensidad</span>
        <input type="range" min="0.15" max="0.9" step="0.05" bind:value={app.watermark.opacity} />
      </label>
      <label class="slider">
        <span>Tamaño</span>
        <input type="range" min="0" max="1" step="0.05" bind:value={app.watermark.size} />
      </label>
      <Segmented
        label="Color de la marca"
        bind:value={app.watermark.tone}
        options={[
          { value: 'dark' as const, label: 'Oscura' },
          { value: 'light' as const, label: 'Clara' },
        ]}
      />
    {/if}
    <Toggle bind:checked={app.grayscale}>Copia en blanco y negro</Toggle>
  </section>

  <section aria-labelledby="s-level">
    <h2 id="s-level" class="step"><span class="num">5</span>Nivel de protección</h2>
    {#if hasFaces}
      <div class="meter level-{summary.level}" role="meter" aria-valuemin="0" aria-valuemax="100" aria-valuenow={Math.round(summary.score * 100)} aria-label="Nivel de protección">
        <span style:width="{Math.max(6, summary.score * 100)}%"></span>
      </div>
      <p class="level-text"><strong class="level-{summary.level}">Protección {summary.level}.</strong> {summary.message}</p>
    {:else}
      <p class="help">Sube una foto para empezar.</p>
    {/if}
  </section>

  <section aria-labelledby="s-dl" id="descargar">
    <h2 id="s-dl" class="step"><span class="num">6</span>Descargar</h2>
    <Segmented
      label="Tamaño en el PDF"
      bind:value={app.pdfSize}
      options={[
        { value: 'real' as PdfSize, label: 'Tamaño real', title: 'Tarjeta a 85,6 × 54 mm, como una fotocopia' },
        { value: 'large' as PdfSize, label: 'Ampliado', title: 'Cada cara al ancho de la página, más legible' },
      ]}
    />
    <button type="button" class="btn primary block lg" disabled={!hasFaces || !!busy} onclick={() => run('pdf')}>
      <Icon name="download" size={18} /> {busy === 'pdf' ? 'Generando PDF…' : 'Descargar PDF'}
    </button>
    <div class="row2">
      <button type="button" class="btn" disabled={!app.activeFace || !!busy} onclick={() => run('jpg')}>
        {busy === 'jpg' ? 'Generando…' : 'JPG de esta cara'}
      </button>
      <button type="button" class="btn" disabled={!hasFaces || !!busy} onclick={() => run('all')}>
        {busy === 'all' ? 'Generando…' : 'JPG con todas'}
      </button>
    </div>
    <p class="help"><Icon name="eyeOff" size={14} /> La copia no lleva metadatos: ni ubicación, ni modelo de móvil, ni fecha de la foto.</p>
  </section>
</div>

<style>
  .settings {
    display: grid;
    gap: 0;
    padding: 0;
  }
  section {
    display: grid;
    gap: 12px;
    padding: 18px;
  }
  section + section {
    border-top: 1px solid var(--border);
  }
  .row2 {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
  }
  .note {
    display: flex;
    gap: 8px;
    padding: 10px 12px;
    border-radius: 10px;
    background: var(--accent-soft);
    color: var(--accent-text);
    font-size: 13px;
    font-weight: 500;
  }
  .note :global(svg) {
    flex: none;
    margin-top: 2px;
  }
  .help {
    font-size: 12.5px;
    color: var(--muted);
    display: flex;
    gap: 6px;
    align-items: flex-start;
  }
  .help :global(svg) {
    flex: none;
    margin-top: 2px;
  }
  .checks {
    border: 0;
    margin: 0;
    padding: 0;
    display: grid;
    gap: 2px;
  }
  legend {
    font: 700 11px var(--mono);
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--muted);
    margin-bottom: 4px;
  }
  .check {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 6px 8px;
    margin: 0 -8px;
    border-radius: 8px;
    font-size: 14px;
    cursor: pointer;
  }
  .check:hover {
    background: var(--surface-2);
  }
  .check input {
    width: 18px;
    height: 18px;
    accent-color: var(--accent);
    flex: none;
  }
  .rec {
    margin-left: auto;
    padding: 1px 7px;
    border-radius: 999px;
    font-size: 10.5px;
    font-weight: 700;
    color: var(--accent-text);
    background: var(--accent-soft);
    white-space: nowrap;
  }
  .sub {
    display: grid;
    gap: 8px;
    margin-top: 4px;
  }
  .sub-title {
    font-size: 13px;
    font-weight: 600;
    color: var(--text-2);
  }
  .wm-preview {
    padding: 10px 12px;
    border-radius: 10px;
    background: #12161b;
    color: #f4f6f8;
    font: 700 12px/1.4 var(--mono);
    letter-spacing: 0.04em;
    word-break: break-word;
  }
  .slider {
    display: grid;
    grid-template-columns: 84px 1fr;
    align-items: center;
    gap: 10px;
    font-size: 13px;
    font-weight: 600;
    color: var(--text-2);
  }
  .meter {
    height: 10px;
    border-radius: 999px;
    background: var(--surface-3);
    overflow: hidden;
  }
  .meter span {
    display: block;
    height: 100%;
    border-radius: inherit;
    transition: width 0.3s ease, background 0.3s;
  }
  .meter.level-baja span {
    background: var(--level-baja);
  }
  .meter.level-media span {
    background: var(--level-media);
  }
  .meter.level-alta span {
    background: var(--level-alta);
  }
  .level-text {
    font-size: 13.5px;
  }
  strong.level-baja {
    color: var(--level-baja);
  }
  strong.level-media {
    color: var(--level-media);
  }
  strong.level-alta {
    color: var(--level-alta);
  }
  @media (max-width: 420px) {
    .row2 {
      grid-template-columns: 1fr;
    }
  }
</style>
