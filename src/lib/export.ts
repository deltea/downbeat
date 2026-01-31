import type { ParsedFrame } from "gifuct-js";
import { AudioBufferSource, BufferTarget, getFirstEncodableVideoCodec, Mp4OutputFormat, Output, Quality, QUALITY_MEDIUM, VideoSampleSource, VideoSample } from "mediabunny";
import { exportProgress } from "./stores";

export async function exportToVideo(
  width: number,
  height: number,
  fps: number,
  audioFile: File,
  gifFrames: ParsedFrame[],
  frameDuration: number,
  offset: number,
  quality: Quality
): Promise<Blob> {
  // full accumulated frame buffer
  const fullFrameImageData = new ImageData(width, height);
  let previousFullFrame: ImageData | null = null;

  // cache all patches to avoid recreating them
  const patchDataCache = new Map<number, ImageData>();
  for (let i = 0; i < gifFrames.length; i++) {
    const frame = gifFrames[i];
    const patchData = new ImageData(frame.dims.width, frame.dims.height);
    patchData.data.set(frame.patch);
    patchDataCache.set(i, patchData);
  }

  // blend a patch over full frame respecting alpha
  function blendPatch(full: ImageData, patch: ImageData, x: number, y: number) {
    const fw = full.width;
    const pw = patch.width;
    const ph = patch.height;
    const fullData = full.data;
    const patchData = patch.data;

    // process row by row for better cache locality
    for (let py = 0; py < ph; py++) {
      const fullRowStart = ((py + y) * fw + x) * 4;
      const patchRowStart = py * pw * 4;

      for (let px = 0; px < pw; px++) {
        const patchIdx = patchRowStart + px * 4;
        const fullIdx = fullRowStart + px * 4;

        const alpha = patchData[patchIdx + 3];

        // skip fully transparent pixels
        if (alpha === 0) continue;

        // fast path for fully opaque pixels
        if (alpha === 255) {
          fullData[fullIdx] = patchData[patchIdx];
          fullData[fullIdx + 1] = patchData[patchIdx + 1];
          fullData[fullIdx + 2] = patchData[patchIdx + 2];
          fullData[fullIdx + 3] = 255;
          continue;
        }

        // alpha blending for semi-transparent pixels
        const alphaRatio = alpha / 255;
        const invAlpha = 1 - alphaRatio;
        fullData[fullIdx] = patchData[patchIdx] * alphaRatio + fullData[fullIdx] * invAlpha;
        fullData[fullIdx + 1] = patchData[patchIdx + 1] * alphaRatio + fullData[fullIdx + 1] * invAlpha;
        fullData[fullIdx + 2] = patchData[patchIdx + 2] * alphaRatio + fullData[fullIdx + 2] * invAlpha;
        fullData[fullIdx + 3] = Math.max(alpha, fullData[fullIdx + 3]);
      }
    }
  }

  // render a frame at a given time in seconds and return sample
  function createVideoSample(time: number): VideoSample {
    const index = (Math.floor(time / frameDuration) + offset) % gifFrames.length;
    const frame = gifFrames[index];

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
      const fullData = fullFrameImageData.data;
      const left = frame.dims.left;
      const top = frame.dims.top;
      const fwidth = frame.dims.width;
      const fheight = frame.dims.height;
      const canvasWidth = width;

      for (let py = 0; py < fheight; py++) {
        const rowStart = ((py + top) * canvasWidth + left) * 4;
        const rowEnd = rowStart + fwidth * 4;
        fullData.fill(0, rowStart, rowEnd);
      }
    }

    // blend patch over full frame (use cached patch data)
    const patchData = patchDataCache.get(index)!;
    blendPatch(fullFrameImageData, patchData, frame.dims.left, frame.dims.top);

    // create sample directly from pixel data
    const timestamp = Math.floor(time * 1_000_000);
    const duration = Math.floor((1 / fps) * 1_000_000);

    const videoFrame = new VideoFrame(fullFrameImageData.data.buffer, {
      timestamp,
      duration,
      format: 'RGBA',
      codedWidth: width,
      codedHeight: height,
    });

    return new VideoSample(videoFrame);
  }

  // setup mp4 output
  const output = new Output({
    format: new Mp4OutputFormat(),
    target: new BufferTarget(),
  });

  const codec = await getFirstEncodableVideoCodec(
    ["avc", "hevc", "vp8"],
    { width, height, bitrate: quality },
  );
  const videoSource = new VideoSampleSource({
    codec: codec ?? "avc",
    bitrate: quality,
  });

  const audioSource = new AudioBufferSource({ codec: "aac", bitrate: QUALITY_MEDIUM });

  output.addVideoTrack(videoSource, { frameRate: fps });
  output.addAudioTrack(audioSource);

  await output.start();

  // decode and add audio
  const audioCtx = new AudioContext();
  const audioBuffer = await audioCtx.decodeAudioData(await audioFile.arrayBuffer());
  await audioSource.add(audioBuffer);

  // add video frames
  const totalFrames = Math.ceil(audioBuffer.duration * fps);
  const secondsPerFrame = 1 / fps;

  for (let i = 0; i < totalFrames; i++) {
    const timestamp = Math.min(i * secondsPerFrame, audioBuffer.duration);
    const videoSample = createVideoSample(timestamp);
    await videoSource.add(videoSample);
    exportProgress.set((i + 1) / totalFrames);
    videoSample.close();
  }

  await output.finalize();

  return new Blob([output.target.buffer!], { type: "video/mp4" });
}
