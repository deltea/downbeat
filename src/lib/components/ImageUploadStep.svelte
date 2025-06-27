<script lang="ts">
  import type { Mode } from "$lib/types";
  import { decompressFrames, parseGIF, type ParsedFrame } from "gifuct-js";
  import Radio from "./Radio.svelte";

  const VALID_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

  let { mode = $bindable(), images = $bindable(), gif = $bindable(), gifFile = $bindable() }: {
    mode: Mode,
    images: File[],
    gif: ParsedFrame[],
    gifFile: File | null
  } = $props();

  let imageFileInput: HTMLInputElement;
  let gifFileInput: HTMLInputElement;
  let previewSrc: string | null = $state(null);

  function fileInputChange(e: Event) {
    const target = e.target as HTMLInputElement;
    const files = target.files;
    upload(files ?? new FileList());
  }

  function onDrop(e: DragEvent) {
    e.preventDefault();
    const files = e.dataTransfer?.files;
    upload(files ?? new FileList());
  }

  function upload(files: FileList) {
    if (files && files.length > 0) {
      if (mode === "slideshow") {
        const filtered = Array.from(files).filter(file => VALID_IMAGE_TYPES.includes(file.type));
        if (filtered.length > 0) {
          images = [...images, ...filtered];
        } else {
          console.error("no images found in selected files");
        }
      } else {
        const file = Array.from(files).find(file => file.type === "image/gif");
        if (!file) {
          console.error("no gif found in selected files");
          return;
        } else {
          gifFile = file;
          // convert gif to frames
          const reader = new FileReader();
          reader.onload = (e) => {
            const buffer = e.target?.result as ArrayBuffer;
            const data = parseGIF(buffer);
            const decompressed = decompressFrames(data, true);
            gif = decompressed;
          };
          reader.readAsArrayBuffer(file);
        }
      }
    } else {
      console.error("no files selected");
    }
  }

  $effect(() => {
    if (gifFile) {
      previewSrc = URL.createObjectURL(gifFile);
    }
  })
</script>

<div class="w-full">
  <Radio items={[
    { value: "gif", label: "gif" },
    { value: "slideshow", label: "slideshow" }
  ]} bind:value={mode} />
</div>

<div class="dashed w-full rounded-sm outline-none">
  {#if (mode === "slideshow" ? images.length > 0 : gif.length > 0)}
    {#if mode === "slideshow"}
      <!-- images grid -->
      <div class="grid grid-cols-3 align-top gap-6 w-full aspect-square overflow-y-auto p-6">
        {#each images as image, i}
          <div class="w-full flex justify-center items-center aspect-square rounded-sm relative group">
            <div
              class="size-full rounded-sm bg-bg-0 bg-cover bg-center group-hover:brightness-50 duration-100 absolute left-0 top-0"
              style:background-image="url('{URL.createObjectURL(image)}')"
            ></div>

            <p class="group-hover:opacity-100 opacity-0 text-sm z-10 wrap-anywhere text-center p-2">{image.name}</p>

            <button class="absolute top-2 left-2 group-hover:opacity-100 hover:cursor-pointer opacity-0 bg-fg text-bg rounded-sm flex justify-center items-center size-6 duration-100 z-10" aria-label="remove image">
              <iconify-icon icon="mingcute:close-fill" class="text-base"></iconify-icon>
            </button>
          </div>
        {/each}

        <button
          onclick={() => imageFileInput.click()}
          ondrop={onDrop}
          class="w-full aspect-square rounded-sm bg-bg-0 flex justify-center items-center hover:cursor-pointer"
          aria-label="add image"
        >
          <iconify-icon icon="mingcute:add-fill" class="text-2xl"></iconify-icon>
        </button>
      </div>
    {:else}
      <!-- single gif image -->
      <button
        class="p-6 size-full hover:cursor-pointer rounded-sm"
        onclick={() => gifFileInput.click()}
        ondrop={onDrop}
        aria-label="change gif"
      >
        <div
          class="w-full aspect-square rounded-sm bg-bg-0 bg-cover bg-center"
          style:background-image="url('{previewSrc}')"
        ></div>
      </button>
    {/if}
  {:else}
    <!-- upload area -->
    <button
      onclick={() => (mode === "slideshow" ? imageFileInput : gifFileInput).click()}
      ondrop={onDrop}
      ondragover={e => e.preventDefault()}
      class="w-full aspect-square flex justify-center items-center text-center text-faded p-16 hover:cursor-pointer"
    >
      {#if mode === "gif"}
        drop or select your gif here!
      {:else}
        drop or select your images here!
      {/if}
    </button>
  {/if}
</div>

<input
  onchange={fileInputChange}
  bind:this={imageFileInput}
  accept={VALID_IMAGE_TYPES.join(",")}
  type="file"
  name="images"
  id="images"
  class="hidden"
  multiple
/>

<input
  onchange={fileInputChange}
  bind:this={gifFileInput}
  accept="image/gif"
  type="file"
  name="gif"
  id="gif"
  class="hidden"
  multiple={false}
/>
