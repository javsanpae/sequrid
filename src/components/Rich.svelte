<script lang="ts">
  /**
   * Renders a dictionary string with a tiny inline markup, without {@html}:
   * `[Key]` → <kbd>, `**text**` → <strong>, `` `text` `` → <code>.
   */
  let { text }: { text: string } = $props();

  type Part = { kind: 'text' | 'kbd' | 'strong' | 'code'; value: string };

  const parts = $derived.by(() => {
    const out: Part[] = [];
    for (const piece of text.split(/(\[[^\]]+\]|\*\*[^*]+\*\*|`[^`]+`)/)) {
      if (!piece) continue;
      if (piece.startsWith('[') && piece.endsWith(']')) out.push({ kind: 'kbd', value: piece.slice(1, -1) });
      else if (piece.startsWith('**') && piece.endsWith('**') && piece.length > 4) out.push({ kind: 'strong', value: piece.slice(2, -2) });
      else if (piece.startsWith('`') && piece.endsWith('`') && piece.length > 2) out.push({ kind: 'code', value: piece.slice(1, -1) });
      else out.push({ kind: 'text', value: piece });
    }
    return out;
  });
</script>

{#each parts as p, i (i)}{#if p.kind === 'kbd'}<kbd>{p.value}</kbd>{:else if p.kind === 'strong'}<strong>{p.value}</strong>{:else if p.kind === 'code'}<code>{p.value}</code>{:else}{p.value}{/if}{/each}
