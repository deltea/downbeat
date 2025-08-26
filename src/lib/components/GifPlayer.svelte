<script lang="ts">
  import { decompressFrames, parseGIF, type ParsedFrame } from "gifuct-js";
  import { onMount } from "svelte";

  let { gif, bpm, offset }: {
    gif: File | null,
    bpm: number,
    offset: number
  } = $props();

  let canvas: HTMLCanvasElement;
  let ctx: CanvasRenderingContext2D;

  let frames = $state<ParsedFrame[]>([]);
  let frameIndex = $state(0);
  let lastFrameTime = $state(0);
  let frameDuration = $state(100);
  let frameImageData: ImageData | null = $state(null);
  let bufferCanvas: HTMLCanvasElement;
  let bufferCtx: CanvasRenderingContext2D;

  function renderFrame() {
    if (!canvas) return;

    const frame = frames[(frameIndex + offset) % frames.length];
    const now = performance.now();
    const elapsed = now - lastFrameTime;

    if (elapsed >= frameDuration) {
      lastFrameTime = now - (elapsed % frameDuration);

      // if (needsDisposal) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      //   needsDisposal = false;
      // }

      if (!frameImageData || frameImageData.width !== frame.dims.width || frameImageData.height !== frame.dims.height) {
        bufferCanvas.width = frame.dims.width;
        bufferCanvas.height = frame.dims.height;
        frameImageData = bufferCtx.createImageData(frame.dims.width, frame.dims.height);
      }

      frameImageData.data.set(frame.patch);
      ctx.putImageData(frameImageData, frame.dims.left, frame.dims.top);

      // if (frame.disposalType === 2) {
      //   needsDisposal = true;
      // }

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
        console.error("no gif file provided");
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const buffer = e.target?.result as ArrayBuffer;
        const data = parseGIF(buffer);
        frames = decompressFrames(data, true);

        canvas.width = bufferCanvas.width = frames[0].dims.width;
        canvas.height = bufferCanvas.height = frames[0].dims.height;
        resolve();
      };

      reader.onerror = (e) => reject(e);
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

<canvas bind:this={canvas} class="w-full rounded-sm"></canvas>
