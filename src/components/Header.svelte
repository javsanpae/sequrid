<script lang="ts">
  import { SOURCE_URL } from '../lib/config';
  import Icon from './Icon.svelte';

  const prefersDark = () => window.matchMedia('(prefers-color-scheme: dark)').matches;
  const current = (): 'light' | 'dark' => {
    const t = document.documentElement.dataset.theme;
    return t === 'light' || t === 'dark' ? t : prefersDark() ? 'dark' : 'light';
  };
  let theme = $state<'light' | 'dark'>(current());

  function toggle() {
    theme = theme === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = theme;
    try {
      localStorage.setItem('sequrid-theme', theme);
    } catch {
      /* private mode: the choice just won't persist */
    }
  }
</script>

<header class="top">
  <div class="inner">
    <a class="brand" href="#editor" aria-label="Sequrid, ir al editor">
      <span class="logo"><Icon name="shieldCheck" size={20} stroke={2.2} /></span>
      <span class="name">Sequrid</span>
    </a>
    <nav aria-label="Secciones">
      <a href="#editor">Editor</a>
      <a href="#que-tapar">Qué tapar</a>
      <a href="#privacidad">Privacidad</a>
      <a href="#preguntas">Preguntas</a>
    </nav>
    <div class="right">
      <span class="pill" title="Ninguna foto sale de tu navegador"><Icon name="lock" size={14} /> <span>100% en tu dispositivo</span></span>
      <a class="btn ghost icon" href={SOURCE_URL} target="_blank" rel="noopener noreferrer" aria-label="Código fuente" title="Código fuente">
        <Icon name="code" size={18} />
      </a>
      <button type="button" class="btn ghost icon" onclick={toggle} aria-label={theme === 'dark' ? 'Usar tema claro' : 'Usar tema oscuro'} title="Cambiar tema">
        <Icon name={theme === 'dark' ? 'sun' : 'moon'} size={18} />
      </button>
    </div>
  </div>
</header>

<style>
  .top {
    position: sticky;
    top: 0;
    z-index: 20;
    background: color-mix(in srgb, var(--bg) 82%, transparent);
    backdrop-filter: saturate(1.4) blur(12px);
    -webkit-backdrop-filter: saturate(1.4) blur(12px);
    border-bottom: 1px solid var(--border);
  }
  .inner {
    max-width: 1360px;
    margin: 0 auto;
    padding: 10px 16px;
    display: flex;
    align-items: center;
    gap: 20px;
  }
  .brand {
    display: flex;
    align-items: center;
    gap: 10px;
    text-decoration: none;
    color: var(--text);
  }
  .logo {
    display: grid;
    place-items: center;
    width: 34px;
    height: 34px;
    border-radius: 10px;
    background: var(--accent);
    color: var(--on-accent);
  }
  .name {
    font-weight: 800;
    font-size: 18px;
    letter-spacing: -0.02em;
  }
  nav {
    display: flex;
    gap: 4px;
  }
  nav a {
    padding: 6px 10px;
    border-radius: 8px;
    text-decoration: none;
    color: var(--text-2);
    font-size: 14px;
    font-weight: 500;
  }
  nav a:hover {
    color: var(--text);
    background: var(--surface-2);
  }
  .right {
    margin-left: auto;
    display: flex;
    align-items: center;
    gap: 6px;
  }
  .right a {
    color: var(--text);
  }
  .pill {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 5px 10px;
    margin-right: 6px;
    border-radius: 999px;
    background: var(--accent-soft);
    color: var(--accent-text);
    font-size: 12px;
    font-weight: 700;
  }
  @media (max-width: 900px) {
    nav {
      display: none;
    }
  }
  @media (max-width: 480px) {
    .pill span {
      display: none;
    }
    .pill {
      padding: 7px;
      margin-right: 0;
    }
  }
</style>
