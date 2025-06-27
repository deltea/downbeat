<script lang="ts">
  import { parseBlob } from "music-metadata";
  import MusicTempo from "music-tempo";
  import { browser } from "$app/environment";
  import { onMount } from "svelte";

  const VALID_FILE_TYPES = ["audio/mp3", "audio/wav", "audio/ogg", "audio/mpeg"];

  let { musicFile = $bindable(), bpm = $bindable() }: { musicFile: File | null, bpm: number } = $props();
  let fileInput: HTMLInputElement;
  let coverSrc: string | null = $state(null);
  let isLoadingPreview = $state(false);
  let isLoadingBPM = $state(false);

  // bpm getting stuff
  let audio: HTMLAudioElement;
  let audioCtx: AudioContext;
  let source: MediaElementAudioSourceNode;

  function fileInputChange(e: Event) {
    const target = e.target as HTMLInputElement;
    const files = target.files;

    if (files && files.length > 0) {
      upload(files[0]);
    } else {
      console.error("no file selected");
    }
  }

  function onDrop(e: DragEvent) {
    e.preventDefault();
    const files = e.dataTransfer?.files;
    if (files && files.length > 0) {
      if (VALID_FILE_TYPES.includes(files[0].type)) {
        upload(files[0]);
      } else {
        console.error("invalid file type");
      }
    } else {
      console.error("no file dropped");
    }
  }

  async function upload(file: File) {
    musicFile = file;
    setPreview(file);

    await audioCtx.resume();
    audio.src = URL.createObjectURL(file);

    bpm = 0;
    bpm = await extractBPM(file);
  }

  async function extractBPM(track: File | null) {
    if (!browser || !track) return 0;

    isLoadingBPM = true;

    const obj = await import("bpm-detective");
    const detect = obj.default;

    const buffer = await track.arrayBuffer();
    const data = await audioCtx.decodeAudioData(buffer);

    try {
      const channelData = data.getChannelData(0);
      const audioData = Array.from(channelData);

      const mt = new MusicTempo(audioData);
      const tempo = Math.round(mt.tempo);
      console.log(`music-tempo: ${tempo}`);

      bpm = tempo;
    } catch (error) {
      console.warn("music-tempo failed:", error);
      const detective = detect(data);
      console.log(`detective: ${detective}`);
      bpm = detective;
    }

    isLoadingBPM = false;

    return bpm;
  }

  async function setPreview(file: File) {
    isLoadingPreview = true;

    const parsed = await parseBlob(file);
    if (parsed.common.picture && parsed.common.picture.length > 0) {
      const picture = parsed.common.picture[0];
      const blob = new Blob([picture.data], { type: picture.format });
      coverSrc = URL.createObjectURL(blob);
    } else {
      console.log("no cover art found for track");
    }

    isLoadingPreview = false;
  }

  onMount(() => {
    audio = document.createElement("audio");
    audioCtx = new AudioContext();
    source = audioCtx.createMediaElementSource(audio);
    source.connect(audioCtx.destination);

    if (musicFile) {
      setPreview(musicFile);
    }
  });
</script>

<div class="flex flex-col gap-6 items-center w-full">
  <p class="text-faded">
    {#if isLoadingBPM}
      <span class="flex items-center gap-2">
        <iconify-icon icon="tdesign:loading" class="animate-spin text-xl"></iconify-icon>
        loading bpm...
      </span>
    {:else if bpm > 0}
      bpm = {bpm}
    {/if}
  </p>

  <button
    onclick={() => fileInput.click()}
    ondrop={onDrop}
    ondragover={e => e.preventDefault()}
    class="dashed w-full aspect-square flex justify-center items-center text-faded rounded-sm cursor-pointer p-6 outline-none hover:scale-[101%] active:scale-100 duration-100"
  >
    {#if isLoadingPreview}
      <p>loading...</p>
    {:else if coverSrc}
      <div class="bg-cover size-full bg-center rounded-sm" style:background-image="url('{coverSrc}')"></div>
    {:else}
      <p class="p-10">drop or select your music file here!</p>
    {/if}
  </button>

  {#if musicFile}
    <p class="text-center">{musicFile.name}</p>
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
