<script lang="ts">
  import { DOCUMENTS, documentType, type DocumentId } from '../lib/documents';
  import Flag from './Flag.svelte';
  import Icon from './Icon.svelte';

  let {
    value,
    label,
    onchange,
  }: { value: DocumentId; label: string; onchange: (id: DocumentId) => void } = $props();

  const uid = `country-${Math.random().toString(36).slice(2, 8)}`;
  const current = $derived(documentType(value));
  let open = $state(false);
  let highlighted = $state(0);
  let root: HTMLDivElement;
  let button: HTMLButtonElement;
  let list = $state<HTMLUListElement>();

  function show() {
    highlighted = Math.max(0, DOCUMENTS.findIndex((d) => d.id === value));
    open = true;
    queueMicrotask(() => list?.focus());
  }

  function close(focusButton = true) {
    open = false;
    if (focusButton) button.focus();
  }

  function pick(id: DocumentId) {
    if (id !== value) onchange(id);
    close();
  }

  function onButtonKey(e: KeyboardEvent) {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      show();
    }
  }

  function onListKey(e: KeyboardEvent) {
    const last = DOCUMENTS.length - 1;
    if (e.key === 'ArrowDown') highlighted = Math.min(last, highlighted + 1);
    else if (e.key === 'ArrowUp') highlighted = Math.max(0, highlighted - 1);
    else if (e.key === 'Home') highlighted = 0;
    else if (e.key === 'End') highlighted = last;
    else if (e.key === 'Enter' || e.key === ' ') pick(DOCUMENTS[highlighted].id);
    else if (e.key === 'Escape') close();
    else if (e.key === 'Tab') close(false);
    else return;
    if (e.key !== 'Tab') e.preventDefault();
  }

  function onWindowDown(e: PointerEvent) {
    if (open && !root.contains(e.target as Node)) close(false);
  }
</script>

<svelte:window onpointerdown={onWindowDown} />

<div class="country" bind:this={root}>
  <button
    bind:this={button}
    type="button"
    class="trigger"
    class:open
    aria-haspopup="listbox"
    aria-expanded={open}
    aria-controls="{uid}-list"
    aria-label="{label}: {current.countryName}, {current.name}"
    onclick={() => (open ? close() : show())}
    onkeydown={onButtonKey}
  >
    <Flag country={current.country} />
    <span class="text">
      <strong>{current.countryName}</strong>
      <small>{current.name}</small>
    </span>
    <span class="chev"><Icon name="chevron" size={16} /></span>
  </button>

  {#if open}
    <ul
      bind:this={list}
      id="{uid}-list"
      class="menu"
      role="listbox"
      tabindex="-1"
      aria-label={label}
      aria-activedescendant="{uid}-{DOCUMENTS[highlighted].id}"
      onkeydown={onListKey}
    >
      {#each DOCUMENTS as d, i (d.id)}
        <li
          id="{uid}-{d.id}"
          role="option"
          aria-selected={d.id === value}
          class:highlighted={i === highlighted}
          onpointerenter={() => (highlighted = i)}
          onclick={() => pick(d.id)}
          onkeydown={() => {}}
        >
          <Flag country={d.country} size={22} />
          <span class="text">
            <strong>{d.countryName}</strong>
            <small>{d.name}</small>
          </span>
          {#if d.id === value}<span class="tick"><Icon name="check" size={16} stroke={2.5} /></span>{/if}
        </li>
      {/each}
      <li class="soon" role="presentation">Más países próximamente</li>
    </ul>
  {/if}
</div>

<style>
  .country {
    position: relative;
  }
  .trigger {
    width: 100%;
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 7px 10px;
    border: 1px solid var(--border-strong);
    border-radius: 10px;
    background: var(--surface);
    text-align: left;
    transition: border-color 0.15s, box-shadow 0.15s;
  }
  .trigger:hover {
    border-color: var(--accent);
  }
  .trigger.open {
    border-color: var(--accent);
    box-shadow: var(--focus);
  }
  .text {
    display: grid;
    min-width: 0;
    line-height: 1.25;
  }
  .text strong {
    font-size: 13.5px;
  }
  .text small {
    font-size: 11.5px;
    color: var(--muted);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .chev {
    margin-left: auto;
    display: flex;
    color: var(--muted);
    transition: transform 0.2s;
  }
  .open .chev {
    transform: rotate(180deg);
  }
  .menu {
    position: absolute;
    z-index: 15;
    top: calc(100% + 6px);
    left: 0;
    min-width: 100%;
    width: max-content;
    max-width: min(320px, calc(100vw - 32px));
    margin: 0;
    padding: 6px;
    list-style: none;
    border: 1px solid var(--border);
    border-radius: 12px;
    background: var(--surface);
    box-shadow: 0 12px 32px rgb(0 0 0 / 0.16);
    outline: none;
  }
  .menu li[role='option'] {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 8px 10px;
    border-radius: 8px;
    cursor: pointer;
  }
  .menu li.highlighted {
    background: var(--surface-2);
  }
  .menu li[aria-selected='true'] strong {
    color: var(--accent-text);
  }
  .tick {
    margin-left: auto;
    padding-left: 8px;
    display: flex;
    color: var(--accent-text);
  }
  .soon {
    padding: 6px 10px 2px;
    font-size: 11.5px;
    color: var(--muted);
    border-top: 1px solid var(--border);
    margin-top: 4px;
  }
</style>
