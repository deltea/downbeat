<script lang="ts">
  const VALID_FILE_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"];

  let { upload }: { upload: (files: File[]) => void } = $props();
  let fileInput: HTMLInputElement;
  let images = $state<File[]>([]);

  function fileInputChange(e: Event) {
    const target = e.target as HTMLInputElement;
    const files = target.files;

    if (files && files.length > 0) {
      const filtered = Array.from(files).filter(file => VALID_FILE_TYPES.includes(file.type));
      if (filtered.length > 0) {
        images = [...filtered, ...images];
        upload(filtered);
      }
    } else {
      console.error("no file selected");
    }
  }

  function onDrop(e: DragEvent) {
    e.preventDefault();
    const files = e.dataTransfer?.files;
    if (files && files.length > 0) {
      const filtered = Array.from(files).filter(file => VALID_FILE_TYPES.includes(file.type));
      if (filtered.length > 0) {
        images = [...filtered, ...images];
        upload(filtered);
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
  class="dashed flex justify-center items-center text-faded rounded-sm cursor-pointer outline-none"
>
  {#if images.length > 0}
    <div class="grid grid-flow-col p-5 gap-5 rounded-sm max-w-[52rem] overflow-x-auto">
      {#each images as image, i}
        <div class="w-full flex flex-col gap-2">
          <div
            class="h-32 aspect-square rounded-sm bg-bg-0 bg-cover bg-center"
            style:background-image="url('{URL.createObjectURL(image)}')"
          ></div>
          <p class="text-sm text-center text-faded">{i + 1}</p>
        </div>
      {/each}
    </div>
  {:else}
    <p class="px-10 py-24">drop or select your image files here!</p>
  {/if}
</button>

<input
  onchange={fileInputChange}
  bind:this={fileInput}
  accept={VALID_FILE_TYPES.join(",")}
  type="file"
  name="images"
  id="images"
  class="hidden"
  multiple
/>
