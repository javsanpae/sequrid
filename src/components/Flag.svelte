<script lang="ts">
  import { CUSTOM_COUNTRY, type CountryCode } from '../lib/documents';
  import Icon from './Icon.svelte';

  let { country, size = 20 }: { country: CountryCode; size?: number } = $props();

  const code = $derived(country.toUpperCase());
  const height = $derived(Math.round((size * 2) / 3));
  const DRAWN = ['ES', 'FR', 'IT', 'GB', 'US'];
  // US flag: 13 stripes, the first 7 next to the blue canton.
  const STRIPES = Array.from({ length: 13 }, (_, i) => i);
</script>

<!-- Simplified flags, drawn here so they look the same on every system.
     Countries without a drawn flag get a neutral badge with their ISO code. -->
{#if DRAWN.includes(code)}
  <svg class="flag" width={size} {height} viewBox="0 0 3 2" aria-hidden="true" focusable="false">
    {#if code === 'ES'}
      <rect width="3" height="2" fill="#c60b1e" />
      <rect y="0.5" width="3" height="1" fill="#ffc400" />
    {:else if code === 'FR'}
      <rect width="1" height="2" fill="#002395" />
      <rect x="1" width="1" height="2" fill="#ffffff" />
      <rect x="2" width="1" height="2" fill="#ed2939" />
    {:else if code === 'IT'}
      <rect width="1" height="2" fill="#009246" />
      <rect x="1" width="1" height="2" fill="#ffffff" />
      <rect x="2" width="1" height="2" fill="#ce2b37" />
    {:else if code === 'GB'}
      <rect width="3" height="2" fill="#012169" />
      <path d="M0 0L3 2M3 0L0 2" stroke="#ffffff" stroke-width="0.4" />
      <path d="M0 0L3 2M3 0L0 2" stroke="#c8102e" stroke-width="0.13" />
      <path d="M1.5 0V2M0 1H3" stroke="#ffffff" stroke-width="0.6" />
      <path d="M1.5 0V2M0 1H3" stroke="#c8102e" stroke-width="0.36" />
    {:else}
      {#each STRIPES as i (i)}
        <rect y={(i * 2) / 13} width="3" height={2 / 13 + 0.001} fill={i % 2 ? '#ffffff' : '#b22234'} />
      {/each}
      <rect width="1.2" height={(7 * 2) / 13} fill="#3c3b6e" />
    {/if}
  </svg>
{:else if code === CUSTOM_COUNTRY}
  <!-- Custom document: not a country, so a neutral pen icon instead of a flag. -->
  <span class="flag badge custom" style:width="{size}px" style:height="{height}px" aria-hidden="true"
    ><Icon name="pen" size={Math.max(10, Math.round(height * 0.8))} stroke={2.2} /></span
  >
{:else}
  <span
    class="flag badge"
    style:width="{size}px"
    style:height="{height}px"
    style:font-size="{Math.max(7, Math.round(size * 0.38))}px"
    aria-hidden="true">{code.slice(0, 3)}</span
  >
{/if}

<style>
  .flag {
    flex: none;
    border-radius: 3px;
    box-shadow: 0 0 0 1px rgb(0 0 0 / 0.12);
  }
  .custom {
    background: var(--accent-soft);
    color: var(--accent-text);
    box-shadow: inset 0 0 0 1px var(--accent);
  }
  .badge {
    display: inline-grid;
    place-items: center;
    background: var(--surface-3);
    color: var(--text-2);
    font-family: var(--mono);
    font-weight: 700;
    line-height: 1;
    letter-spacing: 0.02em;
    box-shadow: inset 0 0 0 1px var(--border-strong);
  }
</style>
