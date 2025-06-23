<script lang="ts">
  import type { Config } from "$lib/types";
  import { Slider } from "bits-ui";
  import type { ParsedFrame } from "gifuct-js";
  import { onMount } from "svelte";
  import Radio from "./Radio.svelte";

  const SPEEDS = [
    { value: "0.5", label: "0.5x" },
    { value: "1", label: "1x" },
    { value: "2", label: "2x" },
    { value: "4", label: "4x" },
  ]

  let { config }: { config: Config } = $props();
  let canvas: HTMLCanvasElement;
  let ctx: CanvasRenderingContext2D;
  let interval: ReturnType<typeof setInterval> | null = $state(null);
  let frameOffset = $state(0);
  let speed = $state("2");

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

  function setBeatInterval() {
    const time_per_beat = 60 / config.bpm * 1000 * +speed;

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
  }

  onMount(() => {
    ctx = canvas.getContext("2d") as CanvasRenderingContext2D;

    setBeatInterval();
  });
</script>

<div class="flex flex-col gap-6">
  <div class="w-[24rem] aspect-video flex justify-center items-center">
    <canvas bind:this={canvas} class="object-cover rounded-sm"></canvas>
  </div>

  <Radio items={SPEEDS} name="speed-multiplier" bind:value={speed} onValueChange={setBeatInterval} />

  <Slider.Root
    type="single"
    bind:value={frameOffset}
    min={0}
    max={config.images.length - 1}
    class="relative flex items-center w-full hover:cursor-grab active:cursor-grabbing"
  >
    {#snippet children({ tickItems })}
      <span class="h-2 w-full bg-dark rounded-sm duration-100">
        <Slider.Range class="bg-fg h-full absolute rounded-sm duration-100" />
      </span>

      <Slider.Thumb
        index={0}
        class="size-6 bg-fg outline-none rounded-full duration-100 z-10"
      />

      {#if tickItems.length < 10}
        {#each tickItems as { index } (index)}
          <Slider.Tick
            index={index}
            class="absolute top-0 w-[2px] h-2 bg-bg"
          />
        {/each}
      {/if}
    {/snippet}
  </Slider.Root>
</div>

<!-- <img src={config.images[currentFrame]} alt="frame {currentFrame}" class="w-full h-full object-cover rounded-sm" /> -->
