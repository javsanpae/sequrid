<script lang="ts">
  import type { Snippet } from 'svelte';

  let {
    checked = $bindable(),
    children,
    id,
    onchange,
  }: { checked: boolean; children: Snippet; id?: string; onchange?: (v: boolean) => void } = $props();
</script>

<label class="toggle">
  <input
    type="checkbox"
    role="switch"
    {id}
    bind:checked
    onchange={() => onchange?.(checked)}
  />
  <span class="track" aria-hidden="true"><span class="thumb"></span></span>
  <span class="text">{@render children()}</span>
</label>

<style>
  .toggle {
    display: flex;
    align-items: center;
    gap: 10px;
    cursor: pointer;
    font-size: 14px;
    font-weight: 500;
    user-select: none;
  }
  input {
    position: absolute;
    opacity: 0;
    width: 1px;
    height: 1px;
  }
  .track {
    flex: none;
    position: relative;
    width: 40px;
    height: 24px;
    border-radius: 999px;
    background: var(--border-strong);
    transition: background 0.2s;
  }
  .thumb {
    position: absolute;
    top: 3px;
    left: 3px;
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: #fff;
    box-shadow: 0 1px 3px rgb(0 0 0 / 0.25);
    transition: transform 0.2s;
  }
  input:checked + .track {
    background: var(--accent);
  }
  input:checked + .track .thumb {
    transform: translateX(16px);
  }
  input:focus-visible + .track {
    box-shadow: var(--focus);
  }
</style>
