<script lang="ts">
  let {
    value = $bindable(),
    disabled
  }: {
    value: number | null,
    disabled?: boolean
  } = $props();

  function changeValue(delta: number) {
    if (value == null) return;
    value += delta;
  }
</script>

<div class="flex w-full items-stretch border-2 border-border bg-bg rounded-md p-1">
  <button onclick={() => changeValue(-1)} class="bg-surface text-text-dim hover:text-text-bright hover:bg-border size-9 rounded-sm flex justify-center text-lg items-center cursor-pointer active:scale-95 duration-100 font-bold">
    -
  </button>

  {#if value}
    <input
      bind:value
      type="number"
      name="bpm"
      id="bpm"
      class="text-center grow outline-none"
      min={20}
      max={300}
    />
  {:else}
    <p class="text-center grow flex items-center justify-center text-text-dim">no bpm detected</p>
  {/if}

  <button onclick={() => changeValue(1)} class="bg-surface text-text-dim hover:text-text-bright hover:bg-border size-9 rounded-sm flex justify-center text-lg items-center cursor-pointer active:scale-95 duration-100 font-bold">
    +
  </button>
</div>
