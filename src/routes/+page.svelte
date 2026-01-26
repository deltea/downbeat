<script lang="ts">
  import FilePicker from "$components/FilePicker.svelte";
  import GifPlayer from "$components/GifPlayer.svelte";
  import Logo from "$components/Logo.svelte";
  import NumberPicker from "$components/NumberPicker.svelte";
  import Radio from "$components/Radio.svelte";
  import Setting from "$components/Setting.svelte";

  import { extractBPM, extractCoverImage } from "$lib";
  import { muted } from "$lib/stores";
  import { clamp } from "$lib/utils";
  import { Button, Slider } from "bits-ui";
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

  let resultElement: HTMLDivElement;
  let zoom = $state(1);
  let canvasOffset = $state({ x: 0, y: 0 });
  let isPanning = $state(false);

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

  function setZoom(value: number) {
    zoom = clamp(value, 0.1, 5);
  }

  onMount(() => {
    audioElement = document.createElement("audio");
    audioElement.volume = 0.4;
    audioElement.muted = $muted;
    audioElement.loop = true;
    audioCtx = new AudioContext();
    source = audioCtx.createMediaElementSource(audioElement);
    source.connect(audioCtx.destination);

    resultElement.addEventListener("wheel", (e) => {
      if (e.deltaY < 0) {
        setZoom(zoom + 0.1);
      } else {
        setZoom(zoom - 0.1);
      }
    });

    let lastX: number;
    let lastY: number;
    resultElement.addEventListener("mousedown", (e) => {
      isPanning = true;
      lastX = e.clientX;
      lastY = e.clientY;
      resultElement.style.cursor = "grabbing";
    });
    document.addEventListener("mouseup", () => {
      isPanning = false;
      resultElement.style.cursor = "default";
    });
    document.addEventListener("mousemove", (e) => {
      if (isPanning) {
        const deltaX = (e.clientX - lastX) / zoom;
        const deltaY = (e.clientY - lastY) / zoom;
        canvasOffset = {
          x: canvasOffset.x + deltaX,
          y: canvasOffset.y + deltaY
        };
        lastX = e.clientX;
        lastY = e.clientY;
      }
    });
  });

  onDestroy(() => {
    if (audioCtx) audioCtx.close();
  });
</script>

<div class="size-full flex">
  <!-- sidebar -->
  <aside class="w-lg border-r-2 border-border bg-surface flex flex-col">
    <h2 class="text-text-bright font-bold text-base flex gap-2 items-center py-4 px-6 border-b-2 border-border">
      SETTINGS
    </h2>

    <div class="flex flex-col gap-10 overflow-y-auto p-6 grow w-full">
      <Setting name="Audio Track">
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
            <span class="px-2 text-text-dim">{musicFile ? musicFile.name : "[drop or pick an audio track]"}</span>
          </div>
        </FilePicker>
      </Setting>

      <Setting name="GIF Source">
        <FilePicker
          previewSrc={gifSrc}
          placeholderIcon="material-symbols:image-outline-sharp"
          onUpload={onGifUpload}
          validFileTypes={["image/gif", "image/png", "image/jpeg"]}
        >
          <div class="flex flex-col gap-2 w-full">
            <span>frames = {gifFrames.length > 0 ? gifFrames.length : "?"}</span>
            <span class="px-2 text-text-dim">{gifFile ? gifFile.name : "[drop or pick a gif]"}</span>
          </div>
        </FilePicker>
      </Setting>

      <Setting name="Audio BPM">
        <NumberPicker bind:value={bpm} />
      </Setting>

      <Setting name="Speed Multiplier">
        <Radio items={SPEEDS} name="speed-multiplier" bind:value={speedMultiplier} />
      </Setting>

      <Setting name="Frame Offset">
        <Slider.Root
          type="single"
          bind:value={frameOffset}
          min={0}
          step={1}
          max={gifFrames.length}
          class="relative flex items-center w-full hover:cursor-grab active:cursor-grabbing group mt-4"
        >
          <span class="h-1 w-full bg-border rounded-sm duration-100">
            <Slider.Range class="bg-text-dim h-full absolute rounded-sm duration-100" />
          </span>

          <Slider.Thumb
            index={0}
            class="size-4 bg-accent outline-none rounded-full duration-100 z10"
          />
        </Slider.Root>
      </Setting>

      <Setting name="Export Quality">
        <Radio items={QUALITY} name="quality" bind:value={qualityValue} />
      </Setting>

      <Setting name="Video Codec">
        <Radio items={CODECS} name="codec" bind:value={codecValue} />
      </Setting>
    </div>

    <div class="border-t2 border-border p-4">
      <button disabled class="text-bg bg-accent disabled:opacity-30 disabled:cursor-not-allowed w-full py-2 font-bold rounded-sm hover:bg-text-bright hover:cursor-pointer active:scale-98 duration-100">
        Export to MP4
      </button>
    </div>

    <div class="flex w-full border-t-2 border-border p-4 justify-between">
      <Logo {bpm} />
    </div>
  </aside>

  <div bind:this={resultElement} class="bg-dotted h-full grow flex justify-center items-center overflow-hidden relative">
    {#if gifFile && bpm}
      <div
        class="duration-50"
        style:transform="translate({canvasOffset.x}px, {canvasOffset.y}px)"
        style:scale="{zoom}"
      >
        <GifPlayer
          bind:this={gifPlayer}
          frameDuration={1 / (bpm / 60) / gifFrames.length / (speedMultiplier == 0 ? autoSpeedMultiplier : speedMultiplier) * 1000}
          offset={frameOffset}
          frames={gifFrames}
          bind:canvas={gifPlayerCanvas}
        />
      </div>
    {:else}
      <div class="flex flex-col justify-center items-center font-normal gap-2 size-full">
        <h2>PREVIEW HERE</h2>
        <p class="text-text-dim">[drop or select a gif and audio track]</p>
      </div>
    {/if}

    {#if gifFile && bpm}
      <p class="flex absolute bottom-6 left-6 text-text-dim backdrop-blur-xl rounded-sm px-3 py-1">
        scroll to zoom + drag to pan
      </p>
    {/if}

    <div class="flex items-center absolute bottom-6 right-6">
      <button
        onclick={() => setZoom(zoom - 0.25)}
        class="cursor-pointer aspect-square flex justify-center items-center text-text-dim size-8 hover:text-text-bright"
      >-</button>
      <button
        onclick={() => setZoom(1)}
        class="cursor-pointer w-16 flex justify-center items-center"
      >{Math.round(zoom * 100)}%</button>
      <button
        onclick={() => setZoom(zoom + 0.25)}
        class="cursor-pointer aspect-square flex justify-center items-center text-text-dim size-8 hover:text-text-bright"
      >+</button>
    </div>

    <div class="flex items-center absolute gap-3 top-6 left-6">
      <button
        aria-label="mute toggle"
        title="Toggle Mute"
        onclick={() => $muted = !$muted}
        class="flex justify-center items-center border-2 rounded-sm bg-bg border-border hover:bg-border text-text hover:text-text-bright size-10 cursor-pointer"
      >
        <iconify-icon icon={$muted ? "material-symbols:volume-off-outline" : "material-symbols:volume-up-outline"} class="text-xl"></iconify-icon>
      </button>

      <a
        aria-label="info"
        title="About"
        href="/#"
        class="flex justify-center items-center border-2 rounded-sm bg-bg border-border hover:bg-border text-text hover:text-text-bright size-10 cursor-pointer"
      >
        <iconify-icon icon="material-symbols:info-outline" class="text-xl"></iconify-icon>
      </a>
    </div>
  </div>
</div>
