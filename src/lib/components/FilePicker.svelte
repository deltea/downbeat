<script lang="ts">
  const VALID_FILE_TYPES = ["video/mp4", "video/quicktime", "video/webm"];

  let { upload } = $props();
  let fileInput: HTMLInputElement;
  let previewSrc: string | null = $state(null);
  let videoName: string | null = $state(null);
  let isLoadingPreview = $state(false);

  function fileInputChange(e: Event) {
    const target = e.target as HTMLInputElement;
    const files = target.files;

    if (files && files.length > 0) {
      const file = files[0];
      if (VALID_FILE_TYPES.includes(file.type)) {
        videoName = file.name;
        setPreview(file);
        upload(file)
      } else {
        console.error("invalid file type");
      }
    } else {
      console.error("no file selected");
    }
  }

  function onDrop(e: DragEvent) {
    e.preventDefault();
    const files = e.dataTransfer?.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (VALID_FILE_TYPES.includes(file.type)) {
        videoName = file.name;
        setPreview(file);
        upload(file);
      } else {
        console.error("invalid file type");
      }
    } else {
      console.error("no file dropped");
    }
  }

  function setPreview(file: File) {
    isLoadingPreview = true;

    const url = URL.createObjectURL(file);
    const video = document.createElement("video");

    video.src = url;
    video.crossOrigin = "anonymous";
    video.preload = "metadata";
    video.muted = true;

    video.onloadeddata = () => {
      video.currentTime = Math.random() * video.duration;
    };

    video.onseeked = () => {
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");
      ctx?.drawImage(video, 0, 0, canvas.width, canvas.height);

      previewSrc = canvas.toDataURL("image/png");
      URL.revokeObjectURL(url);

      isLoadingPreview = false;
    };
  }
</script>

<div class="flex flex-col gap-6 items-center w-full">
  <button
    onclick={() => fileInput.click()}
    ondrop={onDrop}
    ondragover={e => e.preventDefault()}
    class="border-2 border-dark aspect-video border-dashed flex justify-center items-center text-faded rounded-sm w-full cursor-pointer p-6 outline-none"
  >
    {#if isLoadingPreview}
      <p>loading...</p>
    {:else if previewSrc}
      <div class="bg-cover size-full bg-center" style:background-image="url('{previewSrc}')"></div>
    {:else}
      <p>drop your video file here!</p>
    {/if}
  </button>

  {#if videoName}
    <p>{videoName}</p>
  {/if}
</div>

<input
  onchange={fileInputChange}
  bind:this={fileInput}
  accept={VALID_FILE_TYPES.join(",")}
  type="file"
  name="video"
  id="video"
  class="hidden"
  multiple={false}
/>
