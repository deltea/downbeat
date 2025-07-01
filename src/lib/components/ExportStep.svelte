<script lang="ts">
  import type { Mode } from "$lib/types";
  import { Progress } from "bits-ui";
  import { onMount } from "svelte";
  import { FFmpeg } from "@ffmpeg/ffmpeg";

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
    form.append("bpm", bpm.toString());

    // get music duration
    const audio = new Audio(URL.createObjectURL(musicFile));
    await new Promise(res => (audio.onloadedmetadata = () => res(null)));
    form.append("duration", audio.duration.toString());

    const response = await fetch("/api/export", {
      method: "POST",
      body: form,
    });

    const data = await response.blob();
    const url = URL.createObjectURL(data);
    console.log("exported mp4 url", url);
    resultUrl = url;
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

    startExport();
  });
</script>

<div class="w-full aspect-square bg-surface rounded-sm flex flex-col justify-center items-center relative overflow-hidden">
  <p class="text-center">export is under<br> construction!</p>
  <p class="text-muted">come back later!</p>

  <div id="warning-tape" class="-left-2/5 w-full -rotate-[96deg] absolute bg-muted text-bg shadow-[-2rem_0_0_#888,2rem_0_0_#888] outline-black flex justify-center text-nowrap">
    COMING SOON! COMING SOON! COMING SOON! COMING SOON! COMING SOON! COMING SOON! COMING SOON! COMING SOON! COMING SOON! COMING SOON!
  </div>

  <div id="warning-tape" class="-right-2/5 w-full -rotate-[90deg] absolute bg-muted text-bg shadow-[-2rem_0_0_#888,2rem_0_0_#888] outline-black flex justify-center text-nowrap">
    COMING SOON! COMING SOON! COMING SOON! COMING SOON! COMING SOON! COMING SOON! COMING SOON! COMING SOON! COMING SOON! COMING SOON!
  </div>

  <div id="warning-tape" class="top-10 w-full rotate-[6deg] absolute bg-fg text-bg shadow-[-2rem_0_0_#fff,2rem_0_0_#fff] outline-black flex justify-center text-nowrap">
    WARNING! WARNING! WARNING! WARNING! WARNING! WARNING! WARNING! WARNING! WARNING! WARNING!
  </div>

  <div id="warning-tape" class="bottom-14 w-full -rotate-[8deg] absolute bg-fg text-bg shadow-[-2rem_0_0_#fff,2rem_0_0_#fff] outline-black flex justify-center text-nowrap">
    WARNING! WARNING! WARNING! WARNING! WARNING! WARNING! WARNING! WARNING! WARNING! WARNING!
  </div>
</div>

<!-- {#if canExport}
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
{/if} -->
