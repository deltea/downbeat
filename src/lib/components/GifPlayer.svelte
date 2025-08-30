<script lang="ts">
  import type { ParsedFrame } from "gifuct-js";
  import { onMount } from "svelte";

  let { frameDuration, offset, frames }: {
    frameDuration: number,
    offset: number,
    frames: ParsedFrame[]
  } = $props();

  let canvas: HTMLCanvasElement;
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

    const targetFrameIndex = Math.floor(elapsed / frameDuration) % frames.length;

    if (targetFrameIndex !== frameIndex) {
      frameIndex = targetFrameIndex;

      const frame = frames[(frameIndex + offset) % frames.length];

      if (needsDisposal || frameIndex === 0) {
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
    }

    requestAnimationFrame(renderFrame);
  }

  function updateGif() {
    if (
      frames.length === 0 ||
      !canvas ||
      !bufferCanvas
    ) return;

    console.log(frameDuration);
    canvas.width = bufferCanvas.width = frames[0].dims.width + frames[0].dims.left;
    canvas.height = bufferCanvas.height = frames[0].dims.height + frames[0].dims.top;

    frameIndex = 0;
    startTime = performance.now();

    requestAnimationFrame(renderFrame);
  }

  onMount(async () => {
    ctx = canvas.getContext("2d") as CanvasRenderingContext2D;

    bufferCanvas = document.createElement("canvas");
    bufferCtx = bufferCanvas.getContext("2d") as CanvasRenderingContext2D;

    console.log(frameDuration);

    updateGif();
  });
</script>

<canvas
  bind:this={canvas}
  class="{frames[0]?.dims.width > frames[0]?.dims.height ? "w-full" : "h-full"} rounded-sm"
></canvas>
