<script lang="ts">
  import type { Mode } from "$lib/types";
  import { Slider } from "bits-ui";
  import { onDestroy, onMount } from "svelte";

  import Radio from "./Radio.svelte";
  import GifPlayer from "./GifPlayer.svelte";

  const SPEEDS = [
    { value: "0.5", label: "0.5x" },
    { value: "1", label: "1x" },
    { value: "2", label: "2x" },
    { value: "4", label: "4x" },
    { value: "8", label: "8x" },
    { value: "16", label: "16x" }
  ]

  let { images, gif, bpm, mode }: {
    images: File[],
    gif: File | null,
    bpm: number,
    mode: Mode
  } = $props();

  let interval: ReturnType<typeof setInterval> | null = $state(null);
  let offset = $state(0);
  let speed = $state("2");
  let imageIndex = $state(0);
  let imageSrc: string | null = $state(null);
  let timePerBeat = $derived(60 / bpm * 1000 * +speed);
  let gifFrameAmount = $state(0);

  function renderSlideshowFrame() {
    const frame = images[imageIndex];
    imageSrc = URL.createObjectURL(frame);
    imageIndex = (imageIndex + 1) % images.length;

    setTimeout(() => {
      requestAnimationFrame(renderSlideshowFrame);
    }, timePerBeat);
  }

  onMount(() => {
    if (mode === "slideshow") renderSlideshowFrame();
  });

  onDestroy(() => {
    if (interval) clearInterval(interval);
  });
</script>

<div class="flex flex-col gap-6 w-full">
  {#if mode === "gif"}
    <GifPlayer {gif} {timePerBeat} {offset} bind:gifFrameAmount />
  {:else}
    <div class="w-full aspect-video flex justify-center items-center">
      <img src={imageSrc} alt="preview frame">
    </div>
  {/if}

  <Radio items={SPEEDS} name="speed-multiplier" bind:value={speed} />

  <Slider.Root
    type="single"
    bind:value={offset}
    min={0}
    step={1}
    max={mode === "gif" ? gifFrameAmount : timePerBeat}
    class="relative flex items-center w-full hover:cursor-grab active:cursor-grabbing"
  >
    {#snippet children({ tickItems })}
      <span class="h-2 w-full bg-surface-0 rounded-sm duration-100">
        <Slider.Range class="bg-fg h-full absolute rounded-sm duration-100" />
      </span>

      <Slider.Thumb
        index={0}
        class="size-6 bg-fg outline-none rounded-full duration-100 z-10"
      />

      {#if tickItems.length < 20}
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
