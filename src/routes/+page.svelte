<script lang="ts">
  import FilePicker from "$components/FilePicker.svelte";
  import Progress from "$components/Progress.svelte";

  function handleUpload(file: File) {
    console.log("file uploaded:", file.name);
  }
</script>

<div class="w-full grow flex flex-col justify-center items-center">
  <Progress currentStep={0} />
  <FilePicker upload={handleUpload} />
</div>
