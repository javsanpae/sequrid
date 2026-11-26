<script lang="ts">
  import { renderOriginal } from '../lib/render';
  import type { Face } from '../lib/state.svelte';

  let { face }: { face: Face } = $props();
  let canvas: HTMLCanvasElement;

  $effect(() => {
    const snapshot = { image: face.image, rotation: face.rotation, frame: { ...face.frame } };
    renderOriginal(snapshot, 220, canvas);
  });
</script>

<canvas bind:this={canvas} aria-hidden="true"></canvas>

<style>
  canvas {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }
</style>
