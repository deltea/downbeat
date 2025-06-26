import type { ParsedFrame } from "gifuct-js";

export interface Config {
  bpm: number,
  audioSrc: string | null,
  images: string[] | ParsedFrame[]
}

export type Mode = "gif" | "slideshow";
