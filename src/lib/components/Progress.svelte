<script lang="ts">
  const steps = ["music", "visuals", "sync", "export"];
  const icons = ["mingcute:music-2-fill", "mingcute:eye-2-fill", "mingcute:star-fill", "mingcute:share-forward-fill"]

  let { currentStep = $bindable() }: { currentStep: number } = $props();

  function changeStep(step: number) {
    if (process.env.NODE_ENV !== "development") return;
    currentStep = step;
  }
</script>

<header class="fixed top-0 left-0 flex items-center justify-center h-progress w-full">
  {#each steps as step, i}
    <button onclick={() => changeStep(i)} class="relative border-2 rounded-sm size-12 flex justify-center items-center font-bold hover:scale-105 active:scale-100 duration-100 hover:cursor-pointer {currentStep >= i ? "bg-fg border-fg text-bg" : "border-surface-0 text-muted"}">
      <iconify-icon icon={icons[i]} class="text-2xl"></iconify-icon>

      <p class="absolute top-16 w-max text-center font-normal flex items-center gap-2 {currentStep >= i ? "text-fg" : "text-muted"}">
        {step}
      </p>
    </button>

    {#if i != steps.length - 1}
      <hr class="border-1 w-24 {currentStep - 1 >= i ? "border-fg" : "border-surface-0"}" />
    {/if}
  {/each}
</header>
