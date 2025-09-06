<script lang="ts">
  import { Tooltip } from "bits-ui";

  let { children } = $props();
</script>

<Tooltip.Provider>
  <Tooltip.Root delayDuration={200}>
    <Tooltip.Trigger class="flex justify-center items-center text-muted">
      <iconify-icon icon="mingcute:information-fill" class="text-lg"></iconify-icon>
    </Tooltip.Trigger>

    <Tooltip.Content sideOffset={8}>
      <Tooltip.Arrow class="text-surface-0" />

      <div class="bg-surface-0 py-2 px-4 rounded-lg text-sm relative z-50">
        {@render children()}
      </div>
    </Tooltip.Content>
  </Tooltip.Root>
</Tooltip.Provider>
