<script lang="ts">
  import type { ParsedFrame } from "gifuct-js";
  import { onMount } from "svelte";

  let { frameDuration, offset, frames, canvas = $bindable() }: {
    frameDuration: number,
    offset: number,
    frames: ParsedFrame[],
    canvas: HTMLCanvasElement
  } = $props();

  let ctx: CanvasRenderingContext2D;

  let frameIndex = $state(0);
  let startTime = $state(0);
  let fullFrameImageData: ImageData | null = null;
  let previousFullFrame: ImageData | null = null;

  $effect(() => {
    if (!frames) return;
    updateGif();
  });

  // blend a patch over full frame respecting alpha
  function blendPatch(full: ImageData, patch: ImageData, x: number, y: number) {
    const fw = full.width;
    const pw = patch.width;
    const ph = patch.height;
    const fullData = full.data;
    const patchData = patch.data;

    for (let py = 0; py < ph; py++) {
      for (let px = 0; px < pw; px++) {
        const patchIdx = (py * pw + px) * 4;
        const fullIdx = ((py + y) * fw + (px + x)) * 4;

        const alpha = patchData[patchIdx + 3] / 255;
        if (alpha === 0) continue;

        const invAlpha = 1 - alpha;
        fullData[fullIdx + 0] = patchData[patchIdx + 0] * alpha + fullData[fullIdx + 0] * invAlpha;
        fullData[fullIdx + 1] = patchData[patchIdx + 1] * alpha + fullData[fullIdx + 1] * invAlpha;
        fullData[fullIdx + 2] = patchData[patchIdx + 2] * alpha + fullData[fullIdx + 2] * invAlpha;
        fullData[fullIdx + 3] = Math.max(patchData[patchIdx + 3], fullData[fullIdx + 3]);
      }
    }
  }

  function renderFrame() {
    if (!canvas || !frames || frames.length === 0 || !fullFrameImageData) return;

    const now = performance.now();
    // elapsed time in seconds
    const elapsed = (now - startTime) / 1000;

    const newIndex = (Math.floor(elapsed / frameDuration) + offset) % frames.length;

    // Only process if we're on a new frame
    if (newIndex !== frameIndex) {
      frameIndex = newIndex;
      const frame = frames[frameIndex];

      // disposal = 3: restore previous full frame
      if (frame.disposalType === 3 && previousFullFrame) {
        fullFrameImageData.data.set(previousFullFrame.data);
      }

      // save full frame before drawing if current frame uses disposal 3
      if (frame.disposalType === 3) {
        previousFullFrame = new ImageData(
          new Uint8ClampedArray(fullFrameImageData.data),
          fullFrameImageData.width,
          fullFrameImageData.height
        );
      }

      // disposal = 2: clear frame rectangle to transparent
      if (frame.disposalType === 2) {
        for (let py = 0; py < frame.dims.height; py++) {
          for (let px = 0; px < frame.dims.width; px++) {
            const idx = ((py + frame.dims.top) * canvas.width + (px + frame.dims.left)) * 4;
            fullFrameImageData.data[idx + 0] = 0;
            fullFrameImageData.data[idx + 1] = 0;
            fullFrameImageData.data[idx + 2] = 0;
            fullFrameImageData.data[idx + 3] = 0;
          }
        }
      }

      // blend patch over full frame
      const patchData = new ImageData(frame.dims.width, frame.dims.height);
      patchData.data.set(frame.patch);
      blendPatch(fullFrameImageData, patchData, frame.dims.left, frame.dims.top);

      // draw composited full frame to canvas
      ctx.putImageData(fullFrameImageData, 0, 0);
    }

    requestAnimationFrame(renderFrame);
  }

  function updateGif() {
    if (frames.length === 0 || !canvas) return;

    canvas.width = frames[0].dims.width + frames[0].dims.left;
    canvas.height = frames[0].dims.height + frames[0].dims.top;

    // Initialize full frame buffer
    fullFrameImageData = ctx.createImageData(canvas.width, canvas.height);
    previousFullFrame = null;

    // Start at the first frame (matching export which starts at i=0)
    frameIndex = -1; // Set to -1 so first render triggers at index 0
    startTime = performance.now();

    requestAnimationFrame(renderFrame);
  }

  export function reset() {
    frameIndex = 0;
    startTime = performance.now();
    previousFullFrame = null;

    if (fullFrameImageData) {
      // Clear the full frame buffer
      fullFrameImageData.data.fill(0);
    }
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }

  onMount(async () => {
    ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
    updateGif();
  });
</script>

<canvas bind:this={canvas}></canvas>
