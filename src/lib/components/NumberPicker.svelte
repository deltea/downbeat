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

<div class="flex w-full items-stretch">
  <button onclick={() => changeValue(-1)} class="bg-surface hover:bg-surface-0 size-11 rounded-l-md flex justify-center text-lg items-center cursor-pointer active:scale-95 duration-100 font-bold">
    -
  </button>

  {#if value}
    <input bind:value type="number" name="bpm" id="bpm" class="border-y-3 border-surface text-center grow outline-none">
  {:else}
    <p class="border-y-3 border-surface text-center grow flex items-center justify-center text-muted">no bpm</p>
  {/if}

  <button onclick={() => changeValue(1)} class="bg-surface hover:bg-surface-0 size-11 rounded-r-md flex justify-center text-lg items-center cursor-pointer active:scale-95 duration-100 font-bold">
    +
  </button>
</div>
