<script lang="ts">
  import type { Snippet } from "svelte";

  let {
    children,
    validFileTypes,
    onUpload = (file: File) => console.log("uploaded file: ", file.name),
    placeholderIcon,
    previewSrc
  }: {
    children: Snippet,
    validFileTypes: string[],
    onUpload?: (file: File) => void,
    placeholderIcon: string,
    previewSrc?: string | null
  } = $props();

  let fileInput: HTMLInputElement;

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
</script>

<button
  onclick={() => fileInput.click()}
  ondrop={onDrop}
  ondragover={e => e.preventDefault()}
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
