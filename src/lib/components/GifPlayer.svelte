<script lang="ts">
  import type { ParsedFrame } from "gifuct-js";
  import { onMount } from "svelte";
  import { loop } from "$lib/utils";

  let { frameDuration, offset, frames, canvas = $bindable() }: {
    frameDuration: number,
    offset: number,
    frames: ParsedFrame[],
    canvas: HTMLCanvasElement
  } = $props();

  let ctx: CanvasRenderingContext2D;

  let frameIndex = $state(0);
  let startTime = $state(0);
  let frameImageData: ImageData | null = $state(null);
  let bufferCanvas: HTMLCanvasElement;
  let bufferCtx: CanvasRenderingContext2D;
  let needsDisposal = $state(false);

  $effect(() => {
    if (!frames) return;
    updateGif();
  });

  function renderFrame() {
    if (!canvas || !frames || frames.length === 0) return;

    const now = performance.now();
    const elapsed = now - startTime;

    frameIndex = (Math.floor(elapsed / (frameDuration * 1000)) + offset) % frames.length;
    const frame = frames[loop(frameIndex + offset, 0, frames.length)];

    if (needsDisposal || (frameIndex + offset) % frames.length === 0) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      needsDisposal = false;
    }

    if (!frameImageData || frameImageData.width !== frame.dims.width || frameImageData.height !== frame.dims.height) {
      bufferCanvas.width = frame.dims.width;
      bufferCanvas.height = frame.dims.height;
      frameImageData = bufferCtx.createImageData(frame.dims.width, frame.dims.height);
    }

    frameImageData.data.set(frame.patch);
    bufferCtx.putImageData(frameImageData, 0, 0);
    ctx.drawImage(bufferCanvas, frame.dims.left, frame.dims.top);

    if (frame.disposalType === 2) {
      needsDisposal = true;
    }

    if (frameIndex >= frames.length) {
      frameIndex = 0;
    }

    requestAnimationFrame(renderFrame);
  }

  function updateGif() {
    if (
      frames.length === 0 ||
      !canvas ||
      !bufferCanvas
    ) return;

    canvas.width = bufferCanvas.width = frames[0].dims.width + frames[0].dims.left;
    canvas.height = bufferCanvas.height = frames[0].dims.height + frames[0].dims.top;

    frameIndex = frames.length - 1;
    startTime = performance.now();

    requestAnimationFrame(renderFrame);
  }

  export function reset() {
    frameIndex = 0;
    startTime = performance.now();
    needsDisposal = false;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < frames.length; i++) {
      const frame = frames[i];
      frameImageData = bufferCtx.createImageData(frame.dims.width, frame.dims.height);
      frameImageData.data.set(frame.patch);
      ctx.putImageData(frameImageData, frame.dims.left, frame.dims.top);
    }
  }

  onMount(async () => {
    ctx = canvas.getContext("2d") as CanvasRenderingContext2D;

    bufferCanvas = document.createElement("canvas");
    bufferCtx = bufferCanvas.getContext("2d") as CanvasRenderingContext2D;

    updateGif();
  });
</script>

<canvas bind:this={canvas}></canvas>
