<script lang="ts">
  import { RadioGroup, type WithoutChildrenOrChild, useId } from "bits-ui";

  type Item<T = any> = {
    value: T;
    label: string;
    disabled?: boolean;
  };

  type Props<T = any> = {
    value: T;
    ref?: HTMLDivElement | null;
    items: Item<T>[];
    [key: string]: any;
  };

  let {
    value = $bindable(),
    ref = $bindable(null),
    items,
    ...restProps
  }: Props = $props();
</script>

<div class="flex justify-center w-full">
  <RadioGroup.Root bind:value bind:ref {...restProps} class="flex gap-0 rounded-sm bg-bg border-2 border-border w-full p-1 gap-1">
    {#each items as item}
      {@const id = useId()}
      <RadioGroup.Item
        {id}
        value={item.value}
        disabled={item.disabled}
        class="text-text-dim data-[state=checked]:bg-accent data-[state=checked]:font-bold data-[state=checked]:text-bg w-full py-2 rounded-sm hover:bg-border hover:text-text-bright hover:cursor-pointer data-[state=checked]:active:scale-95 duration-100"
      >
        {item.label}
      </RadioGroup.Item>
    {/each}
  </RadioGroup.Root>
</div>
