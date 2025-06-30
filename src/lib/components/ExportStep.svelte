<script lang="ts">
  import type { Mode } from "$lib/types";
  import { Progress } from "bits-ui";
  import { onMount } from "svelte";
  import { FFmpeg } from "@ffmpeg/ffmpeg";
  import { decompressFrames, parseGIF, type ParsedFrame } from "gifuct-js";
  import { toBlobURL } from "@ffmpeg/util";

  const ffmpeg = new FFmpeg();
  ffmpeg.on("progress", (progress) => console.log(progress));

  let { images, gif, bpm, mode, musicFile }: {
    images: File[],
    gif: File | null,
    bpm: number,
    mode: Mode,
    musicFile: File | null
  } = $props();

  let canExport = $derived((mode === "gif" ? gif : images.length > 0) && bpm !== Infinity);
  let resultUrl: string | null = $state(null);

  function exportSlideshow(ffmpeg: FFmpeg) {

  }

  async function exportGif(ffmpeg: FFmpeg) {
    if (!gif) {
      console.warn("no gif file provided");
      return;
    }
    if (!musicFile) {
      console.warn("no music file provided");
      return;
    }
    console.log("exporting gif", gif.name);

    const gifBlob = await gif.arrayBuffer();
    const audioBlob = await musicFile.arrayBuffer();
    const form = new FormData();
    form.append("gif", new Blob([gifBlob], { type: "image/gif" }));
    form.append("audio", new Blob([audioBlob], { type: musicFile.type }));

    const response = await fetch("/api/export", {
      method: "POST",
      body: form,
    });

    const data = await response.blob();
    const url = URL.createObjectURL(data);
    console.log("exported mp4 url", url);
    resultUrl = url;

    // // decode gif and get frames
    // let frames: ParsedFrame[] = [];
    // const reader = new FileReader();
    // reader.onload = (e) => {
    //   const buffer = e.target?.result as ArrayBuffer;
    //   const data = parseGIF(buffer);
    //   frames = decompressFrames(data, true);

    //   canvas.width = frames[0].dims.width;
    //   canvas.height = frames[0].dims.height;
    // };

    // reader.readAsArrayBuffer(gif);
    // console.log("frames gotten", frames);

    // // render and write each frame to memory
    // const canvas = document.createElement("canvas");
    // const ctx = canvas.getContext("2d");

    // frames.forEach((frame, i) => {
    //   const imageData = new ImageData(frame.patch, frame.dims.width, frame.dims.height);
    //   ctx?.putImageData(imageData, frame.dims.left, frame.dims.top);

    //   canvas.toBlob(async blob => {
    //     if (!blob) {
    //       console.error("failed to create blob from canvas");
    //       return;
    //     }

    //     const arrayBuffer = await blob.arrayBuffer();
    //     ffmpeg.writeFile(`frame${i}.png`, new Uint8Array(arrayBuffer));
    //   }, "image/png");
    // });

    // // tell ffmpeg how to combine the frames
    // const duration = (60 / bpm * 1000 * 2) / frames.length;
    // let fileListText = "";
    // frames.forEach((_, i) => {
    //   fileListText += `file frame${i}.png\n`;
    //   fileListText += `duration ${duration}\n`;
    // });
    // fileListText += `file frame${frames.length - 1}.png\n`;
    // ffmpeg.writeFile("filelist.txt", fileListText);

    // await ffmpeg.exec([
    //   "-f", "concat",
    //   "-safe", "0",
    //   "-i", "filelist.txt",
    //   "-vsync", "vfr",
    //   "-pix_fmt", "yuv420p",
    //   "output.mp4"
    // ]);

    // // read the output file
    // const data = await ffmpeg.readFile("output.mp4");
    // const blob = new Blob([data], { type: "video/mp4" });
    // resultUrl = URL.createObjectURL(blob);
    // console.log(resultUrl);
  }

  async function startExport() {
    if (mode === "gif") {
      exportGif(ffmpeg);
    } else {
      exportSlideshow(ffmpeg);
    }
  }

  onMount(async () => {
    if (!canExport) {
      console.warn("cannot export");
      return;
    }

    // const baseUrl = "https://unpkg.com/@ffmpeg/core-mt@0.12.10/dist/esm";
    // await ffmpeg.load({
    //   coreURL: await toBlobURL(`${baseUrl}/ffmpeg-core.js`, "text/javascript"),
    //   wasmURL: await toBlobURL(`${baseUrl}/ffmpeg-core.wasm`, "application/wasm"),
    //   workerURL: await toBlobURL(`${baseUrl}/ffmpeg-core.worker.js`, "text/javascript"),
    // });
    // console.log("ffmpeg loaded");

    startExport();
  });
</script>

{#if canExport}
  {#if resultUrl}
    <div class="w-full aspect-square bg-surface rounded-sm flex justify-center items-center">
      <video
        class="w-full h-full object-cover rounded-sm"
        src={resultUrl}
        controls
        autoplay
        loop
      >
        <track kind="captions">
      </video>
    </div>
  {:else}
    <div class="w-full aspect-square rounded-sm flex justify-center items-center">
      <div class="flex flex-col gap-2 w-full">
        <div class="flex justify-between w-full font-bold">
          <p>processing...</p>
          <p>64%</p>
        </div>

        <Progress.Root
          value={64}
          max={100}
          class="h-6 w-full relative rounded-full bg-surface overflow-hidden"
        >
          <div
            class="bg-fg size-full rounded-full duration-100"
            style={`transform: translateX(-${100 - (100 * 64) / 100}%)`}
          ></div>
        </Progress.Root>
      </div>
    </div>
  {/if}
{:else}
  <div class="w-full aspect-square bg-surface rounded-sm flex justify-center items-center">
    <p>no export available</p>
  </div>
{/if}
