<script lang="ts">
  import { muted } from "$lib/stores";

  let { bpm }: { bpm: number } = $props();
  let boombox: HTMLImageElement;
  let beatInterval: ReturnType<typeof setInterval> | null = $state(null);

  $effect(() => {
    if (bpm === 0) return;

    if (beatInterval) clearInterval(beatInterval);
    beatInterval = setInterval(() => {
      console.log("🎵 beat detected!");
      boombox.style.scale = "1.3";
      boombox.style.transitionDuration = "0ms";
      setTimeout(() => {
        boombox.style.scale = "1";
        boombox.style.transitionDuration = "100ms";
      }, 100);
    }, 60 / bpm * 1000);
  })
</script>

<nav class="fixed flex items-center justify-between w-full h-nav bottom-0 left-0 pl-6 pr-10">
  <a href="/" class="flex gap-4 items-center group">
    <img bind:this={boombox} src="/logo.svg" alt="logo" class="w-10 aspect-square" />

    <div>
      <h1 class="font-bold group-hover:underline decoration-2 underline-offset-2">downbeat</h1>
      <p class="text-faded">the ultimate beat-syncer</p>
    </div>
  </a>

  <div class="flex items-center gap-10">
    <button onclick={() => ($muted = !$muted)} class="hover:cursor-pointer hover:scale-110 active:scale-100 duration-100 group" aria-label="mute">
      <iconify-icon icon={$muted ? "mingcute:volume-off-fill" : "mingcute:volume-fill"} class="text-3xl group-hover:rotate-12 duration-100"></iconify-icon>
    </button>

    <a href="https://github.com/deltea/downbeat" target="_blank" class="hover:cursor-pointer hover:scale-110 active:scale-100 duration-100 group" aria-label="github">
      <iconify-icon icon="mingcute:github-fill" class="text-3xl group-hover:rotate-12 duration-100"></iconify-icon>
    </a>

    <a href="/settings" class="hover:cursor-pointer hover:scale-110 active:scale-100 duration-100 group" aria-label="settings">
      <iconify-icon icon="mingcute:settings-3-fill" class="text-3xl group-hover:rotate-30 duration-100"></iconify-icon>
    </a>
  </div>
</nav>
