<script lang="ts">
  import type { Snippet } from "svelte";
  import HelpTooltip from "./HelpTooltip.svelte";

  let { name, description, children }: {
    name: string;
    description?: string;
    children: Snippet;
  } = $props();
</script>

<div>
  <p class="mb-3 flex gap-3">
    <span class="font-bold uppercase">{name}</span>
    <HelpTooltip>{description}</HelpTooltip>
  </p>

  {@render children()}
</div>
