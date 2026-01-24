export function loop(value: number, min: number, max: number) {
  const range = max - min;
  return ((value - min) % range + range) % range + min;
}

export function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}
