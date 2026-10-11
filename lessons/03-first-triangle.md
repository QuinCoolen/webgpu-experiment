# Exercise 03: Your first triangle

Goal: draw a solid-colored triangle over your pink background. Your existing clear pass is the foundation.

This lesson introduces a new language, so take it in parts. It is fine to ask for a review of just your shaders before continuing.

## What happens when we draw?

A **vertex** is a point; our triangle has three vertices. A **vertex shader** computes their positions. The GPU determines which parts of the image the triangle covers, a process called **rasterization**. A **fragment shader** computes the color for those covered parts. For this first example, think of a fragment as a candidate contribution to a pixel.

In Three.js, geometry and materials help organize this work. Here you will provide the shader functions yourself, using **WGSL**, the WebGPU Shading Language.

Reference: [WebGPU Fundamentals](https://webgpufundamentals.org/webgpu/lessons/webgpu-fundamentals.html). It includes a full solution; try the tasks below first if you want to work it out yourself.

## Part 1: Write the two shaders

After configuring the canvas, but before creating your command encoder, create a JavaScript template string named `shaderCode`. Put your WGSL inside its backticks. The string is data passed to WebGPU; JavaScript does not execute the WGSL.

Use this structure as a starting point and fill in the function bodies:

```wgsl
@vertex
fn vertexMain(@builtin(vertex_index) index: u32) -> @builtin(position) vec4f {
  // TODO: define three positions and return the one selected by index.
}

@fragment
fn fragmentMain() -> @location(0) vec4f {
  // TODO: return a color with four components: red, green, blue, alpha.
}
```

These bodies are intentionally unfinished. Here is the vocabulary you need:

| Syntax | Meaning |
| --- | --- |
| `fn` | Define a function |
| `index: u32` | A parameter containing an unsigned 32-bit integer |
| `-> vec4f` | Return a vector containing four floating-point numbers |
| `vec2f(x, y)` | Construct a two-component vector |
| `vec4f(x, y, z, w)` | Construct a four-component vector |
| `let name = value;` | Define a local value that cannot be reassigned |
| `array(valueA, valueB, valueC)` | Construct an array; access an element with `[index]` |
| `@vertex` / `@fragment` | Identify the shader's stage |
| `@builtin(vertex_index)` | Ask the GPU to supply the vertex index |
| `@builtin(position)` | Identify the returned value as the vertex's position |
| `@location(0)` | Send this fragment output to color target zero |

Choose these three positions: top `(0.0, 0.6)`, bottom left `(-0.6, -0.6)`, bottom right `(0.6, -0.6)`. Store them as an array of `vec2f` values inside `vertexMain`. Select the position using `index`, then return its x and y with `z = 0.0` and `w = 1.0`. You can access vector components with `.x` and `.y`.

The output uses **clip coordinates**. With `w = 1`, x runs from -1 at the left edge to +1 at the right, and y runs from -1 at the bottom to +1 at the top. The center is `(0, 0)`. Keep z and w at the specified values for now; we will explain their role when we reach 3D and perspective.

In `fragmentMain`, return a `vec4f` containing a color you choose, with alpha 1. Pick a color that contrasts with pink. This function can return the same color every time it runs.

## Part 2: Create a module and pipeline

Create a **shader module** with `device.createShaderModule(...)`, passing an object whose `code` is your `shaderCode` string. The module holds your shader code.

A **render pipeline** combines the shader entry points and the settings for drawing. Create one with `device.createRenderPipeline(...)`. Assemble its descriptor from these fields:

| Field | Value |
| --- | --- |
| `layout` | `"auto"`; let WebGPU infer resource bindings, of which we have none yet |
| `vertex.module` | Your shader module |
| `vertex.entryPoint` | `"vertexMain"` |
| `fragment.module` | The same shader module |
| `fragment.entryPoint` | `"fragmentMain"` |
| `fragment.targets` | An array with one object containing your canvas `format` |
| `primitive.topology` | `"triangle-list"`; each group of three vertices forms a triangle |

The dots in this table describe nested JavaScript objects. For example, `vertex.module` means a `module` property inside the `vertex` object. The entry-point strings must match your WGSL function names.

Create both resources before the command encoder. The pipeline's target format describes the kind of color output; the render pass's attachment view selects the actual texture to receive it.

References: [Shader modules](https://developer.mozilla.org/en-US/docs/Web/API/GPUDevice/createShaderModule) and [render pipelines](https://developer.mozilla.org/en-US/docs/Web/API/GPUDevice/createRenderPipeline).

## Part 3: Record the draw

Inside your existing pass, between `beginRenderPass(...)` and `pass.end()`:

1. Select your pipeline with `pass.setPipeline(...)`.
2. Call `pass.draw(...)` with a vertex count of **3**.

For this draw, the vertex shader receives indices 0, 1, and 2. The fragment shader colors the triangle's covered area. Three is the number of vertices, not the number of pixels.

Keep your existing clear, store, finish, and submit operations. The pass will clear to pink, then draw your triangle on top. Update the status message to describe submitting the triangle commands.

## Check your result

You should see one solid triangle surrounded by pink, with no validation errors in the browser console. JavaScript type checking and the Vite build do not check WGSL; inspect the browser's shader error messages if something fails.

Try changing only the fragment shader's color, then only the top vertex's x coordinate. Predict each result first. Save and reload to run the updated shaders.

Before moving on:

- What does each shader return, and what uses that value?
- Who figures out which pixels the triangle covers?
- Why does `draw(3)` produce more than three colored pixels?
- How do the pipeline and render pass work together?
