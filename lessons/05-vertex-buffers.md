# Exercise 05: Geometry from JavaScript

Goal: draw the same colored rectangle, but supply its positions and colors from JavaScript instead of defining arrays inside WGSL.

## Why do this?

Right now, changing your rectangle means editing a shader program. A renderer needs to draw many objects using the same program, with different geometry data. Separating data from the shader makes that possible.

A **buffer** is a block of memory accessible to the GPU. A **vertex buffer** is a buffer used to supply values for vertices. You will put numbers into it and tell the pipeline how to read them. This is part of what Three.js manages for you when you use geometry attributes.

The new data path is:

```text
JavaScript numbers -> upload to a GPU buffer
                              |
                     pipeline reads each vertex
                              |
                     vertex shader receives position and color
                              |
                     your existing interpolation and fragment shader
```

Start with Part 1 and ask for a review whenever useful. The full rectangle will work with the new data path once all parts are connected. We will introduce index buffers in a separate lesson.

## Part 1: Organize the numbers

After configuring the canvas, before the shader string, create a JavaScript `Float32Array` named `vertexData`. This is a typed array: every entry stores a 32-bit floating-point number, taking **4 bytes**. A byte is a unit of memory size.

Use six numbers per vertex, in this order:

```text
x, y, red, green, blue, alpha
```

Start the array like this, then fill in the remaining five rows from your existing WGSL arrays:

```js
const vertexData = new Float32Array([
  // x,    y,   r, g, b, a
  -0.6,  0.6,   1, 0, 0, 1, // Vertex 0: top left, red
  // TODO: vertices 1 through 5, six numbers each.
]);
```

This is one flat array. Line breaks just help you read it. A row contains the position AND color of one vertex. Preserve your six-vertex order and the matching colors at duplicated corners.

Check your data: `vertexData.length` should be **36 numbers**, and `vertexData.byteLength` should be **144 bytes**. You can log both before proceeding.

## Part 2: Allocate memory and upload

Create a buffer with `device.createBuffer(...)`, providing these properties:

| Property | Value | Purpose |
| --- | --- | --- |
| `size` | `vertexData.byteLength` | Reserve enough bytes for your data |
| `usage` | `GPUBufferUsage.VERTEX \| GPUBufferUsage.COPY_DST` | Allow vertex input and receiving uploaded data |

The `|` operator combines these two allowed uses. Store the result as `vertexBuffer`.

Creating the buffer allocates space; you still need to supply your numbers. Call `device.queue.writeBuffer(...)` with three arguments, in order: your buffer, destination byte offset `0`, and your `vertexData`.

Do this before recording your render pass. The upload does not require `await`. Changing `vertexData` later does not automatically change the GPU buffer; you would need another upload.

References: [Creating a buffer](https://developer.mozilla.org/en-US/docs/Web/API/GPUDevice/createBuffer) and [uploading data](https://developer.mozilla.org/en-US/docs/Web/API/GPUQueue/writeBuffer).

## Part 3: Describe the data layout

The GPU needs instructions for interpreting your flat list of numbers. A per-vertex value such as position or color is called an **attribute**.

Inside the pipeline descriptor's existing `vertex` object, add a `buffers` array with one layout object. This object needs:

- `arrayStride: 24`: each vertex occupies 6 numbers times 4 bytes. The next vertex starts 24 bytes after the previous one.
- `stepMode: "vertex"`: advance to the next set of values for each vertex.
- `attributes`: an array with two objects, as described below.

| Attribute | `shaderLocation` | `offset` in bytes | `format` |
| --- | --- | --- | --- |
| Position | `0` | `0` | `"float32x2"` |
| Color | `1` | `8` | `"float32x4"` |

Position starts at the beginning of each vertex's data. Color starts after x and y: 2 numbers times 4 bytes = 8 bytes. The formats describe reading two or four 32-bit floating-point values.

Reference: [Vertex buffer layouts](https://webgpufundamentals.org/webgpu/lessons/webgpu-vertex-buffers.html). The reference covers more than this exercise; you can stay focused on the layout explanation.

## Part 4: Receive the attributes in WGSL

Replace the vertex shader's `index` parameter with these inputs:

```wgsl
@vertex
fn vertexMain(
  @location(0) point: vec2f,
  @location(1) color: vec4f
) -> VertexOutput {
  // Keep your output struct construction and return here.
}
```

The pipeline's `shaderLocation` values match these vertex INPUT locations. WebGPU reads the buffer and supplies `point` and `color` for each vertex.

Remove the old WGSL position and color arrays, along with the two lines selecting values using `index`. Your existing `output.position` and `output.color` assignments can now use the input parameters directly.

Keep `VertexOutput` and the fragment shader as they are. Location numbers are local to each interface: the color enters your vertex shader at input location 1, then your code assigns it to the struct field at output location 0. That output still matches your fragment input at location 0.

## Part 5: Select the buffer for the draw

After `pass.setPipeline(...)` and before `pass.draw(6)`, call `pass.setVertexBuffer(...)`. Its first argument is `0`, selecting the first entry in the pipeline's `vertex.buffers` array. Its second argument is your GPU buffer.

This buffer slot is different from a shader location: your one buffer supplies BOTH attributes, at shader input locations 0 and 1.

Reference: [Selecting a vertex buffer](https://developer.mozilla.org/en-US/docs/Web/API/GPURenderPassEncoder/setVertexBuffer).

## Check and experiment

The rectangle should look the same, with no shader or validation errors in the browser console. Update the page status to describe submitting a rectangle from a vertex buffer. A successful Vite build only checks bundling.

Then change the red color of the two top-left vertices to yellow in your JavaScript data. Save and reload so the upload runs again. The rectangle should update without any changes to WGSL. Restore red afterward.

Before moving on:

- What is the difference between `vertexData` and `vertexBuffer`?
- Why is the stride 24 bytes and the color offset 8 bytes?
- What connects `shaderLocation: 1` to the vertex shader's color input?
- Why does `setVertexBuffer(0, ...)` supply both position and color?
