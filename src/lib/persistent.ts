import { browser } from "$app/environment";
import { writable } from "svelte/store";

export function persistent<T>(key: string, init: T) {
  const store = writable(init);

  if (browser) {
    const stored = localStorage.getItem(key);
    if (stored) store.set(JSON.parse(stored));

    store.subscribe(value => {
      localStorage.setItem(key, JSON.stringify(value));
    });
  }

  return store;
}
