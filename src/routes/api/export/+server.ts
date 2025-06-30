import type { RequestHandler } from "@sveltejs/kit";
import { spawn } from "child_process";

export const POST: RequestHandler = async ({ request }) => {
  const form = await request.formData();
  const video = form.get("gif") as File;
  const audio = form.get("audio") as File;

  if (!video) return new Response("no video uploaded", { status: 400 });
  if (!audio) return new Response("no audio uploaded", { status: 400 });

  const videoPath = `/tmp/input.gif`;
  const audioPath = `/tmp/audio.mp3`;
  const outputPath = `/tmp/output.mp4`;

  await Bun.write(videoPath, await video.arrayBuffer());
  await Bun.write(audioPath, await audio.arrayBuffer());

  await new Promise((resolve, reject) => {
    const ff = spawn("ffmpeg", [
      "-i", videoPath,
      "-vf", "fps=60,scale=trunc(iw/2)*2:trunc(ih/2)*2:flags=lanczos",
      "-pix_fmt", "yuv420p",
      "-c:v", "libx264",
      "-y", outputPath
    ]);

    ff.stderr.on("data", data => console.log(data.toString()));
    ff.on("close", code => (code === 0 ? resolve(0) : reject(code)));
  });

  const fileBuffer = await Bun.file(outputPath).arrayBuffer();

  return new Response(fileBuffer, {
    headers: {
      "Content-Type": "video/mp4",
      "Content-Disposition": `attachment; filename="output.mp4"`,
    }
  });
}
