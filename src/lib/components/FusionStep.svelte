<script lang="ts">
  import type { Mode } from "$lib/types";
  import { Slider } from "bits-ui";
  import type { ParsedFrame } from "gifuct-js";
  import { onDestroy, onMount } from "svelte";
  import Radio from "./Radio.svelte";

  const SPEEDS = [
    { value: "0.5", label: "0.5x" },
    { value: "1", label: "1x" },
    { value: "2", label: "2x" },
    { value: "4", label: "4x" },
    { value: "8", label: "8x" },
    { value: "16", label: "16x" }
  ]

  let { frames, bpm, mode }: { frames: (File | ParsedFrame)[], bpm: number, mode: Mode } = $props();

  let canvas: HTMLCanvasElement;
  let ctx: CanvasRenderingContext2D;
  let bufferCanvas: HTMLCanvasElement;
  let bufferCtx: CanvasRenderingContext2D;

  let interval: ReturnType<typeof setInterval> | null = $state(null);
  let frameOffset = $state(0);
  let speed = $state("2");
  let imageIndex = $state(0);
  let lastFrame: ParsedFrame | null = $state(null);

  function showImageFrame(frame: File) {
    if (!frame) return;

    const img = new Image();
    img.src = URL.createObjectURL(frame);
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      URL.revokeObjectURL(img.src);
    };
  }

  async function showGifFrame(frame: ParsedFrame) {
    if (!frame) return;

    if (lastFrame && lastFrame.disposalType === 2) {
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      bufferCtx.fillRect(0, 0, bufferCanvas.width, bufferCanvas.height);
    }

    const imageData = bufferCtx.createImageData(frame.dims.width, frame.dims.height);
    imageData.data.set(frame.patch);

    bufferCtx.putImageData(imageData, frame.dims.left, frame.dims.top);
    ctx.drawImage(bufferCanvas, 0, 0);

    lastFrame = frame;
  }

  function setBeatInterval() {
    const time_per_beat = 60 / bpm * 1000 * +speed;

    imageIndex = 0;

    if (interval) clearInterval(interval);
    interval = setInterval(() => {
      if (frames.length === 0) return;
      if (mode === "gif") {
        const frameDelay = time_per_beat / frames.length;

        for (let i = 0; i < frames.length; i++) {
          const index = (i + frameOffset) % frames.length;
          const frame = frames[index];
          if (frame instanceof File) continue;
          imageIndex = index;
          setTimeout(() => showGifFrame(frame), i * frameDelay);
        }
      } else {
        const frame = frames[imageIndex];
        if (frame instanceof File) {
          showImageFrame(frame);
        }

        imageIndex = (imageIndex + 1) % frames.length;
      }
    }, time_per_beat);
  }

  onMount(() => {
    ctx = canvas.getContext("2d") as CanvasRenderingContext2D;

    bufferCanvas = document.createElement("canvas");
    bufferCtx = bufferCanvas.getContext("2d") as CanvasRenderingContext2D;

    if (!(frames[0] instanceof File)) {
      canvas.width = bufferCanvas.width = frames[0].dims.width;
      canvas.height = bufferCanvas.height = frames[0].dims.height;

      showGifFrame(frames[0]);
    }

    setBeatInterval();
  });

  onDestroy(() => {
    if (interval) clearInterval(interval);
  });
</script>

<div class="flex flex-col gap-6 w-full">
  <div class="w-full aspect-video flex justify-center items-center">
    <canvas bind:this={canvas} class="object-cover rounded-sm"></canvas>
  </div>

  <Radio items={SPEEDS} name="speed-multiplier" bind:value={speed} onValueChange={setBeatInterval} />

  <Slider.Root
    type="single"
    bind:value={frameOffset}
    min={0}
    max={frames.length - 1}
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
