<script lang="ts">
  import type { Config } from "$lib/types";
  import type { ParsedFrame } from "gifuct-js";
  import { onMount } from "svelte";

  let { config }: { config: Config } = $props();
  let canvas: HTMLCanvasElement;
  let ctx: CanvasRenderingContext2D;
  let interval: ReturnType<typeof setInterval> | null = $state(null);

  function showFrame(frame: ParsedFrame | string) {
    if (typeof frame === "string") return;
    const imageData = new ImageData(
      new Uint8ClampedArray(frame.patch),
      frame.dims.width,
      frame.dims.height
    );

    canvas.width = frame.dims.width;
    canvas.height = frame.dims.height;
    ctx.putImageData(imageData, 0, 0);
  }

  onMount(() => {
    ctx = canvas.getContext("2d") as CanvasRenderingContext2D;

    // time per beat in milliseconds
    const beat = 2;
    const time_per_beat = 60 / config.bpm * 1000 * beat;

    if (interval) clearInterval(interval);
    interval = setInterval(() => {
      if (config.images.length === 0) return;
      const frameDelay = time_per_beat / config.images.length;

      config.images.forEach((frame, i) => {
        setTimeout(() => showFrame(frame), i * frameDelay);
      });
    }, time_per_beat);
  });
</script>

<div class="w-full aspect-video flex justify-center items-center">
  <canvas bind:this={canvas} class="object-cover rounded-sm"></canvas>
</div>
<!-- <img src={config.images[currentFrame]} alt="frame {currentFrame}" class="w-full h-full object-cover rounded-sm" /> -->
