import { browser } from "$app/environment";
import { persistent } from "./persistent";
import { availableThemes, themes } from "./themes";

export const muted = persistent("muted", false);
export const theme = persistent("theme", 0);

theme.subscribe(value => {
  if (!browser) return;

  const t = themes[availableThemes[value]];
  if (!t) return;

  document.body.style.setProperty("--color-bg", t.bg);
  document.body.style.setProperty("--color-surface", t.surface);
  document.body.style.setProperty("--color-surface-light", t.surfaceLight);
  document.body.style.setProperty("--color-surface-0", t.surface0);
  document.body.style.setProperty("--color-fg", t.fg);
  document.body.style.setProperty("--color-muted", t.muted);
  document.body.style.setProperty("--dashed-border-src", `url("data:image/svg+xml,%3csvg width='100%25' height='100%25' xmlns='http://www.w3.org/2000/svg'%3e%3crect width='100%25' height='100%25' fill='none' rx='4' ry='4' stroke='${encodeURIComponent(t.surface0)}' stroke-width='5' stroke-dasharray='10%2c 10' stroke-dashoffset='0' stroke-linecap='square'/%3e%3c/svg%3e")`);
});
