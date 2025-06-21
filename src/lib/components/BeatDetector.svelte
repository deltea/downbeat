<script lang="ts">
  import { browser } from "$app/environment";
  import { muted } from "$lib/stores";
  import MusicTempo from "music-tempo";
  import { onMount } from "svelte";

  let audio: HTMLAudioElement;
  let audioCtx: AudioContext;
  let source: MediaElementAudioSourceNode;

  let bpm = $state(0);

  let { src, beat }: { src: string, beat: () => void } = $props();

  async function startAudioAnalysis() {
    if (!browser) return;

    const obj = await import("bpm-detective");
    const detect = obj.default;

    const response = await fetch(src);
    const buffer = await response.arrayBuffer();

    const data: AudioBuffer = await new Promise((resolve, reject) => {
      audioCtx.decodeAudioData(buffer, resolve, reject);
    });

    const detective = detect(data);

    const channelData = data.getChannelData(0);
    const audioData = Array.from(channelData);

    const mt = new MusicTempo(audioData);
    const tempo = Math.round(mt.tempo);

    console.log(`detective: ${detective}`);
    console.log(`music-tempo: ${tempo}`);

    bpm = tempo;
    setInterval(beat, 60 / bpm * 1000);
  }

  onMount(() => {
    audioCtx = new AudioContext();
    source = audioCtx.createMediaElementSource(audio);
    source.connect(audioCtx.destination);
  });

</script>

<audio bind:this={audio} loop autoplay muted onplay={startAudioAnalysis} {src}></audio>
