<script lang="ts">
  import { tick } from 'svelte';
  import { DOCUMENTS, documentType, isCurrent, type DocumentId } from '../lib/documents';
  import { documentCountryName, searchDocuments } from '../lib/document-search';
  import { getLang, m } from '../lib/i18n/index.svelte';
  import { docText, modelYears } from '../lib/i18n/text';
  import Flag from './Flag.svelte';
  import Icon from './Icon.svelte';

  let {
    value,
    label,
    onchange,
  }: { value: DocumentId; label: string; onchange: (id: DocumentId) => void } = $props();

  const uid = `country-${Math.random().toString(36).slice(2, 8)}`;
  const listId = `${uid}-list`;
  const optionId = (id: DocumentId) => `${uid}-opt-${id}`;
  const groupId = (country: string) => `${uid}-group-${country}`;

  const current = $derived(documentType(value));
  const currentText = $derived(docText(m(), current));
  const currentCountry = $derived(documentCountryName(current, getLang()));

  let open = $state(false);
  let query = $state('');
  /** Highlighted option (aria-activedescendant); focus stays in the search box. */
  let active = $state<DocumentId | null>(null);
  let alignEnd = $state(false);
  let root: HTMLDivElement;
  let button: HTMLButtonElement;
  let input = $state<HTMLInputElement>();
  let popover = $state<HTMLDivElement>();

  const groups = $derived(open ? searchDocuments(query, DOCUMENTS, getLang()) : []);
  const options = $derived(groups.flatMap((g) => g.documents));
  const activeVisible = $derived(active !== null && options.some((d) => d.id === active));

  async function show() {
    query = '';
    active = value;
    alignEnd = false;
    open = true;
    await tick();
    input?.focus();
    // Keep the popover inside the viewport when the trigger is near the right edge.
    const box = popover?.getBoundingClientRect();
    if (box) alignEnd = box.right > document.documentElement.clientWidth - 8;
    void reveal(active);
  }

  function close(focusButton = true) {
    open = false;
    query = '';
    if (focusButton) button.focus();
  }

  function pick(id: DocumentId) {
    if (id !== value) onchange(id);
    close();
  }

  function setQuery(text: string) {
    query = text;
    // While typing, Enter picks the best match; with no query, go back to the selection.
    active = !text.trim() && options.some((d) => d.id === value) ? value : (options[0]?.id ?? null);
    void reveal(active);
  }

  /** Scrolls the list so the option, and its country header if it is the first model, are visible. */
  async function reveal(id: DocumentId | null) {
    await tick();
    const el = id ? document.getElementById(optionId(id)) : null;
    if (!el) return;
    const group = el.parentElement;
    if (group && group.querySelector('[role="option"]') === el) group.firstElementChild?.scrollIntoView({ block: 'nearest' });
    el.scrollIntoView({ block: 'nearest' });
  }

  function move(to: 'next' | 'prev' | 'first' | 'last') {
    if (options.length === 0) return;
    const last = options.length - 1;
    const i = options.findIndex((d) => d.id === active);
    let next: number;
    if (to === 'first') next = 0;
    else if (to === 'last') next = last;
    else if (i < 0) next = to === 'next' ? 0 : last;
    else if (to === 'next') next = i >= last ? 0 : i + 1;
    else next = i <= 0 ? last : i - 1;
    active = options[next].id;
    void reveal(active);
  }

  function onButtonKey(e: KeyboardEvent) {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      void show();
    }
  }

  function onInputKey(e: KeyboardEvent) {
    if (e.isComposing) return;
    const plain = !e.shiftKey && !e.ctrlKey && !e.metaKey && !e.altKey;
    if (e.key === 'ArrowDown') move('next');
    else if (e.key === 'ArrowUp') move('prev');
    else if (e.key === 'Home' && plain) move('first');
    else if (e.key === 'End' && plain) move('last');
    else if (e.key === 'Enter') {
      if (active && activeVisible) pick(active);
    } else if (e.key === 'Escape') {
      if (query) setQuery('');
      else close();
    } else if (e.key === 'Tab') return close(false);
    else return;
    e.preventDefault();
  }

  const optionAt = (e: Event): DocumentId | undefined => {
    const id = (e.target as Element).closest<HTMLElement>('[role="option"]')?.dataset.id;
    return options.find((d) => d.id === id)?.id;
  };

  function onListMove(e: PointerEvent) {
    const id = optionAt(e);
    if (id && id !== active) active = id;
  }

  function onListClick(e: MouseEvent) {
    const id = optionAt(e);
    if (id) pick(id);
  }

  function clearQuery() {
    setQuery('');
    input?.focus();
  }

  /** Keeps the focus (and the phone keyboard) in the search box when tapping the list. */
  const keepFocus = (e: MouseEvent) => e.preventDefault();

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
    aria-controls={listId}
    aria-label={m().country.button(label, currentCountry, currentText.name)}
    onclick={() => (open ? close() : show())}
    onkeydown={onButtonKey}
  >
    <Flag country={current.country} />
    <span class="text">
      <strong>{currentCountry}</strong>
      <small>{currentText.name}</small>
    </span>
    <span class="chev"><Icon name="chevron" size={16} /></span>
  </button>

  {#if open}
    <div bind:this={popover} class="popover" class:end={alignEnd}>
      <div class="search">
        <span class="lens"><Icon name="search" size={16} stroke={2.2} /></span>
        <input
          bind:this={input}
          type="text"
          role="combobox"
          inputmode="search"
          enterkeyhint="search"
          autocomplete="off"
          autocapitalize="off"
          spellcheck="false"
          aria-autocomplete="list"
          aria-expanded={options.length > 0}
          aria-controls={listId}
          aria-activedescendant={activeVisible && active ? optionId(active) : undefined}
          aria-label={m().country.search}
          placeholder={m().country.search}
          value={query}
          oninput={(e) => setQuery(e.currentTarget.value)}
          onkeydown={onInputKey}
        />
        {#if query}
          <button type="button" class="clear" tabindex="-1" aria-label={m().country.clear} title={m().country.clear} onmousedown={keepFocus} onclick={clearQuery}>
            <Icon name="x" size={14} stroke={2.4} />
          </button>
        {/if}
      </div>

      <div
        id={listId}
        class="list"
        role="listbox"
        tabindex="-1"
        aria-label={label}
        hidden={options.length === 0}
        onmousedown={keepFocus}
        onpointermove={onListMove}
        onclick={onListClick}
        onkeydown={onInputKey}
      >
        {#each groups as g (g.country)}
          <ul class="group" role="group" aria-labelledby={groupId(g.country)}>
            <li class="group-head" role="presentation" id={groupId(g.country)}>
              <Flag country={g.country} size={22} />
              <span>{g.name}</span>
            </li>
            {#each g.documents as d (d.id)}
              {@const text = docText(m(), d)}
              {@const years = modelYears(m(), d)}
              <li
                id={optionId(d.id)}
                role="option"
                data-id={d.id}
                aria-selected={d.id === value}
                aria-label={m().country.option(g.name, text.name, years, isCurrent(d))}
                class:active={d.id === active}
              >
                <span class="text">
                  <strong>{text.name}</strong>
                  <small>
                    <span>{years}</span>
                    {#if isCurrent(d)}<span class="badge">{m().country.current}</span>{/if}
                  </small>
                </span>
                {#if d.id === value}<span class="tick"><Icon name="check" size={16} stroke={2.5} /></span>{/if}
              </li>
            {/each}
          </ul>
        {/each}
      </div>

      {#if options.length === 0}
        <p class="empty">{m().country.noResults(query.trim())}</p>
      {/if}
      <p class="soon">{m().country.soon}</p>
      <span class="sr-only" aria-live="polite">
        {query.trim() ? m().country.results(options.length) : ''}
      </span>
    </div>
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

  .popover {
    position: absolute;
    z-index: 15;
    top: calc(100% + 6px);
    left: 0;
    width: max(100%, 340px);
    max-width: calc(100vw - 32px);
    display: flex;
    flex-direction: column;
    border: 1px solid var(--border);
    border-radius: 12px;
    background: var(--surface);
    box-shadow: 0 12px 32px rgb(0 0 0 / 0.16);
    overflow: hidden;
  }
  .popover.end {
    left: auto;
    right: 0;
  }

  .search {
    position: relative;
    padding: 8px;
    border-bottom: 1px solid var(--border);
  }
  .search input {
    width: 100%;
    height: 38px;
    padding: 0 36px 0 34px;
    border: 1px solid var(--border-strong);
    border-radius: 8px;
    background: var(--surface-2);
    font-size: 14px;
    transition: border-color 0.15s, box-shadow 0.15s, background 0.15s;
  }
  .search input::placeholder {
    color: var(--muted);
    opacity: 1;
  }
  .search input:focus {
    outline: none;
    border-color: var(--accent);
    background: var(--surface);
    box-shadow: var(--focus);
  }
  .lens {
    position: absolute;
    top: 50%;
    left: 19px;
    display: flex;
    color: var(--muted);
    transform: translateY(-50%);
    pointer-events: none;
  }
  .clear {
    position: absolute;
    top: 50%;
    right: 14px;
    display: grid;
    place-items: center;
    width: 26px;
    height: 26px;
    padding: 0;
    border: 0;
    border-radius: 6px;
    background: transparent;
    color: var(--muted);
    transform: translateY(-50%);
  }
  .clear:hover {
    background: var(--surface-3);
    color: var(--text);
  }

  .list {
    max-height: min(320px, 50vh);
    overflow-y: auto;
    overscroll-behavior: contain;
    padding: 4px 6px 6px;
  }
  .list[hidden] {
    display: none;
  }
  .group {
    margin: 0;
    padding: 0;
    list-style: none;
  }
  .group + .group {
    margin-top: 4px;
    padding-top: 4px;
    border-top: 1px solid var(--border);
  }
  .group-head {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 8px 10px 4px;
    font-size: 13px;
    font-weight: 700;
    color: var(--text);
    cursor: default;
  }
  [role='option'] {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 7px 10px 7px 42px;
    border-radius: 8px;
    cursor: pointer;
  }
  [role='option'].active {
    background: var(--surface-2);
  }
  [role='option'] .text strong {
    font-weight: 600;
  }
  [role='option'][aria-selected='true'] strong {
    color: var(--accent-text);
  }
  [role='option'] .text small {
    display: flex;
    align-items: center;
    gap: 6px;
    margin-top: 1px;
  }
  .badge {
    padding: 1px 6px;
    border-radius: 999px;
    background: var(--accent-soft);
    color: var(--accent-text);
    font-size: 10.5px;
    font-weight: 700;
    line-height: 1.5;
  }
  .tick {
    margin-left: auto;
    padding-left: 8px;
    display: flex;
    color: var(--accent-text);
  }
  .empty {
    padding: 16px 14px 12px;
    font-size: 13px;
    color: var(--text-2);
    text-align: center;
    overflow-wrap: anywhere;
  }
  .soon {
    padding: 8px 14px;
    font-size: 11.5px;
    color: var(--muted);
    border-top: 1px solid var(--border);
  }

  @media (pointer: coarse) {
    /* 16px or more stops iOS from zooming into the field. */
    .search input {
      height: 42px;
      font-size: 16px;
    }
    [role='option'] {
      padding-block: 9px;
    }
  }
</style>
