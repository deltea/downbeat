export function loop(value: number, min: number, max: number) {
  const range = max - min;
  return ((value - min) % range + range) % range + min;
}
