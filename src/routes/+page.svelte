<script lang="ts">
  import { onDestroy, onMount } from "svelte";
  import { Slider } from "bits-ui";
  import { extractBPM, extractCoverImage } from "$lib";
  import { muted } from "$lib/stores";
  import { decompressFrames, parseGIF, type ParsedFrame } from "gifuct-js";

  import Nav from "$components/Nav.svelte";
  import Radio from "$components/Radio.svelte";
  import FilePicker from "$components/FilePicker.svelte";
  import GifPlayer from "$components/GifPlayer.svelte";
  import HelpTooltip from "$components/HelpTooltip.svelte";

  const SPEEDS = [
    { value: 0.5, label: "0.5x" },
    { value: 1, label: "1x" },
    { value: 2, label: "2x" },
    { value: 4, label: "4x" },
    { value: 8, label: "8x" },
    { value: 16, label: "16x" }
  ];

  // audio stuff
  let audioElement: HTMLAudioElement;
  let audioCtx: AudioContext;
  let source: MediaElementAudioSourceNode;

  let musicFile: File | null = $state(null);
  let musicCoverSrc: string | null = $state(null);
  let isLoadingBPM = $state(false);
  let bpm: number | null = $state(null);

  let gifFile: File | null = $state(null);
  let gifSrc: string | null = $state(null);
  let gifFrames = $state<ParsedFrame[]>([]);

  let speedMultiplierValue = $state("2");

  let options = $state({
    speedMultiplier: 1,
    audioOffset: 5
  });

  muted.subscribe((value) => {
    if (audioElement) audioElement.muted = value;
  });

  async function onGifUpload(file: File) {
    gifFile = file;
    gifSrc = URL.createObjectURL(file);

    gifFrames = await readGif(file);
    console.log("gif loaded");
  }

  async function onMusicUpload(file: File) {
    bpm = null;
    musicFile = file;

    await audioCtx.resume();
    audioElement.src = URL.createObjectURL(file);
    audioElement.play();

    musicCoverSrc = await extractCoverImage(file);

    isLoadingBPM = true;
    bpm = await extractBPM(audioCtx, file);
    console.log("bpm found: ", bpm);
    isLoadingBPM = false;
  }

  function readGif(gif: File): Promise<ParsedFrame[]> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const buffer = e.target?.result as ArrayBuffer;
        const data = parseGIF(buffer);
        const frames = decompressFrames(data, true);

        resolve(frames);
      };

      reader.onerror = (e) => reject(e);
      reader.readAsArrayBuffer(gif);
    });
  }

  onMount(() => {
    audioElement = document.createElement("audio");
    audioElement.volume = 0.2;
    audioElement.muted = $muted;
    audioElement.loop = true;
    audioCtx = new AudioContext();
    source = audioCtx.createMediaElementSource(audioElement);
    source.connect(audioCtx.destination);
  });

  onDestroy(() => {
    if (audioCtx) audioCtx.close();
  });
</script>

<div class="grow flex flex-col items-center py-16 gap16 relative">
  <!-- top row -->
  <div class="flex justify-center gap-16 w-full">
    <!-- song picker -->
    <FilePicker
      previewSrc={musicCoverSrc}
      placeholderIcon="mingcute:music-fill"
      onUpload={onMusicUpload}
      validFileTypes={["audio/mpeg", "audio/wav", "audio/ogg"]}
    >
      <div class="flex flex-col gap-2 w-full">
        <span class="text-muted">
          {#if isLoadingBPM}
            <span class="inline-flex items-center gap-4">
              <iconify-icon icon="tdesign:loading" class="animate-spin text-base"></iconify-icon>
              LOADING BPM...
            </span>
          {:else}
            bpm = {bpm ? bpm : "?"}
          {/if}
        </span>
        <span class="px-2 font-bold">{musicFile ? musicFile.name : "[drop or pick an audio track]"}</span>
      </div>
    </FilePicker>

    <!-- gif picker -->
    <FilePicker
      previewSrc={gifSrc}
      placeholderIcon="mingcute:pic-2-fill"
      onUpload={onGifUpload}
      validFileTypes={["image/gif"]}
    >
      <div class="flex flex-col gap-2 w-full">
        <span class="text-muted">frames = {gifFrames.length > 0 ? gifFrames.length : "?"}</span>
        <span class="px-2 font-bold">{gifFile ? gifFile.name : "[drop or pick a gif]"}</span>
      </div>
    </FilePicker>
  </div>

  <!-- connector lines -->
  <svg height="64" width="100%" xmlns="http://www.w3.org/2000/svg">
    <path d="M400 4 L400 22 Q400 26 396 26 L254 26 Q250 26 250 31 L250 60" style="fill: none; stroke: var(--color-surface); stroke-width: 3" />
    <path d="M1010 4 L1010 42 Q1010 46 1006 46 L274 46 Q270 46 270 50 L270 60" style="fill: none; stroke: var(--color-surface); stroke-width: 3" />
  </svg>

  <!-- bottom row -->
  <div class="flex justify-center gap16 w-full grow">
    <div class="bg-surface font-bold flex justify-center items-center h-full aspect-square rounded-sm p-4">
      {#if gifFile && bpm}
        <GifPlayer
          frameDuration={1 / (bpm / 60) / gifFrames.length / 0.5 * 1000}
          offset={0}
          frames={gifFrames}
        />
      {:else}
        PREVIEW HERE
      {/if}
    </div>

    <!-- connector line -->
    <svg height="100%" width="64" xmlns="http://www.w3.org/2000/svg">
      <path d="M4 300 L60 300" style="fill: none; stroke: var(--color-surface); stroke-width: 3" />
    </svg>

    <div class="dashed h-full flex flex-col justify-between grow rounded-sm p-8 bg-bg max-w-[50rem] min-w-[30rem]">
      <div class="flex flex-col gap-16">
        <div>
          <!-- label -->
          <p class="mb-4 flex gap-3">
            <span class="font-bold">SPEED MULTIPLIER</span>
            <HelpTooltip>This controls how fast the gif plays.</HelpTooltip>
          </p>

          <!-- speed multiplier radio -->
          <Radio items={SPEEDS} name="speed-multiplier" bind:value={speedMultiplierValue} />
        </div>

        <div>
          <!-- label -->
          <p class="mb-4 flex gap-3">
            <span class="font-bold">AUDIO OFFSET</span>
            <HelpTooltip>This controls how many frames the gif is offset by, change this to position the downbeat.</HelpTooltip>
          </p>

          <!-- audio offset slider -->
          {#if gifFrames.length > 0}
            <Slider.Root
              type="single"
              bind:value={options.audioOffset}
              min={0}
              step={1}
              max={gifFrames.length - 1}
              class="relative flex items-center w-full hover:cursor-grab active:cursor-grabbing group"
            >
              {#snippet children({ tickItems })}
                <span class="h-2 w-full bg-surface-0 rounded-sm duration-100">
                  <Slider.Range class="bg-fg data-[disabled]:bg-muted h-full absolute rounded-sm duration-100" />
                </span>

                <Slider.Thumb
                  index={0}
                  class="size-6 bg-fg data-[disabled]:bg-muted outline-none rounded-full duration-100 z-10"
                />
              {/snippet}
            </Slider.Root>
          {:else}
            <!-- placeholder slider -->
            <Slider.Root
              type="single"
              value={0.5}
              min={0}
              step={0.5}
              max={1}
              class="relative flex items-center w-full hover:cursor-grab active:cursor-grabbing group"
            >
              <span class="h-2 w-full bg-surface-0 rounded-sm duration-100">
                <Slider.Range class="bg-muted h-full absolute rounded-sm duration-100" />
              </span>

              <Slider.Thumb
                index={0}
                class="size-6 bg-muted outline-none rounded-full duration-100 z-10"
              />
            </Slider.Root>
          {/if}
        </div>
      </div>

      <div class="flex gap-4">
        <button class="inline-flex justify-center items-center gap-2 font-bold rounded-sm bg-surface-0 w-1/2 py-2.5 text-fg cursor-pointer hover:scale-[102%] active:scale-100 duration-100">
          <iconify-icon icon="mingcute:refresh-3-fill" class="text-xl"></iconify-icon>
          restart preview
        </button>
        <button class="inline-flex justify-center items-center gap-2 font-bold rounded-sm bg-fg w-1/2 py-2.5 text-bg cursor-pointer hover:scale-[102%] active:scale-100 duration-100">
          <iconify-icon icon="mingcute:share-forward-fill" class="text-xl"></iconify-icon>
          export as mp4
        </button>
      </div>
    </div>
  </div>
</div>

<Nav {bpm} />
