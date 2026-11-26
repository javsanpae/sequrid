<script lang="ts" module>
  const PATHS = {
    shield: 'M12 3l7.5 3v6c0 4.6-3.2 8.2-7.5 9.5C7.7 20.2 4.5 16.6 4.5 12V6z',
    shieldCheck: 'M12 3l7.5 3v6c0 4.6-3.2 8.2-7.5 9.5C7.7 20.2 4.5 16.6 4.5 12V6zM8.8 12.2l2.3 2.3 4.3-4.6',
    upload: 'M12 15V4M7 9l5-5 5 5M5 20h14',
    sun: 'M12 8a4 4 0 100 8 4 4 0 000-8zM12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4',
    moon: 'M20 14.5A8 8 0 019.5 4a8 8 0 1010.5 10.5z',
    rotate: 'M20 12a8 8 0 11-2.4-5.7L20 8.6M20 4v4.6h-4.6',
    trash: 'M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3',
    plus: 'M12 5v14M5 12h14',
    minus: 'M5 12h14',
    move: 'M12 3v18M3 12h18M9 6l3-3 3 3M9 18l3 3 3-3M6 9l-3 3 3 3M18 9l3 3-3 3',
    pen: 'M4 20h4L19 9l-4-4L4 16zM13.5 6.5l4 4',
    crop: 'M6 2v14a2 2 0 002 2h14M2 6h14a2 2 0 012 2v14',
    download: 'M12 4v11M7 10l5 5 5-5M5 20h14',
    check: 'M5 12.5l4.5 4.5L19 7.5',
    image: 'M4 5h16v14H4zM4 15l4-4 5 5 3-3 4 4M15.5 9.5h.01',
    code: 'M8 7l-5 5 5 5M16 7l5 5-5 5M13.5 5l-3 14',
    compare: 'M12 3v18M4 6h5v12H4zM15 6h5v12h-5',
    edit: 'M4 6h16M4 12h10M4 18h7M17 14l3 3-3 3',
    fit: 'M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5',
    x: 'M6 6l12 12M18 6L6 18',
    lock: 'M6 11h12v9H6zM8.5 11V8a3.5 3.5 0 017 0v3',
    info: 'M12 3a9 9 0 100 18 9 9 0 000-18zM12 11v5M12 8h.01',
    sparkle: 'M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9zM19 16l.8 2.2L22 19l-2.2.8L19 22l-.8-2.2L16 19l2.2-.8z',
    camera: 'M4 8h3l2-3h6l2 3h3v11H4zM12 16.5a3.2 3.2 0 100-6.4 3.2 3.2 0 000 6.4z',
    wifiOff: 'M2 2l20 20M8.5 16.5a5 5 0 017 0M5 12.9a10 10 0 015.2-2.8M19 12.9a10 10 0 00-2.5-1.8M1.5 9a16 16 0 015-3M22.5 9A16 16 0 0011 5.1M12 20h.01',
    eyeOff: 'M3 3l18 18M10.6 6.1A9.8 9.8 0 0112 6c5 0 9 4.5 10 6-.4.6-1.4 1.9-2.8 3.1M6.6 6.6C4.4 8 2.8 10.2 2 12c1 1.5 5 6 10 6 1.7 0 3.2-.5 4.5-1.2M9.9 9.9a3 3 0 004.2 4.2',
    droplet: 'M12 3s6 6.5 6 11a6 6 0 01-12 0c0-4.5 6-11 6-11z',
    file: 'M6 3h8l4 4v14H6zM14 3v4h4',
    chevron: 'M6 9l6 6 6-6',
  } as const;
  export type IconName = keyof typeof PATHS;
</script>

<script lang="ts">
  let { name, size = 18, stroke = 2 }: { name: IconName; size?: number; stroke?: number } = $props();
</script>

<svg
  width={size}
  height={size}
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width={stroke}
  stroke-linecap="round"
  stroke-linejoin="round"
  aria-hidden="true"
  focusable="false"><path d={PATHS[name]} /></svg>
