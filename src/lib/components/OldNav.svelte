<script lang="ts">
  import { muted, theme } from "$lib/stores";
  import { availableThemes } from "$lib/themes";
  import { onDestroy } from "svelte";

  let { bpm }: { bpm: number | null } = $props();
  let boombox: HTMLDivElement;
  let beatInterval: ReturnType<typeof setInterval> | null = null;

  $effect(() => {
    if (!bpm) return;

    if (beatInterval) clearInterval(beatInterval);
    beatInterval = setInterval(() => {
      if (!boombox) return;

      // console.log("🎵 beat detected!");
      boombox.style.scale = "1.3";
      boombox.style.transitionDuration = "0ms";
      setTimeout(() => {
        if (!boombox) return;

        boombox.style.scale = "1";
        boombox.style.transitionDuration = "100ms";
      }, 100);
    }, 60 / bpm * 1000);
  });

  onDestroy(() => {
    if (beatInterval) clearInterval(beatInterval);
  });
</script>

<nav class="fixed flex items-center justify-between w-full h-nav bottom-0 left-0 pl-8 pr-10">
  <a href="/" class="flex gap-4 items-center group">
    <div bind:this={boombox} class="w-10 aspect-square">
      <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" class="text-accent size-full">
        <path
          fill="currentColor"
          fill-rule="evenodd"
          d="M1 5a4 4 0 0 1 4.002-4h13.996A4 4 0 0 1 23 5v14a4 4 0 0 1-4 4H5a4 4 0 0 1-4-4zm19 7a8 8 0 1 1-16 0a8 8 0 0 1 16 0m-8 2a2 2 0 1 0 0-4a2 2 0 0 0 0 4"
          clip-rule="evenodd"
        />
      </svg>
    </div>

    <div>
      <h1 class="font-bold group-hover:underline decoration-2 underline-offset-2 text-accent">downbeat</h1>
      <p class="text-text">sync gifs to the beat</p>
    </div>
  </a>

  <div class="flex items-center gap-10">
    <button onclick={() => ($muted = !$muted)} class="hover:cursor-pointer hover:scale-110 active:scale-100 duration-100 group" aria-label="mute">
      <iconify-icon icon={$muted ? "mingcute:volume-off-fill" : "mingcute:volume-fill"} class="text-3xl group-hover:rotate-12 duration-100"></iconify-icon>
    </button>

    <button
      onclick={() => ($theme = ($theme + 1) % availableThemes.length)}
      class="hover:cursor-pointer hover:scale-110 active:scale-100 duration-100 group"
      aria-label="settings"
    >
      <iconify-icon icon="mingcute:palette-fill" class="text-3xl group-hover:rotate-30 duration-100"></iconify-icon>
    </button>

    <a href="https://github.com/deltea/downbeat" target="_blank" class="hover:cursor-pointer hover:scale-110 active:scale-100 duration-100 group" aria-label="github">
      <iconify-icon icon="mingcute:github-fill" class="text-3xl group-hover:rotate-12 duration-100"></iconify-icon>
    </a>

    <!-- <button
      class="hover:cursor-pointer hover:scale-110 active:scale-100 duration-100 group"
      aria-label="settings"
    >
      <iconify-icon icon="mingcute:settings-3-fill" class="text-3xl group-hover:rotate-30 duration-100"></iconify-icon>
    </button> -->
  </div>
</nav>
