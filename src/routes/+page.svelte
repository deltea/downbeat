<script lang="ts">
  import FilePicker from "$components/FilePicker.svelte";

  function handleUpload(file: File) {
    console.log("file uploaded:", file.name);
  }
</script>

<main class="p-6 space-y-10">
  <div class="flex gap-2 items-center">
    <img src="/logo.svg" alt="logo" class="w-10 aspect-square">

    <div>
      <h1 class="font-bold">downbeat</h1>
      <p class="text-faded">the ultimate edit creator</p>
    </div>
  </div>

  <div class="w-[40rem]">
    <FilePicker upload={handleUpload} />
  </div>
</main>
