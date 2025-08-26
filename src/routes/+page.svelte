<script lang="ts">
  import Nav from "$components/Nav.svelte";
  import Radio from "$components/Radio.svelte";
  import { Slider } from "bits-ui";

  const SPEEDS = [
    { value: 0.5, label: "0.5x" },
    { value: 1, label: "1x" },
    { value: 2, label: "2x" },
    { value: 4, label: "4x" },
    { value: 8, label: "8x" },
    { value: 16, label: "16x" }
  ];
</script>

<div class="grow flex flex-col items-center py-16 gap16 relative">
  <!-- top row -->
  <div class="flex justify-center gap-16 w-full">
    <button class="dashed h-[10rem] w-[32rem] flex gap-4 items-center text-faded rounded-sm cursor-pointer p-4 outline-none hover:scale-[101%] active:scale-100 duration-100 bg-bg">
      <div class="bg-surface rounded-sm h-full aspect-square"></div>
      <div class="flex flex-col gap-2 w-full">
        <span class="text-muted">BPM = 120</span>
        <span>[choose an audio track]</span>
      </div>
    </button>

    <button class="dashed h-[10rem] w-[32rem] flex gap-4 items-center text-faded rounded-sm cursor-pointer p-4 outline-none hover:scale-[101%] active:scale-100 duration-100 bg-bg">
      <div class="bg-surface rounded-sm h-full aspect-square"></div>
      <div class="flex flex-col gap-2 w-full">
        <span class="text-muted">FRAMES = ?</span>
        <span>[choose a gif]</span>
      </div>
    </button>
  </div>

  <!-- connector lines -->
  <svg height="64" width="100%" xmlns="http://www.w3.org/2000/svg">
    <path d="M500 4 L500 22 Q500 26 496 26 L254 26 Q250 26 250 31 L250 60" style="fill: none; stroke: var(--color-surface); stroke-width: 2" />
    <path d="M1010 4 L1010 42 Q1010 46 1006 46 L274 46 Q270 46 270 50 L270 60" style="fill: none; stroke: var(--color-surface); stroke-width: 2" />
  </svg>

  <!-- bottom row -->
  <div class="flex justify-center gap16 w-full grow">
    <div class="bg-surface flex justify-center items-center h-full aspect-square rounded-sm">
      PREVIEW HERE
    </div>

    <!-- connector line -->
    <svg height="100%" width="64" xmlns="http://www.w3.org/2000/svg">
      <path d="M4 300 L60 300" style="fill: none; stroke: var(--color-surface); stroke-width: 2" />
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

      <button class="flex justify-center items-center gap-2 font-bold rounded-sm bg-fg w-full py-2.5 text-bg cursor-pointer hover:scale-[101%] active:scale-100 duration-100">
        <iconify-icon icon="mingcute:share-forward-fill" class="text-xl"></iconify-icon>
        export
      </button>
    </div>
  </div>
</div>

<Nav bpm={120} />
