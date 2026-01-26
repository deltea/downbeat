<script lang="ts">
  import "iconify-icon";
	import "../app.css";
  import { Toaster } from "svelte-french-toast";

	let { children } = $props();
</script>

<svelte:head>
  <title>downbeat</title>
  <meta name="viewport" content="width=device-width, initial-scale=1" />
	<meta name="title" content="downbeat" />
	<meta name="description" content="sync gifs to the beat!" />
</svelte:head>

<main class="h-screen flex flex-col items-center">
  {@render children()}
</main>

<Toaster position="bottom-center" />
