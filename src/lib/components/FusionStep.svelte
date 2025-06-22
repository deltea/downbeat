<script lang="ts">
  import type { Config } from "$lib/types";
    import { Slider } from "bits-ui";
  import type { ParsedFrame } from "gifuct-js";
  import { onMount } from "svelte";

  let { config }: { config: Config } = $props();
  let canvas: HTMLCanvasElement;
  let ctx: CanvasRenderingContext2D;
  let interval: ReturnType<typeof setInterval> | null = $state(null);
  let frameOffset = $state(0);

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

      for (let i = 0; i < config.images.length; i++) {
        const index = (i + frameOffset) % config.images.length;
        const frame = config.images[index];
        setTimeout(() => showFrame(frame), i * frameDelay);
      }
    }, time_per_beat);
  });
</script>

<div class="flex flex-col gap-6">
  <div class="w-full aspect-video flex justify-center items-center">
    <canvas bind:this={canvas} class="object-cover rounded-sm"></canvas>
  </div>

  <Slider.Root
    type="single"
    bind:value={frameOffset}
    min={0}
    max={config.images.length - 1}
    class="relative flex items-center w-full hover:cursor-grab active:cursor-grabbing"
  >
    <span class="h-2 w-full bg-dark">
      <Slider.Range class="bg-fg h-full absolute" />
    </span>

    <Slider.Thumb
      index={0}
      class="size-6 bg-fg outline-none rounded-full"
    />
  </Slider.Root>
</div>

<!-- <img src={config.images[currentFrame]} alt="frame {currentFrame}" class="w-full h-full object-cover rounded-sm" /> -->
