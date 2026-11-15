# Lesson 15b: Put objects in the world

Prerequisite: [15: Terrain normals](15-terrain-normals.md). Goal: stand a few dozen pillars on the hills, each with its own position, rotation, and size.

So far the world is one mesh with an identity model matrix. Real worlds are full of separate objects: trees, rocks, houses, the player. Each one has its own model matrix, the `T * R * S` from lesson 08. This lesson is about getting a different matrix into each draw. Three.js does this for you whenever it renders a `Mesh`.

## 1. Try the tempting approach first

Bring back the cube from lesson 09. Create cube vertex and index buffers from `createCubeData()` alongside the terrain buffers. Both use the 48-byte vertex layout, so the existing pipeline draws both. Cube indices are `Uint16Array` and terrain indices are `Uint32Array`, so pass `"uint16"` or `"uint32"` to `setIndexBuffer` to match each draw.

Plan two cubes at x = -4 and x = +4, both at z = 0. The cube's corners are at -1 and +1, so its origin is its center. Translate each one to `(x, heightAt(x, 0) + 1, 0)` so it rests on the ground.

**Experiment:** keep the single scene uniform buffer. In the render pass, draw the terrain. Then, for each cube, `writeBuffer` its MVP and normal matrix into that same buffer and draw it. Predict what you will see before saving.

You should see just one cube, and the terrain has moved along with it. Here is why: `writeBuffer` does not run "between" draws. The pass only **records** commands; the GPU runs them after `submit`, and every `writeBuffer` you called happens before that. A recorded draw means "read whatever this buffer holds when you run", not "use these numbers". By the time any draw runs, the buffer holds the last values written, so every draw uses them.

## 2. Give each object its own buffer

Each object gets its own 128-byte uniform buffer and its own bind group. That bind group has the same three entries as the terrain's: binding 0 is the object's buffer, and bindings 1 and 2 are the shared sampler and texture. The terrain keeps its own buffer and bind group.

Use this shape for an object record:

```js
{
  model,         // T * R * S, computed once
  uniformBuffer, // 128 bytes: MVP at byte 0, normal matrix at byte 64
  bindGroup,
}
```

The normal matrix `mat4.transpose(mat4.inverse(model))` depends only on the model matrix. Upload it **once** when the object is created, at byte offset 64. Each frame, after computing `projection * view`:

1. Upload the terrain's MVP as before.
2. For each object, upload `projection * view * model` to byte 0 of that object's buffer.

When drawing, set the pipeline once and draw the terrain. Then bind the cube's vertex and index buffers once. For each object, call `setBindGroup(0, object.bindGroup)` and `drawIndexed(36)`. Each draw now reads a different buffer, so each one sees its own matrix.

## 3. Scatter them over the hills

Replace the two test cubes with a field of pillars. Put candidate spots on a grid every 6 world units, using integer indices `i` and `j` from -5 to +5. That gives 121 spots, all inside the 64-unit terrain.

Each spot needs a few random-looking choices that come out **the same on every reload**. The supplied noise helps here. At whole-number inputs, `valueNoise2D(i, j, seed)` returns its hashed corner value directly, which acts as a repeatable random number between -1 and 1. Use a different seed for each decision:

| Decision | Seed | Use |
| --- | --- | --- |
| Keep this spot? | 5000 | Keep it if the value is above 0.3 (roughly a third of spots) |
| Jitter x and z | 5001, 5002 | Add `value * 2.5` to `i * 6` and `j * 6` |
| Yaw | 5003 | `value * Math.PI`, used with `mat4.rotationY` |
| Height | 5004 | Map to a y scale between 1 and 3 |

Use a scale of `(0.5, height, 0.5)` for a tall pillar. Because the cube spans -1 to +1, the pillar's half height equals its y scale. Translate it to `(x, heightAt(x, z) + height, z)` so its base meets the ground.

Avoid `Math.random()` here. With the noise, the same seed always produces the same world. That matters in lesson 17, where terrain is unloaded and must come back identical.

## Check and troubleshoot

You should see roughly 40 pillars standing on the hills, each with its own height and rotation. On steep slopes one side floats or sinks a little, because a flat-bottomed box sits on a curved surface. Reload: the layout repeats. Change the seeds: a different layout appears. Fly around: the pillars stay put and are lit by the same light as the hills. The checker looks stretched on tall faces because cube UVs span each face once, whatever its scale.

Display the draw call count: 1 for the terrain plus 1 per object.

If objects are missing, check that each bind group has all three entries and that the cube uses `"uint16"` with 36 indices. If every object shares one transform, look for a buffer or bind group shared between objects. If pillars float high above the ground, check that their y uses `heightAt` at the jittered x and z.

Explain: why did one shared buffer make every draw use the last matrix? What is uploaded once per object, and what once per frame? Why use noise at integer inputs instead of `Math.random()`?

One draw per object is fine for dozens or a few hundred objects. A forest of thousands uses **instancing**: one draw call that reads many model matrices from one buffer. That is a later topic.

Reference: [WebGPU uniforms](https://webgpufundamentals.org/webgpu/lessons/webgpu-uniforms.html). Its second half draws 100 objects, each with its own uniform buffer and bind group.

Next: [16: Chunks](16-terrain-chunks.md).
