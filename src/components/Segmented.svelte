<script lang="ts" generics="T extends string">
  import Icon, { type IconName } from './Icon.svelte';

  let {
    options,
    value = $bindable(),
    label,
    disabled = false,
    size = 'md',
    onchange,
  }: {
    options: { value: T; label: string; icon?: IconName; title?: string }[];
    value: T;
    label: string;
    disabled?: boolean;
    size?: 'sm' | 'md';
    onchange?: (v: T) => void;
  } = $props();

  function pick(v: T) {
    value = v;
    onchange?.(v);
  }
</script>

<div class="seg {size}" role="radiogroup" aria-label={label}>
  {#each options as o (o.value)}
    <button
      type="button"
      role="radio"
      aria-checked={value === o.value}
      class:on={value === o.value}
      title={o.title ?? o.label}
      {disabled}
      onclick={() => pick(o.value)}
    >
      {#if o.icon}<Icon name={o.icon} size={16} />{/if}
      <span class="lbl">{o.label}</span>
    </button>
  {/each}
</div>

<style>
  .seg {
    display: flex;
    padding: 3px;
    gap: 2px;
    border-radius: 12px;
    background: var(--surface-2);
    border: 1px solid var(--border);
  }
  button {
    flex: 1 1 0;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    min-height: 34px;
    padding: 0 10px;
    border: 0;
    border-radius: 9px;
    background: transparent;
    color: var(--text-2);
    font-weight: 600;
    font-size: 13px;
    white-space: nowrap;
    transition: background 0.15s, color 0.15s, box-shadow 0.15s;
  }
  .sm button {
    min-height: 30px;
    padding: 0 8px;
  }
  button:hover:not(:disabled):not(.on) {
    color: var(--text);
    background: var(--surface-3);
  }
  button.on {
    background: var(--surface);
    color: var(--accent-text);
    box-shadow: 0 1px 2px rgb(0 0 0 / 0.08), 0 0 0 1px var(--border);
  }
</style>
