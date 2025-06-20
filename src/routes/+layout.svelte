<script lang="ts">
  import "iconify-icon";
	import "../app.css";

  import Nav from "$components/Nav.svelte";

	let { children } = $props();
</script>

<svelte:head>
  <title>downbeat</title>
</svelte:head>

<div class="min-h-screen flex flex-col items-center py-nav">
  <Nav />

  <main class="flex justify-center items-center w-1/2 grow">
    {@render children()}
  </main>
</div>

