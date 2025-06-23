<script lang="ts">
  import { RadioGroup, Label, type WithoutChildrenOrChild, useId } from "bits-ui";

  type Item = {
    value: string;
    label: string;
    disabled?: boolean;
  };

  type Props = WithoutChildrenOrChild<RadioGroup.RootProps> & {
    items: Item[];
  };

  let {
    value = $bindable(""),
    ref = $bindable(null),
    items,
    ...restProps
  }: Props = $props();
</script>

<div class="flex justify-center w-full">
  <RadioGroup.Root bind:value bind:ref {...restProps} class="flex gap-0 rounded-sm bg-bg-0 font-bold w-full">
    {#each items as item}
      {@const id = useId()}
      <RadioGroup.Item {id} value={item.value} disabled={item.disabled} class="text-fg data-[state=checked]:bg-fg data-[state=checked]:text-bg w-full py-2 rounded-sm hover:bg-dark hover:cursor-pointer data-[state=checked]:active:scale-95 duration-100">
        {item.label}
      </RadioGroup.Item>
    {/each}
  </RadioGroup.Root>
</div>
