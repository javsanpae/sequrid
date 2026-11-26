<script lang="ts">
  import { DNI_ES, type ZoneKey } from '../lib/documents';
  import { getLang, m } from '../lib/i18n/index.svelte';
  import { zoneText } from '../lib/i18n/text';
  import { USAGES } from '../lib/presets';
  import { SOURCE_URL } from '../lib/config';
  import Icon from './Icon.svelte';
  import Rich from './Rich.svelte';

  const KEY_ZONES: ZoneKey[] = ['serial', 'birthDate', 'signature', 'can', 'mrz', 'number'];
  const keyZones = DNI_ES.zones.filter((z) => KEY_ZONES.includes(z.key)).map((z) => z.key);
  const t = $derived(m());
</script>

<section id="what-to-cover" class="block">
  <p class="eyebrow">{t.info.cover.eyebrow}</p>
  <h2>{t.info.cover.title}</h2>
  <p class="lead">{t.info.cover.lead}</p>
  <div class="grid cards">
    {#each keyZones as key (key)}
      {@const z = zoneText(t, key, DNI_ES)}
      <article class="mini">
        <h3>{z.label}</h3>
        <p>{z.hint}</p>
      </article>
    {/each}
  </div>
</section>

<section class="block">
  <p class="eyebrow">{t.info.usage.eyebrow}</p>
  <h2>{t.info.usage.title}</h2>
  <div class="table-wrap">
    <table>
      <thead>
        <tr><th scope="col">{t.info.usage.use}</th><th scope="col">{t.info.usage.covered}</th><th scope="col">{t.info.usage.watermark}</th></tr>
      </thead>
      <tbody>
        {#each USAGES.filter((u) => u.id !== 'other') as u (u.id)}
          <tr>
            <th scope="row">{t.usages[u.id].label}</th>
            <td>{u.cover.map((k) => t.fields[k]).join(', ')}</td>
            <td><code>{t.usages[u.id].watermark.toLocaleUpperCase(getLang())}</code></td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
  <p class="small">{t.info.usage.note}</p>
</section>

<section id="privacy" class="block privacy">
  <div>
    <p class="eyebrow">{t.info.privacy.eyebrow}</p>
    <h2>{t.info.privacy.title}</h2>
    <p class="lead">{t.info.privacy.lead}</p>
  </div>
  <ol class="steps">
    <li><span><Icon name="file" size={18} /></span>{t.info.privacy.steps[0]}</li>
    <li><span><Icon name="wifiOff" size={18} /></span>{t.info.privacy.steps[1]}</li>
    <li><span><Icon name="shieldCheck" size={18} /></span>{t.info.privacy.steps[2]}</li>
  </ol>
  <p class="small">
    <Rich text={t.info.privacy.csp} /><a href={SOURCE_URL} target="_blank" rel="noopener noreferrer">{t.info.privacy.cspLink}</a>{t.info.privacy.cspEnd}
  </p>
</section>

<section id="faq" class="block">
  <p class="eyebrow">{t.info.faq.eyebrow}</p>
  <h2>{t.info.faq.title}</h2>
  <div class="faq">
    {#each t.info.faq.items as f, i (i)}
      <details>
        <summary>{f.q}<Icon name="chevron" size={18} /></summary>
        <p>{f.a}</p>
      </details>
    {/each}
  </div>
  <p class="small"><Rich text={t.info.faq.help} /></p>
</section>

<style>
  .block {
    max-width: 1100px;
    margin: 0 auto;
    padding: 56px 16px 0;
    display: grid;
    gap: 14px;
  }
  .eyebrow {
    font: 700 11px var(--mono);
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--accent-text);
  }
  h2 {
    font-size: clamp(22px, 3vw, 30px);
    letter-spacing: -0.02em;
    line-height: 1.2;
  }
  .lead {
    color: var(--text-2);
    max-width: 70ch;
  }
  .small {
    font-size: 13px;
    color: var(--muted);
  }
  .grid.cards {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
    gap: 12px;
    margin-top: 6px;
  }
  .mini {
    padding: 16px;
    border-radius: 14px;
    background: var(--surface);
    border: 1px solid var(--border);
  }
  .mini h3 {
    font-size: 15px;
    margin-bottom: 4px;
  }
  .mini p {
    font-size: 13.5px;
    color: var(--text-2);
  }
  .table-wrap {
    overflow-x: auto;
    border: 1px solid var(--border);
    border-radius: 14px;
    background: var(--surface);
  }
  table {
    width: 100%;
    border-collapse: collapse;
    font-size: 13.5px;
    min-width: 620px;
  }
  th,
  td {
    text-align: left;
    padding: 12px 14px;
    border-bottom: 1px solid var(--border);
    vertical-align: top;
  }
  thead th {
    font: 700 11px var(--mono);
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--muted);
    background: var(--surface-2);
  }
  tbody tr:last-child > * {
    border-bottom: 0;
  }
  code,
  .small :global(code) {
    font: 600 11.5px var(--mono);
    padding: 2px 6px;
    border-radius: 6px;
    background: var(--surface-2);
    white-space: nowrap;
  }
  .privacy {
    margin-top: 56px;
    padding: 32px clamp(16px, 4vw, 40px);
    border-radius: 24px;
    background: var(--surface);
    border: 1px solid var(--border);
    max-width: 1068px;
  }
  .steps {
    list-style: none;
    padding: 0;
    margin: 0;
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: 12px;
  }
  .steps li {
    display: flex;
    gap: 10px;
    align-items: center;
    padding: 14px;
    border-radius: 14px;
    background: var(--surface-2);
    font-weight: 600;
    font-size: 14px;
  }
  .steps span {
    flex: none;
    display: grid;
    place-items: center;
    width: 36px;
    height: 36px;
    border-radius: 10px;
    background: var(--accent-soft);
    color: var(--accent-text);
  }
  .faq {
    display: grid;
    gap: 8px;
  }
  details {
    border: 1px solid var(--border);
    border-radius: 12px;
    background: var(--surface);
  }
  summary {
    list-style: none;
    cursor: pointer;
    display: flex;
    justify-content: space-between;
    gap: 12px;
    padding: 14px 16px;
    font-weight: 600;
  }
  summary::-webkit-details-marker {
    display: none;
  }
  summary :global(svg) {
    flex: none;
    transition: transform 0.2s;
    color: var(--muted);
  }
  details[open] summary :global(svg) {
    transform: rotate(180deg);
  }
  details p {
    padding: 0 16px 16px;
    color: var(--text-2);
    font-size: 14px;
  }
</style>
