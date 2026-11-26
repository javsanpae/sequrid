<script lang="ts">
  import { tick } from 'svelte';
  import { getLang, LANGUAGES, m, setLang, type Lang } from '../lib/i18n/index.svelte';
  import Icon from './Icon.svelte';

  const uid = `lang-${Math.random().toString(36).slice(2, 8)}`;
  const current = $derived(LANGUAGES.find((l) => l.code === getLang()) ?? LANGUAGES[0]);
  let open = $state(false);
  let root: HTMLDivElement;
  let button: HTMLButtonElement;
  const items: HTMLButtonElement[] = [];

  async function show(focus: 'current' | 'first' | 'last' = 'current') {
    open = true;
    await tick();
    const i =
      focus === 'first' ? 0 : focus === 'last' ? LANGUAGES.length - 1 : LANGUAGES.findIndex((l) => l.code === getLang());
    items[Math.max(0, i)]?.focus();
  }

  function close(focusButton = true) {
    open = false;
    if (focusButton) button.focus();
  }

  function pick(code: Lang) {
    if (code !== getLang()) setLang(code);
    close();
  }

  function onButtonKey(e: KeyboardEvent) {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      void show(e.key === 'ArrowDown' ? 'first' : 'last');
    }
  }

  function onMenuKey(e: KeyboardEvent) {
    const i = items.indexOf(document.activeElement as HTMLButtonElement);
    const last = LANGUAGES.length - 1;
    if (e.key === 'ArrowDown') items[i >= last ? 0 : i + 1]?.focus();
    else if (e.key === 'ArrowUp') items[i <= 0 ? last : i - 1]?.focus();
    else if (e.key === 'Home') items[0]?.focus();
    else if (e.key === 'End') items[last]?.focus();
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

<div class="lang" bind:this={root}>
  <button
    bind:this={button}
    type="button"
    class="btn ghost trigger"
    class:open
    aria-haspopup="menu"
    aria-expanded={open}
    aria-controls="{uid}-menu"
    aria-label={m().language.current(current.name)}
    title={m().language.label}
    onclick={() => (open ? close() : show())}
    onkeydown={onButtonKey}
  >
    <Icon name="globe" size={18} />
    <span class="code">{current.code.toUpperCase()}</span>
    <span class="chev"><Icon name="chevron" size={14} stroke={2.4} /></span>
  </button>

  {#if open}
    <ul id="{uid}-menu" class="menu" role="menu" tabindex="-1" aria-label={m().language.label} onkeydown={onMenuKey}>
      {#each LANGUAGES as l, i (l.code)}
        <li role="none">
          <button
            bind:this={items[i]}
            type="button"
            role="menuitemradio"
            aria-checked={l.code === current.code}
            tabindex="-1"
            lang={l.code}
            onclick={() => pick(l.code)}
          >
            <span class="name">{l.name}</span>
            <span class="tag" aria-hidden="true">{l.code.toUpperCase()}</span>
            <span class="tick">{#if l.code === current.code}<Icon name="check" size={16} stroke={2.5} />{/if}</span>
          </button>
        </li>
      {/each}
    </ul>
  {/if}
</div>

<style>
  .lang {
    position: relative;
  }
  .trigger {
    gap: 6px;
    padding: 0 8px 0 10px;
    color: var(--text);
  }
  .trigger.open {
    background: var(--surface-2);
  }
  .code {
    font: 700 12.5px var(--mono);
    letter-spacing: 0.04em;
  }
  .chev {
    display: flex;
    color: var(--muted);
    transition: transform 0.2s;
  }
  .open .chev {
    transform: rotate(180deg);
  }
  .menu {
    position: absolute;
    z-index: 25;
    top: calc(100% + 6px);
    right: 0;
    min-width: 180px;
    margin: 0;
    padding: 6px;
    list-style: none;
    border: 1px solid var(--border);
    border-radius: 12px;
    background: var(--surface);
    box-shadow: 0 12px 32px rgb(0 0 0 / 0.16);
    outline: none;
  }
  .menu button {
    width: 100%;
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 8px 10px;
    border: 0;
    border-radius: 8px;
    background: transparent;
    text-align: left;
    font-size: 14px;
    font-weight: 500;
  }
  .menu button:hover,
  .menu button:focus-visible {
    background: var(--surface-2);
    box-shadow: none;
  }
  .menu button[aria-checked='true'] .name {
    color: var(--accent-text);
    font-weight: 700;
  }
  .tag {
    margin-left: auto;
    padding-left: 12px;
    font: 600 11px var(--mono);
    color: var(--muted);
  }
  .tick {
    display: flex;
    width: 16px;
    color: var(--accent-text);
  }
  @media (max-width: 480px) {
    .trigger {
      padding: 0 8px;
    }
    .chev {
      display: none;
    }
  }
</style>
