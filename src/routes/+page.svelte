<script lang="ts">
  import type { Mode } from "$lib/types";
  import { muted } from "$lib/stores";

  import MusicUploadStep from "$components/MusicUploadStep.svelte";
  import ImageUploadStep from "$components/ImageUploadStep.svelte";
  import FusionStep from "$components/FusionStep.svelte";
  import ExportStep from "$components/ExportStep.svelte";

  import Progress from "$components/Progress.svelte";
  import Nav from "$components/Nav.svelte";

  let currentStep = $state(0);

  let audio: HTMLAudioElement;

  let musicFile: File | null = $state(null);
  let bpm = $state(0);
  let mode: Mode = $state("gif");
  let images = $state<File[]>([]);
  let gif: File | null = $state(null);
  let isExportDone = $state(false);
</script>

<Progress bind:currentStep />

<div class="grow flex flex-col gap-6 justify-center items-center pt-progress pb-nav">
  {#if currentStep === 0}
    <MusicUploadStep bind:musicFile bind:bpm />
  {:else if currentStep === 1}
    <ImageUploadStep bind:mode bind:images bind:gif />
  {:else if currentStep === 2}
    <FusionStep {images} {gif} {bpm} {mode} />
  {:else if currentStep === 3}
    <ExportStep {images} {gif} {bpm} {mode} {musicFile} bind:isExportDone />
  {/if}

  <div class="flex gap-6">
    {#if currentStep > 0}
      <button
        onclick={() => (currentStep--)}
        disabled={(currentStep === 3 && !isExportDone)}
        class="rounded-sm pr-4 pl-2 py-2 bg-surface-0 text-fg font-bold hover:cursor-pointer disabled:bg-surface disabled:text-muted disabled:cursor-auto flex items-center gap-1"
      >
        <iconify-icon icon="line-md:chevron-small-left" class="text-2xl"></iconify-icon>
        back
      </button>
    {/if}

    {#if currentStep < 3}
      <button
        onclick={() => (currentStep++)}
        class="rounded-sm pl-4 pr-2 py-2 bg-fg text-bg font-bold hover:cursor-pointer disabled:bg-muted disabled:cursor-auto flex items-center gap-1"
        disabled={!(
          (currentStep === 0 && bpm) ||
          (currentStep === 1 && (mode === "gif" ? gif : images.length > 0)) ||
          (currentStep === 2)
        )}
      >
        next
        <iconify-icon icon="line-md:chevron-small-right" class="text-2xl"></iconify-icon>
      </button>
    {/if}
  </div>
</div>

<Nav {bpm} />

<audio
  bind:this={audio}
  autoplay
  loop
  muted={$muted}
  src={musicFile ? URL.createObjectURL(musicFile) : ""}
></audio>
