<script lang="ts">
  const validFileTypes = ["audio/mpeg"];

  function onDrop(e: DragEvent) {
    onDragEnd(e);

    let file: File | null = null;
    if (e.dataTransfer?.items) {
      const item = e.dataTransfer.items[0];
      if (item.kind === "file") {
        file = item.getAsFile();
      }
    } else {
      file = e.dataTransfer?.files[0] ?? null;
    }

    if (file && validFileTypes.includes(file.type)) {
      console.log(file.name);

      const img = new Image();
      img.src = URL.createObjectURL(file);
    }
  }

  function onDragOver(e: DragEvent) {
    const dropZone = document.getElementById("dropZone");
    if (dropZone) dropZone.style.opacity = "100";
  }

  function onDragEnd(e: DragEvent) {
    const dropZone = document.getElementById("dropZone");
    if (dropZone) dropZone.style.opacity = "0";
  }
</script>

<main class="p-6">
  <h1 class="font-bold">downbeat</h1>
  <p class="text-faded">the ultimate edit maker</p>

  <div
    class="mt-4 border-4 border-dark h-48 border-dashed flex justify-center items-center text-faded"
    role="none"
    on:drop|preventDefault={onDrop}
    on:dragover|preventDefault={onDragOver}
    on:dragleave|preventDefault={onDragEnd}
  >
    drop your mp3 file here!
  </div>
</main>
