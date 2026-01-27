import type { ParsedFrame } from "gifuct-js";
import { AudioBufferSource, BufferTarget, CanvasSource, Mp4OutputFormat, Output, QUALITY_MEDIUM, QUALITY_VERY_HIGH } from "mediabunny";

export async function exportToVideo(
  width: number,
  height: number,
  fps: number,
  audioFile: File,
  gifFrames: ParsedFrame[],
  frameDuration: number,
  offset: number
): Promise<Blob> {
  let frameImageData: ImageData | null = null;

  const canvas = new OffscreenCanvas(width, height);
  const ctx = canvas.getContext("2d") as OffscreenCanvasRenderingContext2D;

  // render a frame at a given time (in seconds)
  async function renderFrame(time: number) {
    const index = (Math.floor(time / frameDuration) + offset) % gifFrames.length;
    const frame = gifFrames[index];

    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, width, height);

    if (!frameImageData || frameImageData.width !== frame.dims.width || frameImageData.height !== frame.dims.height) {
      frameImageData = ctx.createImageData(frame.dims.width, frame.dims.height);
    }

    frameImageData.data.set(frame.patch);
    ctx.putImageData(frameImageData, frame.dims.left, frame.dims.top);
  }

  const output = new Output({
    format: new Mp4OutputFormat(),
    target: new BufferTarget()
  });

  const videoSource = new CanvasSource(canvas, {
    codec: "avc",
    bitrate: QUALITY_VERY_HIGH,
  });

  const audioSource = new AudioBufferSource({ codec: "aac", bitrate: QUALITY_MEDIUM });

  output.addVideoTrack(videoSource, { frameRate: fps });
  output.addAudioTrack(audioSource);

  console.log("executing export...");
  await output.start();

  // add audio media
  const audioCtx = new AudioContext();
  const audioBuffer = await audioCtx.decodeAudioData(await audioFile.arrayBuffer());
  await audioSource.add(audioBuffer);

  // add video media
  let framesAdded = 0;
  const frameCount = Math.ceil(audioBuffer.duration * fps);
  const duration = 1 / fps;
  while (framesAdded < frameCount) {
    const timestamp = framesAdded * duration;

    // console.log(`progress: ${((framesAdded / frameCount) * 100).toFixed(2)}%`);

    renderFrame(timestamp);

    await videoSource.add(timestamp, duration);
    framesAdded++;
  }

  await output.finalize();

  const buffer = output.target.buffer;
  const blob = new Blob([buffer!], { type: "video/mp4" });

  return blob;
}
