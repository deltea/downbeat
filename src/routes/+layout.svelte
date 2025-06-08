<script lang="ts">
  import "iconify-icon";
	import "../app.css";

	let { children } = $props();
</script>

<svelte:head>
  <title>downbeat</title>
</svelte:head>

{@render children()}
