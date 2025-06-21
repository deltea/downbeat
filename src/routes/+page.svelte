<script lang="ts">
  import type { Config } from "$lib/types.ts";
  import MusicUploader from "$components/MusicUploader.svelte";
  import ImageUploadStep from "$components/ImageUploadStep.svelte";
  import Progress from "$components/Progress.svelte";
  import { beat, muted } from "$lib/stores";
  import FusionStep from "$components/FusionStep.svelte";

  let audio: HTMLAudioElement;
  let currentStep = $state(0);
  let stepFinished = $state(false);
  let beatInterval: ReturnType<typeof setInterval> | null = $state(null);
  let config = $state({
    bpm: null,
    audioSrc: null,
    images: []
  } as Config);

  function handleGetBPM(bpm: number) {
    console.log("bpm found: ", bpm);
    config.bpm = bpm;

    beatInterval = setInterval(onBeat, 60 / bpm * 1000);

    stepFinished = true;
  }

  function handleUpload(file: File) {
    console.log("music uploaded:", file.name);
    if (beatInterval) clearInterval(beatInterval);
    config.audioSrc = URL.createObjectURL(file);
    audio.pause();
  }

  function handleImagesUpload(files: File[]) {
    console.log("images uploaded:", config.images);
    config.images = files.map(file => URL.createObjectURL(file));

    stepFinished = true;
  }

  function nextStep() {
    currentStep++;
    stepFinished = false;
  }

  function onBeat() {
    $beat += 1;
  }
</script>

<Progress {currentStep} />

<div class="w-full grow flex flex-col gap-6 justify-center items-center pt-progress">
  {#if currentStep === 0}
    <MusicUploader getBPM={handleGetBPM} upload={handleUpload} />
  {:else if currentStep === 1}
    <ImageUploadStep upload={handleImagesUpload} />
  {:else if currentStep === 2}
    <FusionStep {config} />
  {/if}

  <div class="flex gap-6">
    <!-- {#if currentStep > 0}
      <button
        onclick={() => (currentStep--)}
        class="rounded-sm px-4 py-2 bg-dark text-fg font-bold hover:cursor-pointer disabled:bg-dark disabled:cursor-auto"
      >
        {"< back"}
      </button>
    {/if} -->

    <button
      onclick={nextStep}
      class="rounded-sm px-4 py-2 bg-fg text-bg font-bold hover:cursor-pointer disabled:bg-faded disabled:cursor-auto"
      disabled={!stepFinished}
    >
      {"next >"}
    </button>
  </div>
</div>

<audio bind:this={audio} autoplay loop muted={$muted} src={config.audioSrc}></audio>
