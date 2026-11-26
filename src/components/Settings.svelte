<script lang="ts">
  import { SIDES, ZONE_KEYS, zoneDef, type Side, type ZoneKey } from '../lib/documents';
  import type { CoverStyle } from '../lib/effects';
  import { downloadAllJpg, downloadFaceJpg, downloadPdf } from '../lib/export';
  import { m } from '../lib/i18n/index.svelte';
  import { docText, zoneText } from '../lib/i18n/text';
  import type { PdfSize } from '../lib/pdf';
  import { protectionMessage, protectionSummary, usage, USAGES, type UsageId } from '../lib/presets';
  import { app, type CoverMode } from '../lib/state.svelte';
  import Icon from './Icon.svelte';
  import Segmented from './Segmented.svelte';
  import Toggle from './Toggle.svelte';

  const t = $derived(m());
  const preset = $derived(usage(app.usage));
  const recommended = $derived(new Set<ZoneKey>(preset.cover));
  const summary = $derived(
    protectionSummary(app.usage, app.selection, {
      manual: app.coverMode === 'manual',
      manualZones: app.manualZoneCount,
      watermark: app.watermark.enabled && app.watermarkText.length > 0,
      available: app.availableKeys,
    }),
  );

  /**
   * Checkboxes for the data on the documents in use. With documents from
   * different countries, fields are merged and shown with neutral names.
   */
  const entries = $derived.by(() => {
    const docs = app.activeDocs;
    const single = docs.length === 1 ? docs[0] : null;
    const keys = single ? single.zones.map((z) => z.key) : ZONE_KEYS.filter((k) => docs.some((d) => zoneDef(k, d)));
    return keys.map((key) => {
      const owners = docs.filter((d) => zoneDef(key, d));
      const defs = owners.map((d) => zoneDef(key, d)!);
      const sides = SIDES.filter((side) => defs.some((def) => def.rects.some((r) => r.side === side)));
      const label = single ? zoneText(t, key, single).label : t.fields[key];
      return { key, label, hint: zoneText(t, key, owners[0]).hint, sides };
    });
  });
  /** "the DNI", "del DNI"… for a single document, null when several are mixed. */
  const docPhrase = $derived(app.activeDocs.length === 1 ? t.documents[app.activeDocs[0].id].the : null);
  const otherSide = (side: Side): Side => (side === 'front' ? 'back' : 'front');
  /** Side headings use the first document's wording ("Front", "Anverso", "Recto"…). */
  const sideTitle = (side: Side) => docText(t, app.activeDocs[0]).sides[side].label;
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
      app.status = (t) => t.status.downloadReady;
    } catch (e) {
      console.error(e);
      app.status = (t) => t.status.downloadFailed;
    } finally {
      busy = '';
    }
  }

  function setMode(mode: CoverMode) {
    app.coverMode = mode;
    app.selectedZone = null;
    if (mode === 'manual' && app.tool === 'move') app.tool = 'draw';
    if (mode === 'auto' && app.tool === 'draw') app.tool = 'move';
  }
</script>

<div class="card settings">
  <section aria-labelledby="s-usage">
    <h2 id="s-usage" class="step"><span class="num">2</span>{t.settings.usageTitle}</h2>
    <label class="field">
      <span>{t.settings.usage}</span>
      <select class="input" value={app.usage} onchange={(e) => app.setUsage(e.currentTarget.value as UsageId)}>
        {#each USAGES as u (u.id)}<option value={u.id}>{t.usages[u.id].label}</option>{/each}
      </select>
    </label>
    <div class="row2">
      <label class="field">
        <span>{t.settings.recipient} <small>{t.settings.optional}</small></span>
        <input class="input" type="text" maxlength="60" placeholder={t.settings.recipientPlaceholder} autocomplete="off" bind:value={app.recipient} />
      </label>
      <label class="field">
        <span>{t.settings.date}</span>
        <input class="input" type="date" bind:value={app.date} />
      </label>
    </div>
    <p class="note"><Icon name="info" size={16} /> <span>{t.usages[app.usage].note}</span></p>
  </section>

  <section aria-labelledby="s-cover">
    <h2 id="s-cover" class="step"><span class="num">3</span>{t.settings.coverTitle}</h2>
    <Segmented
      label={t.settings.coverMode}
      value={app.coverMode}
      onchange={setMode}
      options={[
        { value: 'auto' as CoverMode, label: t.settings.auto },
        { value: 'manual' as CoverMode, label: t.settings.manual },
      ]}
    />
    {#if app.coverMode === 'auto'}
      {#if !app.activeDocs.every((d) => d.custom)}
        <p class="help">{t.settings.autoHelp(docPhrase)}</p>
      {/if}
      {#if app.activeDocs.some((d) => d.custom)}
        <p class="note custom-note"><Icon name="pen" size={16} /> <span>{t.settings.customHelp}</span></p>
      {/if}
      {#each SIDES as side (side)}
        {@const group = entries.filter((e) => e.sides[0] === side)}
        {#if group.length}
          <fieldset class="checks">
            <legend>{sideTitle(side)}</legend>
            {#each group as z (z.key)}
              <label class="check" title={z.hint}>
                <input type="checkbox" bind:checked={app.selection[z.key]} />
                <span class="name">
                  {z.label}
                  {#if z.sides.length > 1}<small>{t.settings.alsoOn(otherSide(side))}</small>{/if}
                </span>
                {#if recommended.has(z.key)}<span class="rec">{t.settings.recommended}</span>{/if}
              </label>
            {/each}
          </fieldset>
        {/if}
      {/each}
    {:else}
      <p class="help">{t.settings.manualHelp}</p>
    {/if}

    <div class="sub">
      <span class="sub-title">{t.settings.coverStyle}</span>
      <Segmented
        label={t.settings.coverStyle}
        bind:value={app.coverStyle}
        options={[
          { value: 'black' as CoverStyle, label: t.settings.black },
          { value: 'pixelate' as CoverStyle, label: t.settings.pixelate },
          { value: 'blur' as CoverStyle, label: t.settings.blur },
        ]}
      />
      {#if app.coverStyle !== 'black'}
        <p class="help">{t.settings.styleHelp}</p>
      {/if}
    </div>
  </section>

  <section aria-labelledby="s-wm">
    <h2 id="s-wm" class="step"><span class="num">4</span>{t.settings.watermarkTitle}</h2>
    <Toggle bind:checked={app.watermark.enabled}>{t.settings.watermark}</Toggle>
    {#if app.watermark.enabled}
      <p class="wm-preview" aria-label={t.settings.watermarkPreview}>{app.watermarkText || '—'}</p>
      <label class="field">
        <span>{t.settings.customText} <small>{t.settings.customHint}</small></span>
        <input class="input" type="text" maxlength="80" autocomplete="off" placeholder={t.settings.customPlaceholder} bind:value={app.watermark.custom} />
      </label>
      <label class="slider">
        <span>{t.settings.opacity}</span>
        <input type="range" min="0.15" max="0.9" step="0.05" bind:value={app.watermark.opacity} />
      </label>
      <label class="slider">
        <span>{t.settings.size}</span>
        <input type="range" min="0" max="1" step="0.05" bind:value={app.watermark.size} />
      </label>
      <Segmented
        label={t.settings.tone}
        bind:value={app.watermark.tone}
        options={[
          { value: 'dark' as const, label: t.settings.dark },
          { value: 'light' as const, label: t.settings.light },
        ]}
      />
    {/if}
    <Toggle bind:checked={app.grayscale}>{t.settings.grayscale}</Toggle>
  </section>

  <section aria-labelledby="s-level">
    <h2 id="s-level" class="step"><span class="num">5</span>{t.settings.levelTitle}</h2>
    {#if hasFaces}
      <div class="meter level-{summary.level}" role="meter" aria-valuemin="0" aria-valuemax="100" aria-valuenow={Math.round(summary.score * 100)} aria-label={t.settings.levelTitle}>
        <span style:width="{Math.max(6, summary.score * 100)}%"></span>
      </div>
      <p class="level-text"><strong class="level-{summary.level}">{t.protection.levels[summary.level]}</strong> {protectionMessage(summary, t)}</p>
    {:else}
      <p class="help">{t.settings.levelEmpty}</p>
    {/if}
  </section>

  <section aria-labelledby="s-dl" id="download">
    <h2 id="s-dl" class="step"><span class="num">6</span>{t.settings.downloadTitle}</h2>
    <Segmented
      label={t.settings.pdfSize}
      bind:value={app.pdfSize}
      options={[
        { value: 'real' as PdfSize, label: t.settings.real, title: t.settings.realTitle },
        { value: 'large' as PdfSize, label: t.settings.large, title: t.settings.largeTitle },
      ]}
    />
    <button type="button" class="btn primary block lg" disabled={!hasFaces || !!busy} onclick={() => run('pdf')}>
      <Icon name="download" size={18} /> {busy === 'pdf' ? t.settings.pdfBusy : t.settings.pdf}
    </button>
    <div class="row2">
      <button type="button" class="btn" disabled={!app.activeFace || !!busy} onclick={() => run('jpg')}>
        {busy === 'jpg' ? t.settings.busy : t.settings.jpgFace}
      </button>
      <button type="button" class="btn" disabled={!hasFaces || !!busy} onclick={() => run('all')}>
        {busy === 'all' ? t.settings.busy : t.settings.jpgAll}
      </button>
    </div>
    <p class="help"><Icon name="eyeOff" size={14} /> {t.settings.noMetadata}</p>
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
  .name {
    display: grid;
    line-height: 1.3;
  }
  .name small {
    font-size: 11.5px;
    color: var(--muted);
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
  .meter.level-low span {
    background: var(--level-low);
  }
  .meter.level-medium span {
    background: var(--level-medium);
  }
  .meter.level-high span {
    background: var(--level-high);
  }
  .level-text {
    font-size: 13.5px;
  }
  strong.level-low {
    color: var(--level-low);
  }
  strong.level-medium {
    color: var(--level-medium);
  }
  strong.level-high {
    color: var(--level-high);
  }
  @media (max-width: 420px) {
    .row2 {
      grid-template-columns: 1fr;
    }
  }
</style>
