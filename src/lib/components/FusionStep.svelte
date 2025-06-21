<script lang="ts">
  import type { Config } from "../../types";
  import { onMount } from "svelte";

  let { config }: { config: Config } = $props();
  let canvas: HTMLCanvasElement;
  let ctx: CanvasRenderingContext2D;

  onMount(() => {
    ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
    console.log(config);
  });
</script>

<canvas bind:this={canvas} class="w-full h-full rounded-sm"></canvas>
