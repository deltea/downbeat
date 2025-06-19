<script lang="ts">
  import FilePicker from "$components/FilePicker.svelte";
  import Progress from "$components/Progress.svelte";

  function handleUpload(file: File) {
    console.log("file uploaded:", file.name);
  }
</script>

<div class="flex flex-col items-center pt-10 size-full">
  <Progress currentStep={0} />

  <div class="w-[40rem] grow flex flex-col justify-center">
    <FilePicker upload={handleUpload} />
  </div>
</div>
