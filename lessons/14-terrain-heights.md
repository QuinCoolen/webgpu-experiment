# Lesson 14: Hills from functions and noise

Prerequisite: [13: Grid](13-terrain-grid.md). Goal: turn the flat grid into a deterministic landscape.

## A height for every world location

Define `heightAt(x, z)` as the terrain's elevation at world coordinates x,z. A height field gives one height per horizontal location, so it can make hills and valleys but not overhangs or caves.

First try this supplied function:

```js
export function heightAt(x, z) {
  return Math.sin(x * 0.2) * 2 + Math.cos(z * 0.15);
}
```

Call it when generating each vertex's Y coordinate. Rebuild and upload the mesh after changing the height function. Changing the function alone does not update an existing buffer.

This separates **amplitude** (height, controlled by the outer multiplier) from **frequency** (how quickly height changes across distance, controlled by the multiplier of x or z). Double one at a time and inspect the difference.

## Make less regular hills

Noise is a repeatable function that varies smoothly across space. Import the supplied value-noise helper from your terrain module:

```js
import { valueNoise2D } from '../lessons/support/noise.js';
```

`valueNoise2D(x, z, seed)` returns a number between -1 and 1. A fixed integer seed makes a repeatable world. This helper hashes integer grid corners and interpolates them; it is simple value noise, not Perlin noise. Treat it as supplied setup for now.

Your task is to implement a height function combining these layers:

| Layer | Input frequency | Height amplitude | Seed |
| --- | --- | --- | --- |
| Broad hills | 0.035 | 3 | 1234 |
| Medium detail | 0.07 | 1.5 | 1235 |
| Small detail | 0.14 | 0.75 | 1236 |

For each row, sample noise at `(x * frequency, z * frequency, seed)`, multiply by amplitude, and sum the three results. Such layers are often called octaves. The sum is bounded by **-5.25 to +5.25**, which will help define chunk bounds later.

Use exactly the same global height function everywhere. Do not call `Math.random()` per vertex or reset noise coordinates for each piece of land. A location must give the same height whenever it is generated.

## Inspect the landscape

Use a 64-cell grid spanning 64 world units, with origins -32,-32. From an elevated camera, you should see connected hills. Fly closer to see the triangles. Fine details cannot be represented if vertex spacing is too large; simply adding high-frequency noise does not add geometry.

The normals are still `(0,1,0)`, so lighting is not yet shaped by the slopes. That is expected and is the next lesson. Keep the checker or replace its color contribution with vertex color temporarily if it makes heights hard to inspect.

## Check and troubleshoot

Reload twice: the same seed must produce the same terrain. Change only the seed: the pattern changes, while the height range stays bounded. Verify values stay finite, including at negative coordinates and x or z equal to zero.

If the terrain is flat, check you actually use `heightAt` when writing Y and recreate/upload the buffer. If it looks like sharp spikes, check spacing and frequency rather than adding smoothing blindly. Keep the near plane at 0.1 and camera above the terrain for the initial view.

Explain: why is stable world-coordinate input important for chunks? How do amplitude and frequency differ? Why can't this representation produce a cave ceiling?

Next: [15: Terrain normals](15-terrain-normals.md).
