<script lang="ts">
  import type { CountryCode } from '../lib/documents';

  let { country, size = 20 }: { country: CountryCode; size?: number } = $props();

  const code = $derived(country.toUpperCase());
  const height = $derived(Math.round((size * 2) / 3));
</script>

<!-- Simplified flags, drawn here so they look the same on every system.
     Countries without a drawn flag get a neutral badge with their ISO code. -->
{#if code === 'ES' || code === 'FR'}
  <svg class="flag" width={size} {height} viewBox="0 0 3 2" aria-hidden="true" focusable="false">
    {#if code === 'ES'}
      <rect width="3" height="2" fill="#c60b1e" />
      <rect y="0.5" width="3" height="1" fill="#ffc400" />
    {:else}
      <rect width="1" height="2" fill="#002395" />
      <rect x="1" width="1" height="2" fill="#ffffff" />
      <rect x="2" width="1" height="2" fill="#ed2939" />
    {/if}
  </svg>
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
