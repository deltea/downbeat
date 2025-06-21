<script lang="ts">
  import { parseBlob } from "music-metadata";
  import { muted } from "$lib/stores";

  const VALID_FILE_TYPES = ["audio/mp3", "audio/wav", "audio/ogg", "audio/mpeg"];

  let { upload } = $props();
  let fileInput: HTMLInputElement;
  let coverPreview: string | null = $state(null);
  let previewSrc: string | null = $state(null);
  let videoName: string | null = $state(null);
  let isLoadingPreview = $state(false);

  function fileInputChange(e: Event) {
    const target = e.target as HTMLInputElement;
    const files = target.files;

    if (files && files.length > 0) {
      const file = files[0];
      if (VALID_FILE_TYPES.includes(file.type)) {
        videoName = file.name;
        setPreview(file);
        upload(file)
      } else {
        console.error("invalid file type");
      }
    } else {
      console.error("no file selected");
    }
  }

  function onDrop(e: DragEvent) {
    e.preventDefault();
    const files = e.dataTransfer?.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (VALID_FILE_TYPES.includes(file.type)) {
        videoName = file.name;
        setPreview(file);
        upload(file);
      } else {
        console.error("invalid file type");
      }
    } else {
      console.error("no file dropped");
    }
  }

  async function setPreview(file: File) {
    isLoadingPreview = true;

    previewSrc = URL.createObjectURL(file);
    const parsed = await parseBlob(file);
    if (parsed.common.picture && parsed.common.picture.length > 0) {
      const picture = parsed.common.picture[0];
      const blob = new Blob([picture.data], { type: picture.format });
      coverPreview = URL.createObjectURL(blob);
    } else {
      console.log("no cover art found for track");
    }

    isLoadingPreview = false;
  }
</script>

<div class="flex flex-col gap-6 items-center w-full">
  <button
    onclick={() => fileInput.click()}
    ondrop={onDrop}
    ondragover={e => e.preventDefault()}
    class="dashed size-[24rem] flex justify-center items-center text-faded rounded-sm cursor-pointer p-6 outline-none hover:scale-[101%] active:scale-100 duration-100"
  >
    {#if isLoadingPreview}
      <p>loading...</p>
    {:else if coverPreview}
      <div class="bg-cover size-full bg-center rounded-sm" style:background-image="url('{coverPreview}')"></div>
    {:else}
      <p class="p-10">drop or select your music file here!</p>
    {/if}
  </button>

  {#if previewSrc}
    <audio autoplay loop muted={$muted} src={previewSrc}></audio>
  {/if}

  {#if videoName}
    <p>{videoName}</p>
  {/if}
</div>

<input
  onchange={fileInputChange}
  bind:this={fileInput}
  accept={VALID_FILE_TYPES.join(",")}
  type="file"
  name="music"
  id="music"
  class="hidden"
  multiple={false}
/>
