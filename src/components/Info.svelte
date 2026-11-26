<script lang="ts">
  import { DNI_ES, type ZoneKey } from '../lib/documents';
  import { getLang, m } from '../lib/i18n/index.svelte';
  import { countryName } from '../lib/countries';
  import { HELP_LINES, sortHelpLines } from '../lib/help-lines';
  import { app } from '../lib/state.svelte';
  import Flag from './Flag.svelte';
  import { zoneText } from '../lib/i18n/text';
  import { USAGES } from '../lib/presets';
  import { SOURCE_URL } from '../lib/config';
  import Icon from './Icon.svelte';
  import Rich from './Rich.svelte';

  const KEY_ZONES: ZoneKey[] = ['serial', 'birthDate', 'signature', 'can', 'mrz', 'number'];
  const keyZones = DNI_ES.zones.filter((z) => KEY_ZONES.includes(z.key)).map((z) => z.key);
  const t = $derived(m());

  // Countries of the documents in use first, then the rest by name.
  const helpLines = $derived.by(() => {
    const lang = getLang();
    const first = app.activeDocs.map((d) => d.country);
    return sortHelpLines(HELP_LINES, first, (code) => countryName(code, lang));
  });
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
</section>

<section id="help" class="block">
  <p class="eyebrow">{t.info.help.eyebrow}</p>
  <h2>{t.info.help.title}</h2>
  <p class="lead">{t.info.help.lead}</p>
  <div class="table-wrap help-wrap">
    <table class="help">
      <thead>
        <tr>
          <th scope="col">{t.info.help.country}</th>
          <th scope="col">{t.info.help.service}</th>
          <th scope="col">{t.info.help.contact}</th>
          <th scope="col">{t.info.help.what}</th>
        </tr>
      </thead>
      <tbody>
        {#each helpLines as line (line.id)}
          <tr>
            <th scope="row" class="country">
              <Flag country={line.country} size={22} />
              <span>{countryName(line.country, getLang())}</span>
            </th>
            <td data-label={t.info.help.service}>
              <strong lang={line.country.toLowerCase()}>{line.service}</strong>
              {#if line.operator}<small lang={line.country.toLowerCase()}>{line.operator}</small>{/if}
            </td>
            <td data-label={t.info.help.contact}>
              <ul class="contacts">
                {#each line.contacts as c (c.href)}
                  <li>
                    <span class="kind">{t.info.help.kinds[c.kind]}</span>
                    {#if c.kind === 'phone'}
                      <a class="phone" href={c.href}>{c.value}</a>
                    {:else}
                      <a href={c.href} target="_blank" rel="noopener noreferrer">
                        {c.value}<span class="sr-only"> ({t.info.help.newTab})</span>
                      </a>
                    {/if}
                    {#if c.free}<span class="free">{t.info.help.free}</span>{/if}
                  </li>
                {/each}
                <li class="emergency">
                  <span class="kind">{t.info.help.emergency}</span>
                  <span class="nums">
                    {#each line.emergency as n (n)}<a class="phone" href="tel:{n}">{n}</a>{/each}
                  </span>
                </li>
                {#if line.emergencySms}
                  <li>
                    <span class="kind">{t.info.help.emergencySms}</span>
                    <a class="phone" href="sms:{line.emergencySms}">{line.emergencySms}</a>
                  </li>
                {/if}
              </ul>
            </td>
            <td data-label={t.info.help.what}>{t.info.help.lines[line.id]}</td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
  <p class="small">{t.info.help.note}</p>
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
  .help th,
  .help td {
    vertical-align: top;
  }
  .help .country {
    white-space: nowrap;
  }
  .help .country,
  .help .country span {
    font-weight: 600;
  }
  .help .country :global(.flag) {
    vertical-align: -4px;
    margin-right: 8px;
  }
  .help td strong {
    display: block;
  }
  .help td small {
    display: block;
    color: var(--muted);
    font-size: 12px;
    margin-top: 2px;
  }
  .contacts {
    list-style: none;
    margin: 0;
    padding: 0;
    display: grid;
    gap: 4px;
  }
  .contacts .kind {
    display: inline-block;
    min-width: 84px;
    color: var(--muted);
    font-size: 12px;
  }
  .contacts .phone {
    font: 700 14px var(--mono);
    text-decoration: none;
  }
  .contacts .phone:hover {
    text-decoration: underline;
  }
  .help td:nth-child(3) {
    min-width: 250px;
  }
  .contacts .free {
    padding: 1px 7px;
    border-radius: 999px;
    font-size: 10.5px;
    font-weight: 700;
    color: var(--accent-text);
    background: var(--accent-soft);
  }
  .contacts .emergency {
    margin-top: 4px;
    padding-top: 6px;
    border-top: 1px dashed var(--border);
  }
  .contacts .nums {
    display: inline-flex;
    flex-wrap: wrap;
    gap: 4px 12px;
  }
  .contacts li {
    display: flex;
    align-items: baseline;
    flex-wrap: wrap;
    column-gap: 8px;
  }
  .contacts .kind {
    flex: none;
  }
  /* On narrow screens each row becomes a card. */
  @media (max-width: 720px) {
    .help-wrap {
      border: 0;
      background: none;
      overflow: visible;
    }
    .help {
      min-width: 0;
    }
    .help thead {
      display: none;
    }
    .help tr {
      display: grid;
      gap: 10px;
      padding: 14px 16px;
      margin-bottom: 12px;
      border: 1px solid var(--border);
      border-radius: 14px;
      background: var(--surface);
    }
    .help th,
    .help td {
      display: block;
      min-width: 0 !important;
      padding: 0;
      border: 0;
    }
    .help td::before {
      content: attr(data-label);
      display: block;
      margin-bottom: 4px;
      font: 700 10.5px var(--mono);
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: var(--muted);
    }
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
