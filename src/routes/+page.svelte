<script lang="ts">
  import FilePicker from "$components/FilePicker.svelte";
  import GifPlayer from "$components/GifPlayer.svelte";
  import HelpTooltip from "$components/HelpTooltip.svelte";
  import Logo from "$components/Logo.svelte";
  import NumberPicker from "$components/NumberPicker.svelte";
  import Radio from "$components/Radio.svelte";
  import { extractBPM, extractCoverImage } from "$lib";
  import { muted } from "$lib/stores";
  import { Slider } from "bits-ui";
  import { decompressFrames, parseGIF, type ParsedFrame } from "gifuct-js";
  import { QUALITY_MEDIUM, QUALITY_VERY_HIGH, QUALITY_VERY_LOW } from "mediabunny";
  import { onDestroy, onMount } from "svelte";

  const SPEEDS = [
    { value: 0, label: "auto" },
    { value: 0.25, label: "0.25x" },
    { value: 0.5, label: "0.5x" },
    { value: 1, label: "1x" },
    { value: 2, label: "2x" }
  ];

  const QUALITY = [
    { value: QUALITY_VERY_LOW, label: "low" },
    { value: QUALITY_MEDIUM, label: "medium" },
    { value: QUALITY_VERY_HIGH, label: "high" }
  ];

  const CODECS = [
    { value: "av1", label: "AV1" },
    { value: "avc", label: "AVC" }
  ];

  const idealBeatDuration = 500;

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
  let gifDuration: number = $state(0);
  let gifPlayer: GifPlayer | null = $state(null);
  let gifPlayerCanvas: HTMLCanvasElement;

  let autoSpeedMultiplier = $state(0);
  let speedMultiplier = $state(0);
  let frameOffset = $state(0);
  let qualityValue = $state(QUALITY_MEDIUM);
  let codecValue = $state<"av1" | "avc" | "hevc" | "vp9" | "vp8">("av1");

  muted.subscribe(value => {
    if (audioElement) audioElement.muted = value;
  });

  function getGifDuration(frames: ParsedFrame[]) {
    return frames.reduce((acc, frame) => acc + frame.delay, 0);
  }

  function readGif(gif: File): Promise<ParsedFrame[]> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const buffer = e.target?.result as ArrayBuffer;
        const data = parseGIF(buffer);
        const frames = decompressFrames(data, true);

        gifDuration = getGifDuration(frames);
        const num = idealBeatDuration / gifDuration;
        autoSpeedMultiplier = Math.pow(2, Math.round(Math.log2(num)));
        console.log(autoSpeedMultiplier);

        resolve(frames);
      };

      reader.onerror = (e) => reject(e);
      reader.readAsArrayBuffer(gif);
    });
  }

  async function onMusicUpload(file: File): Promise<void> {
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

  async function onGifUpload(file: File): Promise<void> {
    gifFile = file;
    gifSrc = URL.createObjectURL(file);
    gifFrames = await readGif(file);
  }

  onMount(() => {
    audioElement = document.createElement("audio");
    audioElement.volume = 0.4;
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

<div class="size-full flex">
  <!-- sidebar -->
  <aside class="w-lg border-r-2 border-border bg-surface flex flex-col">
    <h2 class="text-text-bright font-bold text-base flex gap-2 items-center px-6 pt-6">
      <!-- <span class="text-xl -translate-y-[2px]">⚙︎</span> -->
      <span class="z-10">Settings</span>
    </h2>

    <div class="flex flex-col gap-10 overflow-y-auto p-6 grow w-full">
      <div>
        <p class="mb-4 flex gap-3">
          <span class="font-bold uppercase">Audio Track</span>
        </p>
        <FilePicker
          previewSrc={musicCoverSrc}
          placeholderIcon="material-symbols:music-note"
          onUpload={onMusicUpload}
          validFileTypes={["audio/mpeg", "audio/wav", "audio/ogg"]}
        >
          <div class="flex flex-col gap-2 w-full">
            <span>
              {#if isLoadingBPM}
                <span class="inline-flex items-center gap-4">
                  <iconify-icon icon="tdesign:loading" class="animate-spin text-base"></iconify-icon>
                  loading bpm...
                </span>
              {:else}
                bpm = {bpm ? bpm : "?"}
              {/if}
            </span>
            <span class="px-2 font-bold text-text-dim">{musicFile ? musicFile.name : "[drop or pick an audio track]"}</span>
          </div>
        </FilePicker>
      </div>

      <div>
        <p class="mb-4 flex gap-3">
          <span class="font-bold uppercase">GIF</span>
        </p>
        <FilePicker
          previewSrc={gifSrc}
          placeholderIcon="material-symbols:image-outline-sharp"
          onUpload={onGifUpload}
          validFileTypes={["image/gif", "image/png", "image/jpeg"]}
        >
          <div class="flex flex-col gap-2 w-full">
            <span>frames = {gifFrames.length > 0 ? gifFrames.length : "?"}</span>
            <span class="px-2 font-bold text-text-dim">{gifFile ? gifFile.name : "[drop or pick a gif]"}</span>
          </div>
        </FilePicker>
      </div>

      <div>
        <p class="mb-4 flex gap-3">
          <span class="font-bold uppercase">Audio BPM</span>
          <HelpTooltip>Manually change this if the BPM is off.</HelpTooltip>
        </p>
        <NumberPicker bind:value={bpm} />
      </div>

      <div>
        <p class="mb-4 flex gap-3">
          <span class="font-bold uppercase">Speed Multiplier</span>
          <HelpTooltip>This controls how fast the gif plays.</HelpTooltip>
        </p>
        <Radio items={SPEEDS} name="speed-multiplier" bind:value={speedMultiplier} />
      </div>

      <div>
        <p class="mb-4 flex gap3 justify-between">
          <span class="flex gap-3">
            <span class="font-bold uppercase">Frame Offset</span>
            <HelpTooltip>This controls how many frames the gif is offset by, change this to position the beat drop.</HelpTooltip>
          </span>
          <span class="text-accent">+{frameOffset}</span>
        </p>

        <Slider.Root
          type="single"
          bind:value={frameOffset}
          min={0}
          step={1}
          max={gifFrames.length}
          class="relative flex items-center w-full hover:cursor-grab active:cursor-grabbing group"
        >
          {#snippet children({ tickItems })}
            <span class="h-2 w-full bg-accent rounded-sm duration-100">
              <Slider.Range class="bg-accent h-full absolute rounded-sm duration-100" />
            </span>

            <Slider.Thumb
              index={0}
              class="size-6 bg-accent outline-none rounded-full duration-100 z-10"
            />
          {/snippet}
        </Slider.Root>

        <div class="w-full flex justify-between text-text mt-4 text-sm">
          <span class="w-1/2 flex flex-col gap-1 items-start">
            <span>+0</span>
          </span>

          <span class="w-1/2 flex flex-col gap-1 items-end">
            <span>+{gifFrames.length}</span>
          </span>
        </div>
      </div>

      <div>
        <p class="mb-4 flex gap-3">
          <span class="font-bold uppercase">Export Quality</span>
          <HelpTooltip>This controls how high quality the output video is, lower quality exports faster.</HelpTooltip>
        </p>
        <Radio items={QUALITY} name="quality" bind:value={qualityValue} />
      </div>

      <div>
        <p class="mb-4 flex gap-3">
          <span class="font-bold uppercase">Video Codec</span>
          <HelpTooltip>This controls what video codec the exported video will use.</HelpTooltip>
        </p>

        <Radio items={CODECS} name="codec" bind:value={codecValue} />
      </div>
    </div>

    <div class="flex w-full border-t-2 border-surface p-4 justify-between">
      <Logo />
    </div>
  </aside>

  <div class="grow flex flex-col">
    <!-- <div class="flex justify-between border-b-2 border-surface p-6 items-center gap-8">
      <FilePicker
        previewSrc={musicCoverSrc}
        placeholderIcon="mingcute:music-fill"
        onUpload={onMusicUpload}
        validFileTypes={["audio/mpeg", "audio/wav", "audio/ogg"]}
      >
        <div class="flex flex-col gap-2 w-full">
          <span>
            {#if isLoadingBPM}
              <span class="inline-flex items-center gap-4">
                <iconify-icon icon="tdesign:loading" class="animate-spin text-base"></iconify-icon>
                LOADING BPM...
              </span>
            {:else}
              bpm = {bpm ? bpm : "?"}
            {/if}
          </span>
          <span class="px-2 font-bold text-text-dim">{musicFile ? musicFile.name : "[drop or pick an audio track]"}</span>
        </div>
      </FilePicker>

      <span class="font-normal text-4xl text-text">+</span>

      <FilePicker
        previewSrc={gifSrc}
        placeholderIcon="mingcute:pic-2-fill"
        onUpload={onGifUpload}
        validFileTypes={["image/gif", "image/png", "image/jpeg"]}
      >
        <div class="flex flex-col gap-2 w-full">
          <span>frames = {gifFrames.length > 0 ? gifFrames.length : "?"}</span>
          <span class="px-2 font-bold text-text-dim">{gifFile ? gifFile.name : "[drop or pick a gif]"}</span>
        </div>
      </FilePicker>
    </div> -->

    <div class="bg-bg size-full grow flex justify-center items-center p-4">
      <div class="font-bold size-full rounded-sm flex justify-center items-center p-4">
        {#if gifFile && bpm}
          <GifPlayer
            bind:this={gifPlayer}
            frameDuration={1 / (bpm / 60) / gifFrames.length / (speedMultiplier == 0 ? autoSpeedMultiplier : speedMultiplier) * 1000}
            offset={frameOffset}
            frames={gifFrames}
            bind:canvas={gifPlayerCanvas}
          />
        {:else}
          <div class="text-center">
            <h2>PREVIEW HERE</h2>
            <p class="text-text-dim">select a gif and audio track</p>
          </div>
        {/if}
      </div>
    </div>
  </div>
</div>
