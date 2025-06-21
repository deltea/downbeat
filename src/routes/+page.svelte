<script lang="ts">
  import BeatDetector from "$components/BeatDetector.svelte";
  import FilePicker from "$components/FilePicker.svelte";
    import ImageUploadStep from "$components/ImageUploadStep.svelte";
  import Progress from "$components/Progress.svelte";
  import { beat } from "$lib/stores";

  let audioSrc: string | null = $state(null);
  let currentStep = $state(1);
  let stepFinished = $state(false);
  let data = $state({
    bpm: null,
    audioSrc: null,
    images: []
  } as {
    bpm: number | null,
    audioSrc: string | null,
    images: string[]
  });

  function handleMusicUpload(file: File) {
    console.log("music uploaded:", file.name);
    audioSrc = URL.createObjectURL(file);
    data.audioSrc = audioSrc;
    stepFinished = true;
  }

  function handleImagesUpload(files: File[]) {
    console.log("images uploaded:", data.images);
    data.images = files.map(file => URL.createObjectURL(file));
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
    <FilePicker upload={handleMusicUpload} />
  {:else if currentStep === 1}
    <ImageUploadStep upload={handleImagesUpload} />
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
      disabled={!stepFinished}
    >
      {"next >"}
    </button>
  </div>
</div>

{#if audioSrc}
  <BeatDetector beat={onBeat} src={audioSrc} />
{/if}
