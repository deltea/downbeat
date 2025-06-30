import type { RequestHandler } from "@sveltejs/kit";
import { spawn } from "child_process";
import path from "path";

export const POST: RequestHandler = async ({ request }) => {
  const form = await request.formData();
  const gif = form.get("gif") as File;
  const audio = form.get("audio") as File;
  const bpm = form.get("bpm") as string;
  const audioDuration = form.get("duration") as string;

  if (!gif) return new Response("no video uploaded", { status: 400 });
  if (!audio) return new Response("no audio uploaded", { status: 400 });

  const gifPath = `/tmp/input.gif`;
  const audioPath = `/tmp/audio.mp3`;
  const videoPath = `/tmp/video.mp4`;
  const finalPath = `/tmp/final.mp4`;

  await Bun.write(gifPath, await gif.arrayBuffer());
  await Bun.write(audioPath, await audio.arrayBuffer());

  const { default: gifFrames } = await import("gif-frames");

  const frames: [{ getImage: () => NodeJS.ReadableStream }] = await gifFrames({
    url: gifPath,
    frames: "all",
    outputType: "png"
  });

  const timePerBeat = 60 / +bpm * 2;
  const duration = timePerBeat / frames.length;

  console.log(`${frames.length} frames extracted from gif`);

  let fileListText = "";
  const framePaths: string[] = [];
  for (let i = 0; i < frames.length; i++) {
    const img = frames[i].getImage();
    const framePath = path.join("/tmp", `frame-${i}.png`);
    await Bun.write(framePath, await streamToBuffer(img));

    console.log(`writing frame ${i} to disk`);
    framePaths.push(framePath);
  }

  const beats = Math.ceil(+audioDuration / timePerBeat);
  for (let beat = 0; beat < beats; beat++) {
    for (const frame of framePaths) {
      fileListText += `file ${frame}\n`;
      fileListText += `duration ${duration.toFixed(4)}\n`;
    }
  }

  await Bun.write("/tmp/filelist.txt", fileListText);
  console.log(await Bun.file("/tmp/filelist.txt").text());

  // turn gif into mp4
  await runFFmpeg([
    "-f", "concat",
    "-safe", "0",
    "-i", "/tmp/filelist.txt",
    "-vsync", "vfr",
    "-pix_fmt", "yuv420p",
    "-c:v", "libx264",
    "-movflags", "faststart",
    "-vf", "format=rgba,scale=trunc(iw/2)*2:trunc(ih/2)*2:flags=lanczos,format=yuv420p",
    "-y", videoPath
  ]);

  await runFFmpeg([
    "-i", videoPath,
    "-i", audioPath,
    "-c:v", "copy",
    "-c:a", "aac",
    "-shortest",
    "-y", finalPath
  ]);

  const fileBuffer = await Bun.file(finalPath).arrayBuffer();

  return new Response(fileBuffer, {
    headers: {
      "Content-Type": "video/mp4",
      "Content-Disposition": `attachment; filename="output.mp4"`,
    }
  });
}

async function runFFmpeg(args: string[]) {
  return new Promise<number>((resolve, reject) => {
    const ff = spawn("ffmpeg", args);

    ff.stderr.on("data", data => console.log(data.toString()));
    ff.on("close", code => (code === 0 ? resolve(0) : reject(code)));
  });
}

function streamToBuffer(stream: NodeJS.ReadableStream): Promise<Uint8Array> {
  return new Promise((resolve, reject) => {
    const chunks: Uint8Array[] = [];
    stream.on("data", (chunk) => chunks.push(chunk));
    stream.on("end", () => resolve(Buffer.concat(chunks)));
    stream.on("error", reject);
  });
}
