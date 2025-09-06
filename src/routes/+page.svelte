<script lang="ts">
  import { onDestroy, onMount } from "svelte";
  import { Popover, Slider } from "bits-ui";
  import { extractBPM, extractCoverImage } from "$lib";
  import { muted } from "$lib/stores";
  import { decompressFrames, parseGIF, type ParsedFrame } from "gifuct-js";
  import {
    AudioBufferSource,
    BufferTarget,
    Mp4OutputFormat,
    Output,
    QUALITY_MEDIUM,
    QUALITY_VERY_HIGH,
    QUALITY_VERY_LOW,
    VideoSample,
    VideoSampleSource
  } from "mediabunny";

  import Nav from "$components/Nav.svelte";
  import Radio from "$components/Radio.svelte";
  import FilePicker from "$components/FilePicker.svelte";
  import GifPlayer from "$components/GifPlayer.svelte";
  import HelpTooltip from "$components/HelpTooltip.svelte";

  interface OutputItem {
    gifSrc: string;
    gifName: string;
    audioName: string;
    outputUrl: string | null;
    output: Output;
  }

  const SPEEDS = [
    { value: 0.125, label: "0.125x" },
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
  let gifPlayer: GifPlayer | null = $state(null);

  let speedMultiplier = $state(0.5);
  let frameOffset = $state(0);
  let qualityValue = $state(QUALITY_MEDIUM);

  let exampleUrl = $state("");
  let processingQueueOpen = $state(false);
  let processingQueue = $state<OutputItem[]>([]);

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

  function restartPreview() {
    audioCtx?.resume();
    audioElement.currentTime = 0;
    audioElement.play();
    gifPlayer?.reset();
  }

  async function onExport() {
    if (!bpm || gifFrames.length === 0 || !musicFile) return;

    console.log(`exporting at ${qualityValue === QUALITY_VERY_LOW ? "low" : qualityValue === QUALITY_MEDIUM ? "medium" : "high"} quality...`);
    const timeStart = performance.now();

    const video = new Output({
      format: new Mp4OutputFormat(),
      target: new BufferTarget(),
    });

    const queueIndex = processingQueue.length;
    processingQueue = [
      ...processingQueue,
      {
        gifSrc: gifSrc!,
        gifName: gifFile!.name,
        audioName: musicFile.name,
        outputUrl: null,
        output: video,
      }
    ];
    processingQueueOpen = true;

    const sampleSource = new VideoSampleSource({
      codec: "avc",
      bitrate: QUALITY_VERY_HIGH,
      sizeChangeBehavior: "contain",
    });

    const audioSource = new AudioBufferSource({
      codec: "aac",
      bitrate: qualityValue,
    });

    video.addVideoTrack(sampleSource);
    video.addAudioTrack(audioSource);

    await video.start();

    // add audio
    const audioBuffer = await audioCtx.decodeAudioData(await musicFile.arrayBuffer());
    audioSource.add(audioBuffer);

    // add video
    const frames = gifFrames;
    const secondsPerFrame = 1 / (bpm / 60) / frames.length / speedMultiplier;

    let timestamp = 0;
    let index = 0;
    while (timestamp <= audioElement.duration) {
      if (index === 0) {
        console.log(Math.ceil(timestamp / audioElement.duration * 100) + "% done");
      }

      const frame = frames[index];
      const buffer = frame.patch;
      const sample = new VideoSample(buffer, {
        format: "RGBA",
        codedWidth: frame.dims.width,
        codedHeight: frame.dims.height,
        timestamp,
        duration: secondsPerFrame,
      });

      index = (index + 1) % frames.length;
      timestamp += secondsPerFrame;

      await sampleSource.add(sample);
    }

    await video.finalize();

    console.log(`export finished in ${Math.round((performance.now() - timeStart) / 1000)}s`);

    const file = video.target.buffer;
    if (!file) throw new Error("No file generated");

    const blob = new Blob([file], { type: "video/mp4" });
    const url = URL.createObjectURL(blob);

    processingQueue[queueIndex].outputUrl = url;
    processingQueueOpen = true;

    console.log(url);
    exampleUrl = url;
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

    processingQueue.forEach(item => {
      item.output.cancel();
    });
  });
</script>

<!-- <video src={exampleUrl} class="absolute left-0 top-0 z-20" controls>
  <track kind="captions" />
</video> -->

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
      validFileTypes={["image/gif", "image/png", "image/jpeg"]}
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
    <div class="bg-surface font-bold flex justify-center items-center h-full aspect-square rounded-md p-4">
      {#if gifFile && bpm}
        <GifPlayer
          bind:this={gifPlayer}
          frameDuration={1 / (bpm / 60) / gifFrames.length / speedMultiplier * 1000}
          offset={frameOffset}
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

    <div class="dashed border3 border-surface-0 h-full flex flex-col justify-between grow rounded-md p-8 bg-bg max-w-[50rem] min-w-[30rem]">
      <div class="flex flex-col gap-12">
        <div>
          <!-- label -->
          <p class="mb-4 flex gap-3">
            <span class="font-bold">SPEED MULTIPLIER</span>
            <HelpTooltip>This controls how fast the gif plays.</HelpTooltip>
          </p>

          <!-- speed multiplier radio -->
          <Radio items={SPEEDS} name="speed-multiplier" bind:value={speedMultiplier} />
        </div>

        <div>
          <!-- label -->
          <p class="mb-4 flex gap-3">
            <span class="font-bold">FRAME OFFSET</span>
            <HelpTooltip>This controls how many frames the gif is offset by, change this to position the beat drop.</HelpTooltip>
          </p>

          <!-- audio offset slider -->
          {#if gifFrames.length > 0}
            <Slider.Root
              type="single"
              bind:value={frameOffset}
              min={-gifFrames.length / 2}
              step={1}
              max={gifFrames.length / 2}
              class="relative flex items-center w-full hover:cursor-grab active:cursor-grabbing group"
            >
              {#snippet children({ tickItems })}
                <span class="h-2 w-full bg-surface-0 rounded-md duration-100">
                  <Slider.Range class="bg-fg h-full absolute rounded-md duration-100" />
                </span>

                <Slider.Thumb
                  index={0}
                  class="size-6 bg-fg outline-none rounded-full duration-100 z-10"
                />
              {/snippet}
            </Slider.Root>

            <div class="w-full flex justify-between text-muted mt-4 text-sm">
              <span class="w-1/2 flex flex-col gap-1 items-start">
                <span>{-gifFrames.length / 2}</span>
              </span>

              <span class="flex flex-col gap-1 items-center">
                <span>0</span>
              </span>

              <span class="w-1/2 flex flex-col gap-1 items-end">
                <span>{gifFrames.length / 2}</span>
              </span>
            </div>
          {:else}
            <!-- placeholder slider -->
            <Slider.Root
              type="single"
              disabled
              value={0.5}
              min={0}
              step={0.5}
              max={1}
              class="relative flex items-center w-full group"
            >
              <span class="h-2 w-full bg-surface-0 rounded-md duration-100">
                <Slider.Range class="bg-muted h-full absolute rounded-md duration-100" />
              </span>

              <Slider.Thumb
                index={0}
                class="size-6 bg-muted outline-none rounded-full duration-100"
              />
            </Slider.Root>
          {/if}
        </div>

        <div>
          <!-- label -->
          <p class="mb-4 flex gap-3">
            <span class="font-bold">EXPORT QUALITY</span>
            <HelpTooltip>This controls how high quality the output video is, lower quality exports faster.</HelpTooltip>
          </p>

          <!-- speed multiplier radio -->
          <Radio items={QUALITY} name="quality" bind:value={qualityValue} />
        </div>
      </div>

      <div class="flex gap-4">
        <button
          onclick={restartPreview}
          class="inline-flex justify-center items-center gap-2 font-bold rounded-md bg-surface-0 w-1/2 py-2.5 text-fg cursor-pointer hover:scale-[102%] active:scale-100 duration-100"
        >
          <iconify-icon icon="mingcute:refresh-3-fill" class="text-xl"></iconify-icon>
          restart preview
        </button>

        <button
          onclick={onExport}
          class="inline-flex justify-center items-center gap-2 font-bold rounded-md bg-fg w-1/2 py-2.5 text-bg cursor-pointer hover:scale-[102%] active:scale-100 duration-100"
        >
          <iconify-icon icon="mingcute:share-forward-fill" class="text-xl"></iconify-icon>
          export
        </button>
      </div>
    </div>
  </div>
</div>

<Popover.Root bind:open={processingQueueOpen}>
  <Popover.Trigger class="fixed left-8 top-8 size-10 flex justify-center items-center rounded-full bg-surface-0 text-fg hover:scale-105 active:scale-100 duration-100 z-50 cursor-pointer">
    <iconify-icon icon="mingcute:download-2-fill" class="text-lg "></iconify-icon>
  </Popover.Trigger>

  <Popover.Portal>
    <Popover.Content
      sideOffset={8}
      collisionPadding={32}
      class="bg-surface-light rounded-lg w-[32rem] h-[30rem] shadow-lg"
    >
      <h3 class="text-muted font-bold py-3 px-4">PROCESSING QUEUE</h3>
      <ul class="flex flex-col gap-2 px-2">
        {#each processingQueue as video}
          <li class="p-2 flex gap-3 rounded-lg hover:bg-surface-0 duration-100 h-16 w-full">
            {#if video.outputUrl}
              <span class="h-full aspect-square bg-cover bg-center rounded-md" style:background-image="url('{video.gifSrc}')"></span>
            {:else if video.output.state === "started"}
              <span class="h-full aspect-square rounded-md bg-surface-0 flex justify-center items-center">
                <iconify-icon icon="tdesign:loading" class="animate-spin text-base"></iconify-icon>
              </span>
            {/if}

            <div class="flex flex-col grow justify-evenly">
              <p class="flex gap-2 text-sm">
                <span>{video.gifName}</span>
                <span class="text-muted">x</span>
                <span>{video.audioName}</span>
              </p>

              {#if video.outputUrl}
                <p class="text-muted">finished</p>
              {:else if video.output.state === "started"}
                <p class="text-muted">processing...</p>
              {/if}
            </div>

            {#if video.outputUrl}
              <!-- svelte-ignore a11y_consider_explicit_label -->
              <a
                download="export.mp4"
                href={video.outputUrl}
                class="text-bg bg-fg flex justify-center items-center h-full aspect-square hover:scale-105 active:scale-100 duration-100 rounded-md cursor-pointer"
              >
                <iconify-icon icon="mingcute:download-2-fill" class="text-lg"></iconify-icon>
              </a>
            {/if}
          </li>
        {/each}
      </ul>
    </Popover.Content>
  </Popover.Portal>
</Popover.Root>

<Nav {bpm} />
