import type { ParsedFrame } from "gifuct-js";

export interface Config {
  images: string[] | ParsedFrame[]
}

export type Mode = "gif" | "slideshow";
