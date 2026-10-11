# Lesson 13: Generate a terrain grid

Prerequisite: [12: Textures](12-textures.md). Goal: generate an indexed flat ground mesh from a few parameters.

## Geometry becomes an algorithm

Procedural generation means using a procedure to create data. A grid needs a count of cells and a physical size, rather than a hand-written vertex list. Each cell is a square made of two triangles. Adjacent cells share vertices.

Use an XZ ground plane, with Y pointing upward. Keep the 48-byte vertex layout from the cube: position xyz, color rgba, normal xyz, UV xy. This lets the existing shader, lighting, texture, and buffers process the generated mesh.

## 1. Define the generator

Create `src/terrain.js` and export `createTerrainData({ cells, size, originX = 0, originZ = 0 })`. It should return `{ vertices, indices }` as `Float32Array` and `Uint32Array`.

Use normal JavaScript arrays while assembling data and convert at the end. Here is the loop scaffold; filling the formulas is the exercise:

```js
const vertices = [];
const indices = [];
const rowLength = cells + 1;
const spacing = size / cells;

for (let row = 0; row <= cells; row++) {
  for (let column = 0; column <= cells; column++) {
    // TODO: calculate world x and z.
    // TODO: push one complete 12-float vertex.
  }
}

for (let row = 0; row < cells; row++) {
  for (let column = 0; column < cells; column++) {
    // TODO: identify this cell's four corner indices.
    // TODO: append its two triangles.
  }
}
```

For each vertex use x = `originX + column * spacing`, z = `originZ + row * spacing`, and y = 0. Supply white `(1,1,1,1)`, normal `(0,1,0)`, and UV `(x/4,z/4)`. Set the texture sampler's U and V address modes to `"repeat"`; these world-based UVs intentionally exceed 1.

For a cell, let `a = row * rowLength + column`, `b = a + 1`, `c = a + rowLength`, `d = c + 1`. Use triangles **a,c,b** and **b,c,d**. Their winding faces upward for this XZ convention. This is the same reuse pattern as the rectangle, applied repeatedly.

## 2. Connect the generated mesh

Begin with `cells: 2`, `size: 4`, and origins -2,-2. Expect 9 vertices and 24 indices. Upload the generated arrays to vertex/index buffers. Select index format `"uint32"`, since this generator returns `Uint32Array`, and draw `indices.length`.

Replace the cube draw with the terrain draw. Use identity model and normal matrices. MVP is projection times view; the vertices already include their world position. Place the camera around `(4,5,6)` and aim toward the origin for the initial inspection. Keep the existing camera controls afterward.

Increase to `cells: 32`, `size: 32`, origins -16,-16. Expect 1089 vertices and 6144 indices. The camera may need to move up and back; start with a far plane of 200.

## Check and experiment

The ground should be a continuous lit checker grid. Cells change mesh density; size changes physical extent. Doubling cells while keeping size fixed should not double the ground's width.

Check array length equals `(cells + 1) ** 2 * 12`, index length equals `cells ** 2 * 6`, and every index is less than the vertex count. Use a positive integer for cells and a positive finite size. If there are diagonal gaps, check the cell indexing and winding before increasing resolution.

Explain: why are there cells+1 vertices across an edge? Why use world coordinates for UVs? Why does the buffer's stride stay 48 bytes regardless of grid resolution?

Reference: [Indexed drawing](https://developer.mozilla.org/en-US/docs/Web/API/GPURenderPassEncoder/drawIndexed).

Next: [14: Terrain heights](14-terrain-heights.md).
