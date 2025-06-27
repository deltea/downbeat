<script lang="ts">
  import "iconify-icon";
	import "../app.css";

  import Nav from "$components/Nav.svelte";

	let { children } = $props();
</script>

<svelte:head>
  <title>downbeat</title>
</svelte:head>

<div class="min-h-screen flex flex-col items-center">
  <main class="w-1/3 flex justify-center items-center grow">
    {@render children()}
  </main>
</div>

