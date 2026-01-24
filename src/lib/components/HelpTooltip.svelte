<script lang="ts">
  import { Tooltip } from "bits-ui";
  import { fly } from "svelte/transition";

  let { children } = $props();
</script>

<Tooltip.Provider>
  <Tooltip.Root delayDuration={200}>
    <Tooltip.Trigger class="flex justify-center items-center text-text-dim">
      <iconify-icon icon="material-symbols:info-outline" class="text-lg"></iconify-icon>
    </Tooltip.Trigger>

    <Tooltip.Content forceMount sideOffset={8} collisionPadding={16} class="drop-shadow-base">
      {#snippet child({ wrapperProps, props, open })}
        {#if open}
          <div {...wrapperProps}>
            <div {...props} transition:fly={{ y: 8, duration: 100 }}>
              <Tooltip.Arrow class="text-border" />

              <div class="bg-border py-2 px-4 rounded-sm text-sm text-text relative z-50">
                {@render children()}
              </div>
            </div>
          </div>
        {/if}
      {/snippet}

    </Tooltip.Content>
  </Tooltip.Root>
</Tooltip.Provider>
