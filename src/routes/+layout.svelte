<script lang="ts">
  import "iconify-icon";
	import "../app.css";
  import { Toaster } from "svelte-french-toast";

	let { children } = $props();
</script>

<svelte:head>
  <title>downbeat</title>
</svelte:head>

<main class="h-screen flex flex-col items-center">
  {@render children()}
</main>

<Toaster position="bottom-center" />
