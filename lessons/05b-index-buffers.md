# Exercise 05b: Reuse vertices with an index buffer

Goal: draw your rectangle using four stored vertices and six indices.

Your current rectangle repeats two complete vertices. An **index buffer** lets triangles refer to existing vertices by number. This is useful for larger meshes, including terrain grids where neighboring triangles share corners.

Think of the vertex buffer as a numbered list of corners. The index buffer is a list saying which corners each triangle uses:

```text
0 -------- 3
| \        |
|   \      |
|     \    |
1 -------- 2

Triangle A: 0, 1, 2
Triangle B: 2, 3, 0
```

Each index selects a whole vertex: its position AND color. It is not a byte offset or an index into the individual floats.

## Part 1: Use these data arrays

Replace your existing `vertexData` declaration with this supplied data. Keep its buffer creation and upload code.

```js
const vertexData = new Float32Array([
  // x,    y,   r, g, b, a
  -0.6,  0.6,   1, 0, 0, 1, // 0: top left, red
  -0.6, -0.6,   0, 1, 0, 1, // 1: bottom left, green
   0.6, -0.6,   0, 0, 1, 1, // 2: bottom right, blue
   0.6,  0.6,   1, 1, 1, 1, // 3: top right, white
]);

const indexData = new Uint16Array([
  0, 1, 2, // First triangle
  2, 3, 0, // Second triangle
]);
```

`Uint16Array` stores unsigned 16-bit integers: non-negative whole numbers, using **2 bytes each**. These values are vertex numbers, so they do not need decimal fractions.

Your vertex data now occupies 4 vertices times 24 bytes = **96 bytes**. Your indices occupy 6 entries times 2 bytes = **12 bytes**. Together, that is 108 bytes of data instead of the previous 144. These are data sizes, not a claim about the driver's physical allocation size.

The vertex stride stays **24 bytes** because each vertex still has the same six floats. Fewer vertices changes the total size, not the size of one vertex.

Finish the following steps before checking the picture: the existing `draw(6)` expects six sequential vertices, but this new vertex array only has four.

## Part 2: Create and upload the index buffer

Use the pattern you learned for the vertex buffer to create a separate `indexBuffer`:

- Use `indexData.byteLength` for its size.
- Combine `GPUBufferUsage.INDEX` and `GPUBufferUsage.COPY_DST` for its usage.
- Upload `indexData` to it using `device.queue.writeBuffer(...)`, starting at byte offset 0.

Place this setup before recording the render pass. The existing vertex buffer supplies the vertex values; this new buffer supplies the order in which to use them.

## Part 3: Draw using indices

Keep your pipeline, shaders, vertex layout, and `pass.setVertexBuffer(0, vertexBuffer)`.

Before the draw, call `pass.setIndexBuffer(...)`. Pass your index buffer as the first argument and `"uint16"` as the second, matching your `Uint16Array`. This method does not take a numbered buffer slot; you select one current index buffer for the pass.

Replace `pass.draw(6)` with a call to `pass.drawIndexed(...)`. Supply `indexData.length` as the index count. That count is **6**, even though there are only **4 unique vertices**. With triangle-list topology, each group of three indices forms a triangle.

Update the status text to describe submitting an indexed rectangle. End and submit the pass as usual.

References: [Selecting the index buffer](https://developer.mozilla.org/en-US/docs/Web/API/GPURenderPassEncoder/setIndexBuffer) and [drawing with indices](https://developer.mozilla.org/en-US/docs/Web/API/GPURenderPassEncoder/drawIndexed).

## Check and experiment

You should see the same colored rectangle, with no validation errors in the browser console. You changed how its triangles reference their vertices.

Try these, predicting each result first:

1. Change only `drawIndexed`'s count to 3. Which triangle remains? Restore the count afterward.
2. Move the top-left vertex's x coordinate from -0.6 to -0.3. Save and reload so the upload runs again. Both triangles should follow that corner even though you changed only one vertex. Restore -0.6 afterward.

A shared vertex also shares its color. If two triangles need different colors at the same position, they need separate vertex entries for that corner. Matching positions alone do not make the complete vertices identical.

Before moving on:

- What does the number 2 in `indexData` refer to?
- Why does this rectangle have four vertices but six indices?
- Why does the stride remain 24 bytes?
- What would you change if the triangles needed different colors at their shared corner?
