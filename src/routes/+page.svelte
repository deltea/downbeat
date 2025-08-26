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

<div class="grow flex flex-col py-16 mb-nav gap-24">
  <!-- top row -->
  <div class="flex justify-center gap-32 w-full">
    <button class="dashed w-[24rem] flex flex-col gap-4 items-center text-faded rounded-sm cursor-pointer p-8 outline-none hover:scale-[101%] active:scale-100 duration-100">
      <span class="text-muted">BPM = 120</span>
      <div class="bg-surface rounded-sm w-full aspect-square"></div>
      <span>choose an audio track</span>
    </button>

    <button class="dashed w-[24rem] flex flex-col gap-4 items-center text-faded rounded-sm cursor-pointer p-8 outline-none hover:scale-[101%] active:scale-100 duration-100">
      <span class="text-muted">FRAMES = ?</span>
      <div class="bg-surface rounded-sm w-full aspect-square"></div>
      <span>choose a gif</span>
    </button>
  </div>

  <!-- bottom row -->
  <div class="flex justify-center gap-32 w-full grow">
    <div class="dashed h-full aspect-square rounded-sm">
      <div class="bg-surface rounded-sm w-full h-full"></div>
    </div>

    <div class="dashed h-full flex flex-col justify-between grow rounded-sm p-8">
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
