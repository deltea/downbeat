import type { ParsedFrame } from "gifuct-js";
import { AudioBufferSource, BufferTarget, getFirstEncodableVideoCodec, Mp4OutputFormat, Output, Quality, QUALITY_MEDIUM, VideoSampleSource, VideoSample } from "mediabunny";

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

  // blend a patch over full frame respecting alpha
  function blendPatch(full: ImageData, patch: ImageData, x: number, y: number) {
    const fw = full.width
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

  // render a frame at a given time in seconds and return videosample
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
      for (let py = 0; py < frame.dims.height; py++) {
        for (let px = 0; px < frame.dims.width; px++) {
          const idx = ((py + frame.dims.top) * width + (px + frame.dims.left)) * 4;
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

    // create videosample directly from pixel data
    const timestamp = Math.floor(time * 1_000_000);
    const duration = Math.floor((1 / fps) * 1_000_000);

    const videoFrame = new VideoFrame(fullFrameImageData.data.buffer, {
      timestamp,
      duration,
      format: 'RGBA',
      codedWidth: width,
      codedHeight: height,
    });

    // wrap videoframe in videosample
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
    videoSample.close();
  }

  await output.finalize();

  return new Blob([output.target.buffer!], { type: "video/mp4" });
}
