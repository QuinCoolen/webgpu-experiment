# Lesson 06: Move and resize with uniforms

Prerequisite: [05b: Index buffers](05b-index-buffers.md). Goal: move and resize the rectangle without rewriting its vertex data.

## What changes?

An attribute supplies a value per vertex. A **uniform** supplies a value shared by a draw: for example, every vertex receives the same movement offset. A **bind group** connects resources such as uniform buffers to the shader.

We will calculate `position * scale + offset` in the vertex shader. Multiplying changes size; adding moves the result. These are component-wise operations: x uses the x scale and offset, and y uses the y values.

## 1. Declare the shared data

Add this inside WGSL, before the functions:

```wgsl
struct Transform {
  offset: vec2f,
  scale: vec2f,
}
@group(0) @binding(0) var<uniform> transform: Transform;
```

This chooses resource group 0, binding 0. These numbers identify a resource connection; they are separate from vertex and fragment `@location` slots.

Our struct uses 16 bytes: two offset floats followed by two scale floats. Use this supplied JavaScript data:

```js
const transformData = new Float32Array([
  0, 0, // offset x, y
  1, 1, // scale x, y
]);
```

Allocate a 16-byte buffer using `GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST`, and upload the array using the same `writeBuffer` pattern as before. Keep the values 0, 0, 1, 1 initially so the rectangle starts unchanged. A newly allocated, unfilled buffer would give a scale of zero.

## 2. Connect the resource

After creating the pipeline, create a bind group with `device.createBindGroup`. Use this descriptor structure, filling in your buffer:

```js
{
  layout: renderPipeline.getBindGroupLayout(0),
  entries: [
    { binding: 0, resource: { buffer: /* your uniform buffer */ } },
  ],
}
```

The pipeline still uses `layout: "auto"`. Its inferred layout includes the uniforms actually used by the shader. Create this group against the updated pipeline after completing the shader changes below. If you rebuild the pipeline, rebuild its bind group too.

In the pass, select the pipeline, then call `pass.setBindGroup(0, yourBindGroup)` before the indexed draw. Keep the vertex and index buffer bindings.

## 3. Transform the position

Inside `vertexMain`, calculate a new `vec2f` using the incoming `point`, `transform.scale`, and `transform.offset`. Construct `output.position` from that new x and y with z = 0 and w = 1. Color continues through the same path.

Change the JavaScript data to offset `(0.25, 0)` and scale `(0.5, 0.5)`. Save and reload. Predict the change first: half-size, moved right. The buffer upload must run with the changed data before the draw is submitted.

The uniform structure has its own memory layout rules. This particular pair of `vec2f` values fits 16 bytes; do not assume that every future struct is tightly packed like a vertex buffer. We will give explicit offsets as layouts change.

## Check and troubleshoot

Try scaling only x, then moving only y. The picture should change without edits to positions in `vertexData`. If it vanishes, check for zero scale, an offset outside the canvas, a missing bind group, or an unfilled buffer. Inspect browser validation errors.

Explain: what is shared across the draw? What connects binding 0 to the actual buffer? Why apply scale before the movement offset?

References: [Uniforms](https://webgpufundamentals.org/webgpu/lessons/webgpu-uniforms.html), [createBindGroup](https://developer.mozilla.org/en-US/docs/Web/API/GPUDevice/createBindGroup).

Next: [07: Animation](07-animation.md).
