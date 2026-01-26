<script lang="ts">
  import { onDestroy } from "svelte";

  const transitionDuration = 100;
  const impactRotation = 8;

  let { bpm }: { bpm: number | null } = $props();
  let boombox: HTMLDivElement;
  let beatInterval: ReturnType<typeof setInterval> | null = null;
  let count = 0;

  $effect(() => {
    if (!bpm) return;
    if (beatInterval) clearInterval(beatInterval);

    beatInterval = setInterval(() => {
      if (!boombox) return;

      count++;
      boombox.style.scale = "1.2";
      boombox.style.rotate = count % 2 === 0 ? `${impactRotation}deg` : `-${impactRotation}deg`;
      boombox.style.transitionDuration = "0ms";
      setTimeout(() => {
        if (!boombox) return;

        boombox.style.scale = "1";
        boombox.style.rotate = "0deg";
        boombox.style.transitionDuration = `${transitionDuration}ms`;
      }, transitionDuration);
    }, 60 / bpm * 1000);
  });

  onDestroy(() => {
    if (beatInterval) clearInterval(beatInterval);
  });
</script>

<a href="/" class="flex gap-4 items-center group">
  <div class="w-10 aspect-square" bind:this={boombox}>
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
    <h1 class="font-black group-hover:underline decoration-2 underline-offset-2 text-accent">downbeat</h1>
    <p>[sync gifs to the beat]</p>
  </div>
</a>
