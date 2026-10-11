# Lesson 16: Split terrain into chunks

Prerequisite: [15: Normals](15-terrain-normals.md). Goal: draw nine adjoining terrain pieces without visible gaps.

## One world, several meshes

A **chunk** is a manageable region of the world. It has coordinates, geometry, and GPU buffers. Splitting a world into chunks lets us load and unload parts independently.

Use a chunk width of 16 world units and 16 cells per edge initially. Chunk coordinates `(cx,cz)` are integers. Its origin is `(cx * 16, cz * 16)`. Each chunk generates world positions from that origin using the grid function you wrote.

A neighboring chunk shares edge positions but stores its own edge vertices. Unlike sharing indices within one mesh, separate GPU buffers cannot reuse each other's vertex indices in our drawing setup.

## Your chunk record

Use this shape for a chunk object; populate it in a `createChunk(cx, cz)` function:

```js
{
  cx, cz,
  vertexBuffer,
  indexBuffer,
  indexCount,
  vertexBytes,
  indexBytes,
}
```

Generation should call your terrain-data function with `cells: 16`, `size: 16`, and the world origins above. It must evaluate the shared `heightAt` and `normalAt` using world coordinates, and use global x/4,z/4 UVs. Upload separate buffers for each chunk. Retain their byte lengths for later diagnostics; you may discard the CPU arrays after upload if you no longer need them.

Keep index format `"uint32"` consistently. A 16-cell chunk should have 289 vertices and 1536 indices.

## Draw a 3-by-3 area

1. Create chunks for cx and cz from -1 through +1 and store them in a `Map` keyed by a string such as `"-1,0"`.
2. Use one render pass per frame, clearing color and depth once. Set the common pipeline and scene/material bind group once.
3. Loop through the chunk records. For each, bind its vertex buffer and index buffer, then call `drawIndexed(chunk.indexCount)`.
4. End and submit after the loop.

Vertices are already in world coordinates, so all chunks use an identity model matrix. Upload the same projection-view matrix and identity normal matrix once per frame. Do not translate chunks again in the shader or rewrite one shared uniform repeatedly inside the draw loop: that is unnecessary here and can make every draw see the final uploaded value.

## Check the seams

Fly over the boundaries x = 0 and z = 0. Adjacent meshes should meet in position, lighting, and texture pattern. For a shared edge, compare both generators' position and normal arrays; values should match within floating-point tolerance.

If positions crack, check world origins and inclusive edge loops. If lighting changes abruptly, check global normal sampling. If the checker resets per chunk, switch UVs back to global world coordinates.

Add a simple text counter for chunk count and total triangles. With nine equal chunks, expect 9 chunks and 4608 triangles. This count describes submitted geometry, not necessarily visible pixels.

Explain: why do chunks duplicate edge vertices even though we learned index reuse? Why clear only once? What should happen if all chunks accidentally use a local origin of zero?

Next: [17: Load around the camera](17-chunk-streaming.md).
