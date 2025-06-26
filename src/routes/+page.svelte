<script lang="ts">
  import { parseGIF, decompressFrames } from "gifuct-js";
  import type { Config, Mode } from "$lib/types";
  import { muted } from "$lib/stores";

  import MusicUploadStep from "$components/MusicUploadStep.svelte";
  import ImageUploadStep from "$components/ImageUploadStep.svelte";
  import FusionStep from "$components/FusionStep.svelte";
  import Progress from "$components/Progress.svelte";
  import Nav from "$components/Nav.svelte";

  let currentStep = $state(0);

  let audio: HTMLAudioElement;
  let config = $state({
    images: [],
    mode: "gif",
  } as Config);

  let musicFile: File | null = $state(null);
  let bpm = $state(0);

  // function handleGetBPM(bpm: number) {
  //   console.log("bpm found: ", bpm);
  //   config.bpm = bpm;
  //   beatInterval = setInterval(onBeat, 60 / bpm * 250);

  //   stepFinished = true;
  // }

  // function handleMusicUpload(file: File) {
  //   console.log("music uploaded:", file.name);
  //   if (beatInterval) clearInterval(beatInterval);
  //   config.audioSrc = URL.createObjectURL(file);
  //   audio.pause();
  //   stepFinished = false;
  // }


  async function handleImagesUpload(files: File[], mode: Mode) {
    console.log("images uploaded:", config.images);
    if (files.length === 0) {
      config.images = [];
      return;
    }

    if (mode === "gif") {
      const gif = files.find(file => file.type === "image/gif");
      if (gif) {
        console.log("gif found, extracting");
        const buffer = await gif.arrayBuffer();
        const data = parseGIF(buffer);
        const frames = decompressFrames(data, true);
        config.images = frames;
      }
    } else {
      config.images = files.map(file => URL.createObjectURL(file));
    }
  }

  function nextStep() {
    currentStep++;

    switch (currentStep) {
      case 1:
        break;
      case 2:
        break;
      case 3:
        break;
    }
  }
</script>

<Progress bind:currentStep />

<div class="w-full grow flex flex-col gap-6 justify-center items-center pt-progress pb-nav">
  {#if currentStep === 0}
    <MusicUploadStep bind:musicFile bind:bpm />
  {:else if currentStep === 1}
    <ImageUploadStep upload={handleImagesUpload} />
  {:else if currentStep === 2}
    <FusionStep {config} />
  {/if}

  <div class="flex gap-6">
    {#if currentStep > 0}
      <button
        onclick={() => (currentStep--)}
        class="rounded-sm px-4 py-2 bg-dark text-fg font-bold hover:cursor-pointer disabled:bg-dark disabled:cursor-auto"
      >
        {"< back"}
      </button>
    {/if}

    <button
      onclick={nextStep}
      class="rounded-sm px-4 py-2 bg-fg text-bg font-bold hover:cursor-pointer disabled:bg-faded disabled:cursor-auto"
      disabled={!(
        (currentStep === 0 && bpm) ||
        (currentStep === 1 && config.images.length > 0) ||
        (currentStep === 2 && !config.images.length)
      )}
    >
      {"next >"}
    </button>
  </div>
</div>

<Nav {bpm} />

<audio
  bind:this={audio}
  autoplay
  loop
  muted={$muted}
  src={URL.createObjectURL(musicFile ?? new Blob())}
></audio>
