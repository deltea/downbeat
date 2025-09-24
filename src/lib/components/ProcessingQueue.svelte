<script lang="ts">
  import type { OutputItem } from "$lib/types";
  import { Popover } from "bits-ui";
  import { fly } from "svelte/transition";

  let { open = $bindable(), queue }: {
    open: boolean,
    queue: OutputItem[]
  } = $props();
</script>

<Popover.Root bind:open={open}>
  <Popover.Trigger class="fixed left-8 top-8 size-10 flex justify-center items-center rounded-full bg-surface-0 text-fg hover:scale-105 active:scale-100 duration-100 z-50 cursor-pointer">
    <iconify-icon icon="mingcute:download-2-fill" class="text-lg"></iconify-icon>
  </Popover.Trigger>

  <Popover.Portal>
    <Popover.Content
      forceMount
      sideOffset={10}
      collisionPadding={32}
      class="bg-surface-light rounded-lg w-[32rem] h-[30rem] drop-shadow-base flex flex-col overflow-scroll"
    >
      {#snippet child({ wrapperProps, props, open })}
        {#if open}
          <div {...wrapperProps}>
            <div {...props} transition:fly={{ y: -8, duration: 100 }}>
              <h3 class="text-muted font-bold py-3 px-4">PROCESSING QUEUE</h3>
              <ul class="flex flex-col gap-2 px-2 grow">
                {#if queue.length === 0}
                  <div class="h-full flex flex-col gap-4 justify-center items-center text-muted">
                    <iconify-icon icon="mingcute:sad-fill" class="text-5xl"></iconify-icon>
                    <p>no items in queue</p>
                  </div>
                {:else}
                  {#each queue as video}
                    <li class="p-2 flex gap-3 rounded-lg hover:bg-surface-0 duration-100 h-16 w-full">
                      {#if video.outputUrl}
                        <span class="h-full aspect-square bg-cover bg-center rounded-md" style:background-image="url('{video.gifSrc}')"></span>
                      {:else if video.output.state === "started"}
                        <span class="h-full aspect-square rounded-md bg-surface-0 flex justify-center items-center">
                          <iconify-icon icon="tdesign:loading" class="animate-spin text-base"></iconify-icon>
                        </span>
                      {/if}

                      <div class="flex flex-col grow justify-evenly min-w-0">
                        <p class="textsm overflow-hidden whitespace-nowrap overflow-ellipsis">
                          {video.gifName}<span class="text-muted">{" x "}</span>{video.audioName}
                        </p>

                        {#if video.outputUrl}
                          <p class="text-muted text-sm">finished</p>
                        {:else if video.output.state === "started"}
                          <div class="grow flex gap-2 items-center justifycenter">
                            <span class="text-sm text-muted">{video.progress}%</span>
                            <div class="grow bg-surface-0 rounded-md h-2">
                              <div class="bg-fg h-full rounded-md duration-100" style:width="{video.progress}%"></div>
                            </div>
                          </div>
                        {/if}
                      </div>

                      {#if video.outputUrl}
                        <!-- svelte-ignore a11y_consider_explicit_label -->
                        <a
                          download={`${video.gifName} x ${video.audioName}.mp4`}
                          href={video.outputUrl}
                          class="text-bg bg-fg flex justify-center items-center h-full aspect-square hover:scale-105 active:scale-100 duration-100 rounded-md cursor-pointer"
                        >
                          <iconify-icon icon="mingcute:download-2-fill" class="text-lg"></iconify-icon>
                        </a>
                      {/if}
                    </li>
                  {/each}
                {/if}
              </ul>
            </div>
          </div>
        {/if}
      {/snippet}
    </Popover.Content>
  </Popover.Portal>
</Popover.Root>
