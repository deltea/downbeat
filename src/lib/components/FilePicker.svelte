<script lang="ts">
  import { Dialog, DropdownMenu, RadioGroup } from "bits-ui";
  import { onMount, type Snippet } from "svelte";

  let {
    children,
    validFileTypes,
    onUpload = (file: File) => console.log("uploaded file: ", file.name),
    placeholderIcon,
    previewSrc,
    samples
  }: {
    children: Snippet,
    validFileTypes: string[],
    onUpload?: (file: File) => void,
    placeholderIcon: string,
    previewSrc?: string | null,
    samples?: {
      name: string;
      path: string;
      img: string;
    }[]
  } = $props();

  let fileInput: HTMLInputElement;
  let dropElement: HTMLButtonElement;
  let isDialogOpen = $state(false);
  let selectedSample = $state<string>();

  function fileInputChange(e: Event) {
    const target = e.target as HTMLInputElement;
    const files = target.files;

    if (files && files.length > 0) {
      console.log(files[0]);
      onUpload(files[0]);
    } else {
      console.error("no file selected");
    }
  }

  function onDrop(e: DragEvent) {
    e.preventDefault();
    onDragLeave();
    const files = e.dataTransfer?.files;
    if (files && files.length > 0) {
      if (validFileTypes.includes(files[0].type)) {
        console.log(files[0]);
        onUpload(files[0]);
      } else {
        console.error("invalid file type");
      }
    } else {
      console.error("no file dropped");
    }
  }

  function onDrag(e: DragEvent) {
    e.preventDefault();
    dropElement.classList.add("border-text-bright!");
    dropElement.classList.add("text-text-bright!");
  }

  function onDragLeave() {
    dropElement.classList.remove("border-text-bright!");
    dropElement.classList.remove("text-text-bright!");
  }
</script>

<DropdownMenu.Root>
  <DropdownMenu.Trigger>
    {#snippet child({ props })}
      <button
        {...props}
        bind:this={dropElement}
        ondrop={onDrop}
        ondragover={onDrag}
        ondragenter={onDrag}
        ondragleave={onDragLeave}
        ondragend={onDragLeave}
        class="border-2 border-border border-dashed w-full h-24 flex gap-4 items-center rounded-sm cursor-pointer group hover:border-text-dim hover:text-text-bright text-text p-2 outline-none duration-100 bg-bg"
      >
        {#if previewSrc}
          <div class="bg-cover h-full aspect-square bg-center rounded-sm" style:background-image="url('{previewSrc}')"></div>
        {:else}
          <div class="flex justify-center items-center h-full aspect-square rounded-sm text-text-dim group-hover:text-text-bright duration-100">
            <iconify-icon icon={placeholderIcon} class="text-[3rem]"></iconify-icon>
          </div>
        {/if}

        {@render children()}
      </button>
    {/snippet}
  </DropdownMenu.Trigger>
  <DropdownMenu.Portal>
    <DropdownMenu.Content
      align="center"
      sideOffset={8}
      class="bg-bg border-border border-2 rounded-md shadow-lg p-1 w-48 z-50"
    >
      <DropdownMenu.Item
        class="py-2 px-3 rounded-sm hover:bg-border hover:text-text text-text-dim hover:cursor-pointer outline-none duration-100"
        onclick={() => fileInput.click()}
      >
        Choose File
      </DropdownMenu.Item>
      <DropdownMenu.Item
        class="py-2 px-3 rounded-sm hover:bg-border hover:text-text text-text-dim hover:cursor-pointer outline-none duration-100"
        onclick={() => isDialogOpen = true}
      >
        Use Sample
      </DropdownMenu.Item>
    </DropdownMenu.Content>
  </DropdownMenu.Portal>
</DropdownMenu.Root>

<Dialog.Root open={isDialogOpen} onOpenChange={(open) => isDialogOpen = open}>
  <Dialog.Portal>
    <Dialog.Overlay class="fixed inset-0 z-50 bg-bg/80" />
    <Dialog.Content class="sm:max-w-4xl w-full h-96 rounded-sm border-2 border-border bg-surface shadow-lg outline-none z-50 fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex justify-center items-center">
      <Dialog.Close class="outline-none absolute right-4 top-4 cursor-pointer">
        <iconify-icon icon="material-symbols:close" class="text-lg"></iconify-icon>
      </Dialog.Close>

      <RadioGroup.Root class="flex items-center h-32 gap-4" value={selectedSample} onValueChange={(value) => selectedSample = value}>
        {#each samples as sample}
          <RadioGroup.Item
            value={sample.name}
            class="h-full aspect-square rounded-md p-2 border-2 border-border data-[state=checked]:border-text-dim bg-bg cursor-pointer"
          >
            <div
              class="size-full rounded-sm bg-cover bg-center"
              style:background-image="url('{sample.img}')"
            ></div>
          </RadioGroup.Item>
        {/each}
      </RadioGroup.Root>

      <Dialog.Close
        disabled={!selectedSample}
        class="rounded-sm bg-accent text-bg px-4 py-2 disabled:opacity-30 disabled:cursor-not-allowed absolute bottom-4 right-4 cursor-pointer hover:brightness-90 active:scale-95 outline-none duration-100 font-bold"
        onclick={() => {
          const sample = samples?.find(s => s.name === selectedSample);
          if (sample) {
            fetch(sample.path)
              .then(res => res.blob())
              .then(blob => {
                const file = new File([blob], sample.name + sample.path.slice(sample.path.lastIndexOf(".")), { type: blob.type });
                onUpload(file);
              });
          }
        }}
      >
        select
      </Dialog.Close>
    </Dialog.Content>
  </Dialog.Portal>
</Dialog.Root>

<input
  onchange={fileInputChange}
  bind:this={fileInput}
  accept={validFileTypes.join(",")}
  type="file"
  name="music"
  id="music"
  class="hidden"
  multiple={false}
/>
