import type { Output } from "mediabunny";

export interface OutputItem {
  gifSrc: string;
  gifName: string;
  audioName: string;
  outputUrl: string | null;
  output: Output;
  progress: number;
}
