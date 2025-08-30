import { parseBlob } from "music-metadata";
import MusicTempo from "music-tempo";

// TODO: fix music-tempo
export async function extractBPM(audioCtx: AudioContext, track: File) {
  let bpm: number;

  const obj = await import("bpm-detective");
  const detect = obj.default;

  const buffer = await track.arrayBuffer();
  const data = await audioCtx.decodeAudioData(buffer);

  try {
    const channelData = data.getChannelData(0);
    const audioData = Array.from(channelData);
    const hopSize = data.sampleRate / 100;

    const mt = new MusicTempo(audioData, { hopSize});
    const tempo = Math.round(mt.tempo);
    console.log(`music-tempo: ${tempo}`);

    bpm = tempo;
  } catch (error) {
    console.warn("music-tempo failed:", error);
    const detective = detect(data);
    console.log(`detective: ${detective}`);
    bpm = detective;
  }

  return bpm;
}

export async function extractCoverImage(track: File) {
  const parsed = await parseBlob(track);
  if (parsed.common.picture && parsed.common.picture.length > 0) {
    const picture = parsed.common.picture[0];
    const blob = new Blob([picture.data], { type: picture.format });
    return URL.createObjectURL(blob);
  } else {
    console.log("no cover art found for track");
    return null;
  }
}
