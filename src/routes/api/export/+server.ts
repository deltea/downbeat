import type { RequestHandler } from "@sveltejs/kit";
import { BufferTarget, Mp4OutputFormat, Output, VideoSample, VideoSampleSource } from "mediabunny";

export const GET: RequestHandler = async () => {
  const sampleSource = new VideoSampleSource({
    codec: "avc",
    bitrate: 1e6,
  });

  const buffer = await Bun.file("./image.webp").arrayBuffer();
  const sample = new VideoSample(buffer, {
    format: "RGBX",
    codedWidth: 1280,
    codedHeight: 720,
    timestamp: 0,
    duration: 5,
  });

  await sampleSource.add(sample);

  const video = new Output({
    format: new Mp4OutputFormat(),
    target: new BufferTarget(),
  });

  video.addVideoTrack(sampleSource);

  await video.start();
  await video.finalize();

  const file = video.target.buffer;
  return new Response(file, {
    headers: {
      "Content-Type": "video/mp4",
      "Content-Disposition": 'attachment; filename="video.mp4"',
    },
  });
}
