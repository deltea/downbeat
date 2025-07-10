<script lang="ts">
  import { muted } from "$lib/stores";
  import type { Mode } from "$lib/types";
  import { Progress } from "bits-ui";
  import { onMount } from "svelte";

  let { images, gif, bpm, speed, mode, musicFile, isExportDone = $bindable() }: {
    images: File[],
    gif: File | null,
    bpm: number,
    speed: string,
    mode: Mode,
    musicFile: File | null,
    isExportDone: boolean
  } = $props();

  let canExport = $derived((mode === "gif" ? gif : images.length > 0) && bpm !== Infinity);
  let resultUrl: string | null = $state(null);

  function exportSlideshow() {
    // export slideshow coming later!
  }

  async function exportGif() {
    if (!gif) {
      console.warn("no gif file provided");
      return;
    }
    if (!musicFile) {
      console.warn("no music file provided");
      return;
    }

    console.log("exporting gif", gif.name);
    isExportDone = false;

    const gifBlob = await gif.arrayBuffer();
    const audioBlob = await musicFile.arrayBuffer();

    const form = new FormData();
    form.append("gif", new Blob([gifBlob], { type: "image/gif" }));
    form.append("audio", new Blob([audioBlob], { type: musicFile.type }));
    form.append("timePerBeat", (60 / bpm * +speed).toString());

    // get music duration
    const audio = new Audio(URL.createObjectURL(musicFile));
    await new Promise(res => (audio.onloadedmetadata = () => res(null)));
    form.append("audioDuration", audio.duration.toString());

    const endpoint = process.env.NODE_ENV === "development" ? "http://localhost:8000/" : "https://downbeat-server.onrender.com/";
    console.log("exporting using endpoint", endpoint);

    const response = await fetch(endpoint, {
      method: "POST",
      body: form
    });

    const data = await response.blob();
    const url = URL.createObjectURL(data);
    console.log("exported mp4 url", url);
    resultUrl = url;
    $muted = true;
    isExportDone = true;
  }

  async function startExport() {
    if (mode === "gif") {
      exportGif();
    } else {
      exportSlideshow();
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

{#if mode === "slideshow"}
  <div class="w-full aspect-square bg-surface rounded-sm flex flex-col justify-center items-center relative overflow-hidden">
    <p class="text-center">slideshow export is under<br> construction!</p>
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
{:else}
  {#if canExport}
    {#if resultUrl}
      <div class="flex flex-col items-center gap-6">
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

        <a
          href={resultUrl}
          download="downbeat-export.mp4"
          class="rounded-sm px-4 py-2 w-min bg-fg text-bg font-bold hover:cursor-pointer disabled:bg-muted disabled:cursor-auto flex items-center gap-2"
        >
          download
          <iconify-icon icon="mingcute:download-2-fill" class="text-lg"></iconify-icon>
        </a>
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
{/if}
