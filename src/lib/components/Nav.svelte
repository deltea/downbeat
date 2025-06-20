<script lang="ts">
  import Logo from "./Logo.svelte";
</script>

<nav class="fixed flex items-center justify-between w-full h-nav bottom-0 left-0 pl-6 pr-10">
  <Logo />

  <div class="flex items-center gap-10">
    <a href="https://github.com/deltea/downbeat" target="_blank" class="hover:cursor-pointer hover:scale-110 active:scale-100 duration-100 group" aria-label="settings">
      <iconify-icon icon="mingcute:github-fill" class="text-3xl"></iconify-icon>
    </a>

    <a href="/settings" class="hover:cursor-pointer hover:scale-110 active:scale-100 duration-100 group" aria-label="settings">
      <iconify-icon icon="mingcute:settings-3-fill" class="text-3xl group-hover:rotate-30 duration-100"></iconify-icon>
    </a>
  </div>
</nav>
