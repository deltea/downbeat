<script lang="ts">
  import "iconify-icon";
	import "../app.css";

	let { children } = $props();
</script>

<svelte:head>
  <title>downbeat</title>
</svelte:head>

<div class="h-screen flex flex-col items-center">
  <main class="w2/3 w-full px-32 flex grow h-full mb-nav">
    {@render children()}
  </main>
</div>

