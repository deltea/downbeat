<script lang="ts">
  import "iconify-icon";
	import "../app.css";

  import Nav from "$components/Nav.svelte";

	let { children } = $props();
</script>

<svelte:head>
  <title>downbeat</title>
</svelte:head>

<main class="flex items-center h-screen">
  <Nav />

  <div class="grow h-full flex flex-col justify-center items-center">
    {@render children()}
  </div>
</main>

