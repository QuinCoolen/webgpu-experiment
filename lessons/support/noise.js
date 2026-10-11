// Small deterministic value-noise fixture. Output is in [-1, 1].
// Coordinates are suitable for the bounded learning world; the integer hash
// repeats over a finite domain and is not an infinite-precision world system.
function latticeValue(x, z, seed) {
  let hash = Math.imul(x | 0, 0x1f123bb5) ^ Math.imul(z | 0, 0x5f356495) ^ (seed | 0);
  hash = Math.imul(hash ^ (hash >>> 16), 0x45d9f3b);
  hash = Math.imul(hash ^ (hash >>> 16), 0x45d9f3b);
  hash ^= hash >>> 16;
  return (hash >>> 0) / 0xffffffff * 2 - 1;
}

const smooth = (t) => t * t * (3 - 2 * t);
const mix = (a, b, t) => a + (b - a) * t;

export function valueNoise2D(x, z, seed = 1234) {
  if (!Number.isFinite(x) || !Number.isFinite(z)) throw new Error('Noise coordinates must be finite');
  const x0 = Math.floor(x);
  const z0 = Math.floor(z);
  const tx = smooth(x - x0);
  const tz = smooth(z - z0);
  const top = mix(latticeValue(x0, z0, seed), latticeValue(x0 + 1, z0, seed), tx);
  const bottom = mix(latticeValue(x0, z0 + 1, seed), latticeValue(x0 + 1, z0 + 1, seed), tx);
  return mix(top, bottom, tz);
}
