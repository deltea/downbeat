<script lang="ts">
  const steps = ["music", "images", "fusion", "result"];
  const icons = ["mingcute:video-fill", "mingcute:pic-2-fill", "mingcute:star-fill", "mingcute:share-forward-fill"]
  let { currentStep }: { currentStep: number } = $props();
</script>

<header class="fixed top-0 left-0 flex items-center justify-center h-progress w-full">
  {#each steps as step, i}
    <span class="relative border-2 rounded-sm size-12 flex justify-center items-center font-bold hover:scale-105 active:scale-100 duration-100 hover:cursor-pointer {currentStep >= i ? "border-fg text-fg" : "border-dark text-dark"}">
      <iconify-icon icon={icons[i]} class="text-xl"></iconify-icon>

      <button class="absolute top-16 w-max text-center font-normal flex items-center gap-2 {currentStep >= i ? "text-fg" : "text-faded"}">
        {step}
      </button>
    </span>

    {#if i != steps.length - 1}
      <hr class="border-1 w-24 {currentStep - 1 >= i ? "border-fg" : "border-dark"}" />
    {/if}
  {/each}
</header>
