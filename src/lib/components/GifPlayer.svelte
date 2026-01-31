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
  let lastFrameDisposalType = $state(0);

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

    // only process if its a new frame
    if (newIndex !== frameIndex) {
      frameIndex = newIndex;
      const frame = frames[frameIndex];

      // Handle disposal of the PREVIOUS frame (but not on first frame)
      if (frameIndex !== 0) {
        if (lastFrameDisposalType === 2) {
          // disposal = 2: clear previous frame rectangle to transparent
          const prevFrame = frames[(frameIndex - 1 + frames.length) % frames.length];
          for (let py = 0; py < prevFrame.dims.height; py++) {
            for (let px = 0; px < prevFrame.dims.width; px++) {
              const idx = ((py + prevFrame.dims.top) * canvas.width + (px + prevFrame.dims.left)) * 4;
              fullFrameImageData.data[idx + 0] = 0;
              fullFrameImageData.data[idx + 1] = 0;
              fullFrameImageData.data[idx + 2] = 0;
              fullFrameImageData.data[idx + 3] = 0;
            }
          }
        } else if (lastFrameDisposalType === 3) {
          // disposal = 3: restore previous full frame
          if (previousFullFrame) {
            fullFrameImageData.data.set(previousFullFrame.data);
          }
        }
      }

      // save full frame before drawing if current frame uses disposal 3
      if (frame.disposalType === 3) {
        previousFullFrame = new ImageData(
          new Uint8ClampedArray(fullFrameImageData.data),
          fullFrameImageData.width,
          fullFrameImageData.height
        );
      }

      // blend patch over full frame
      const patchData = new ImageData(frame.dims.width, frame.dims.height);
      patchData.data.set(frame.patch);
      blendPatch(fullFrameImageData, patchData, frame.dims.left, frame.dims.top);

      // draw composited full frame to canvas
      ctx.putImageData(fullFrameImageData, 0, 0);

      // Save current frame's disposal type for next iteration
      lastFrameDisposalType = frame.disposalType;
    }

    requestAnimationFrame(renderFrame);
  }

  function updateGif() {
    if (frames.length === 0 || !canvas) return;

    canvas.width = frames[0].dims.width + frames[0].dims.left;
    canvas.height = frames[0].dims.height + frames[0].dims.top;

    // initialize full frame buffer
    fullFrameImageData = ctx.createImageData(canvas.width, canvas.height);
    previousFullFrame = null;

    // start at the first frame (matching export which starts at i=0)
    frameIndex = -1;
    lastFrameDisposalType = 0;
    startTime = performance.now();

    requestAnimationFrame(renderFrame);
  }

  export function reset() {
    frameIndex = 0;
    lastFrameDisposalType = 0;
    startTime = performance.now();
    previousFullFrame = null;

    if (fullFrameImageData) {
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
