<script lang="ts">
  import { decompressFrames, parseGIF, type ParsedFrame } from "gifuct-js";
  import { onMount } from "svelte";

  let { gif, timePerBeat, offset, gifFrameAmount = $bindable() }: {
    gif: File | null,
    timePerBeat: number,
    gifFrameAmount: number
    offset: number
  } = $props();

  let canvas: HTMLCanvasElement;
  let ctx: CanvasRenderingContext2D;
  let bufferCanvas: HTMLCanvasElement;
  let bufferCtx: CanvasRenderingContext2D;

  let frameImageData: ImageData | null = $state(null);
  let needsDisposal = $state(false);
  let frames = $state<ParsedFrame[]>([]);
  let frameIndex = $state(0);
  let isLoading = $state(true);
  let lastFrameTime = performance.now();
  let duration = $derived(timePerBeat / frames.length);

  function renderFrame() {
    if (!canvas) return;

    const frame = frames[(frameIndex + offset) % frames.length];
    const now = performance.now();
    const elapsed = now - lastFrameTime;

    if (elapsed >= duration) {
      lastFrameTime = now - (elapsed % duration);

      if (needsDisposal) {
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

      frameIndex++
      if (frameIndex >= frames.length) {
        frameIndex = 0;
      }
    }

    requestAnimationFrame(renderFrame);
  }

  function readGif(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!gif) {
        console.error("No gif file provided");
        reject(new Error("No gif file provided"));
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const buffer = e.target?.result as ArrayBuffer;
          const data = parseGIF(buffer);
          frames = decompressFrames(data, true);

          canvas.width = bufferCanvas.width = frames[0].dims.width;
          canvas.height = bufferCanvas.height = frames[0].dims.height;

          gifFrameAmount = frames.length;

          isLoading = false;
          resolve();
        } catch (error) {
          reject(error);
        }
      };

      reader.onerror = (error) => {
        reject(error);
      };

      reader.readAsArrayBuffer(gif);
    });
  }

  onMount(async () => {
    ctx = canvas.getContext("2d") as CanvasRenderingContext2D;

    bufferCanvas = document.createElement("canvas");
    bufferCtx = bufferCanvas.getContext("2d") as CanvasRenderingContext2D;

    await readGif();
    renderFrame();
  });
</script>

<div class="w-full flex justify-center items-center">
  {#if isLoading}
    <p class="h-[20rem] flex justify-center items-center">preview loading...</p>
  {/if}

  <canvas bind:this={canvas} class="object-contain max-h-[40rem] size-full rounded-sm" hidden={isLoading}></canvas>
</div>
