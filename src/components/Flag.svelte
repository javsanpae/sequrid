<script lang="ts">
  import type { CountryCode } from '../lib/documents';

  let { country, size = 20 }: { country: CountryCode; size?: number } = $props();
</script>

<!-- Simplified flags, drawn here so they look the same on every system. -->
<svg class="flag" width={size} height={Math.round((size * 2) / 3)} viewBox="0 0 3 2" aria-hidden="true" focusable="false">
  {#if country === 'ES'}
    <rect width="3" height="2" fill="#c60b1e" />
    <rect y="0.5" width="3" height="1" fill="#ffc400" />
  {:else if country === 'FR'}
    <rect width="1" height="2" fill="#002395" />
    <rect x="1" width="1" height="2" fill="#ffffff" />
    <rect x="2" width="1" height="2" fill="#ed2939" />
  {/if}
</svg>

<style>
  .flag {
    flex: none;
    border-radius: 3px;
    box-shadow: 0 0 0 1px rgb(0 0 0 / 0.12);
  }
</style>
