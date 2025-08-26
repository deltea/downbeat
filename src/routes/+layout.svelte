<script lang="ts">
  import "iconify-icon";
	import "../app.css";

  import Nav from "$components/Nav.svelte";

	let { children } = $props();
</script>

<svelte:head>
  <title>downbeat</title>
</svelte:head>

<div class="h-screen flex flex-col items-center">
  <main class="w-2/3 flex grow h-full">
    {@render children()}
  </main>
</div>

