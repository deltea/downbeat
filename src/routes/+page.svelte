<script lang="ts">
  import BeatDetector from "$components/BeatDetector.svelte";
  import FilePicker from "$components/FilePicker.svelte";
  import Progress from "$components/Progress.svelte";
  import { beat } from "$lib/stores";

  let audioSrc: string | null = null;

  function handleUpload(file: File) {
    console.log("file uploaded:", file.name);
    audioSrc = URL.createObjectURL(file);
  }

  function onBeat() {
    $beat += 1;
  }
</script>

<div class="w-full grow flex flex-col justify-center items-center">
  <Progress currentStep={0} />
  <FilePicker upload={handleUpload} />

  {#if audioSrc}
    <BeatDetector beat={onBeat} src={audioSrc} />
  {/if}
</div>
