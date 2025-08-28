<script lang="ts">
  import { onDestroy, onMount } from "svelte";
  import { Slider } from "bits-ui";
  import { extractBPM, extractCoverImage } from "$lib";
  import { muted } from "$lib/stores";

  import Nav from "$components/Nav.svelte";
  import Radio from "$components/Radio.svelte";
  import FilePicker from "$components/FilePicker.svelte";
  import GifPlayer from "$components/GifPlayer.svelte";

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

  muted.subscribe((value) => {
    if (audioElement) audioElement.muted = value;
  });

  function onGifUpload(file: File) {
    gifFile = file;
    gifSrc = URL.createObjectURL(file);
  }

  async function onMusicUpload(file: File) {
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

  onMount(() => {
    audioElement = document.createElement("audio");
    audioElement.volume = 0.2;
    audioElement.muted = $muted;
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

    <FilePicker
      previewSrc={gifSrc}
      placeholderIcon="mingcute:pic-2-fill"
      onUpload={onGifUpload}
      validFileTypes={["image/gif"]}
    >
      <div class="flex flex-col gap-2 w-full">
        <span class="text-muted">frames = ?</span>
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
        <GifPlayer gif={gifFile} {bpm} offset={0} />
      {:else}
        PREVIEW HERE
      {/if}
    </div>

    <!-- connector line -->
    <svg height="100%" width="64" xmlns="http://www.w3.org/2000/svg">
      <path d="M4 300 L60 300" style="fill: none; stroke: var(--color-surface); stroke-width: 3" />
    </svg>

    <div class="dashed h-full flex flex-col justify-between grow rounded-sm p-8 bg-bg">
      <div class="flex flex-col gap-16">
        <div>
          <!-- label -->
          <p class="mb-4 flex justify-between">
            <span class="font-bold">SPEED MULTIPLIER</span>
            <span class="text-muted">(how fast the gif plays)</span>
          </p>
          <!-- speed multiplier radio -->
          <Radio items={SPEEDS} name="speed-multiplier" value={"2"} />
        </div>
        <div>
          <!-- label -->
          <p class="mb-4 flex justify-between">
            <span class="font-bold">AUDIO OFFSET</span>
            <span class="text-muted">(amount of frames the audio is offset by)</span>
          </p>
          <!-- audio offset slider -->
          <Slider.Root
            type="single"
            value={10}
            min={0}
            step={1}
            max={20}
            class="relative flex items-center w-full hover:cursor-grab active:cursor-grabbing"
          >
            {#snippet children({ tickItems })}
              <span class="h-2 w-full bg-surface-0 rounded-sm duration-100">
                <Slider.Range class="bg-fg h-full absolute rounded-sm duration-100" />
              </span>
              <Slider.Thumb
                index={0}
                class="size-6 bg-fg outline-none rounded-full duration-100 z-10"
              />
            {/snippet}
          </Slider.Root>
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

<Nav bpm={bpm ?? 0} />
