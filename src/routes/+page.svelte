<script lang="ts">
  import { parseGIF, decompressFrames, type ParsedFrame } from "gifuct-js";
  import type { Mode } from "$lib/types";
  import { muted } from "$lib/stores";

  import MusicUploadStep from "$components/MusicUploadStep.svelte";
  import ImageUploadStep from "$components/ImageUploadStep.svelte";
  import FusionStep from "$components/FusionStep.svelte";
  import Progress from "$components/Progress.svelte";
  import Nav from "$components/Nav.svelte";

  let currentStep = $state(0);

  let audio: HTMLAudioElement;

  let musicFile: File | null = $state(null);
  let bpm = $state(0);
  let mode: Mode = $state("gif");
  let images = $state<File[]>([]);
  let gif = $state<ParsedFrame[]>([]);
  let gifFile: File | null = $state(null);

  function nextStep() {
    currentStep++;
  }
</script>

<Progress bind:currentStep />

<div class="grow flex flex-col gap-6 justify-center items-center pt-progress pb-nav">
  {#if currentStep === 0}
    <MusicUploadStep bind:musicFile bind:bpm />
  {:else if currentStep === 1}
    <ImageUploadStep bind:mode bind:images bind:gif bind:gifFile />
  {:else if currentStep === 2}
    <FusionStep frames={mode === "gif" ? gif : images} {bpm} {mode} />
  {/if}

  <div class="flex gap-6">
    {#if currentStep > 0}
      <button
        onclick={() => (currentStep--)}
        class="rounded-sm pr-4 pl-2 py-2 bg-dark text-fg font-bold hover:cursor-pointer disabled:bg-dark disabled:cursor-auto flex items-center gap-1"
      >
        <iconify-icon icon="line-md:chevron-small-left" class="text-2xl"></iconify-icon>
        back
      </button>
    {/if}

    <button
      onclick={nextStep}
      class="rounded-sm pl-4 pr-2 py-2 bg-fg text-bg font-bold hover:cursor-pointer disabled:bg-faded disabled:cursor-auto flex items-center gap-1"
      disabled={!(
        (currentStep === 0 && bpm) ||
        (currentStep === 1 && (mode === "gif" ? gif.length > 0 : images.length > 0)) ||
        (currentStep === 2)
      )}
    >
      next
      <iconify-icon icon="line-md:chevron-small-right" class="text-2xl"></iconify-icon>
    </button>
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
