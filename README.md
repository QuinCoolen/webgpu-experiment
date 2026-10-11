# WebGPU Experiment

This is a hands-on learning project. Prior experience: some Three.js and React Native Filament; no OpenGL, Vulkan, or shader programming required.

You write the rendering code. The assistant introduces one concept at a time, suggests an exercise, and reviews your attempt. Repetitive data and helper fixtures are supplied. Ask for hints or a worked example whenever useful.

The course contains **20 lessons**: 01-19, with 05b as an additional lesson. All lesson guides are available now. Work through them in order; the playground reflects your current exercise, not a finished implementation of the whole course.

## Run the playground

Use Node.js 22.12+; Node 24 also works.

```sh
npm install
npm run dev
```

Open the local URL printed by Vite. Use a current browser with WebGPU support; availability also depends on your OS, GPU, and driver. WebGPU requires a secure context; localhost development is supported. Use the development server instead of opening `index.html` directly.

The canvas currently draws your rectangle with interpolated corner colors over a pink background. Open the browser console with F12 to see your logs and errors.

Current exercise: [Exercise 05b: Reuse vertices with an index buffer](lessons/05b-index-buffers.md). Exercises 01 through 05 have been completed and reviewed in code. Continue editing [src/main.js](src/main.js). Vite reloads the page when you save. `npm run build` checks that the project bundles; it does not validate GPU behavior or WGSL shaders.

Previous lessons: [Exercise 01: Meet your GPU](lessons/01-meet-your-gpu.md), [Exercise 02: Clear the canvas](lessons/02-clear-the-canvas.md), [Exercise 03: Your first triangle](lessons/03-first-triangle.md), [Exercise 04: Colors between vertices](lessons/04-colors-between-vertices.md), and [Exercise 05: Geometry from JavaScript](lessons/05-vertex-buffers.md).

## What we're learning

Three.js and Filament manage many rendering details for you. Here we will build up those details ourselves: how to provide geometry, position it, and calculate its appearance.

A shader is a program that runs on the GPU. We'll write shaders using WGSL (WebGPU Shading Language) when we reach our first triangle. JavaScript will prepare resources and submit work to the GPU.

| Step | Experiment | Main idea |
| --- | --- | --- |
| [01](lessons/01-meet-your-gpu.md) | Request a GPU device | Browser access, adapter, device |
| [02](lessons/02-clear-the-canvas.md) | Fill the canvas with a color | Textures, passes, command submission |
| [03](lessons/03-first-triangle.md) | Draw a triangle and rectangle | WGSL shaders, render pipelines |
| [04](lessons/04-colors-between-vertices.md) | Color the corners | Interpolation and shader locations |
| [05](lessons/05-vertex-buffers.md) | Supply geometry from JavaScript | Vertex buffers, byte offsets, stride |
| [05b](lessons/05b-index-buffers.md) | Reuse four corners | Index buffers; current exercise |
| [06](lessons/06-uniforms.md) | Move and resize the rectangle | Uniform buffers and bind groups |
| [07](lessons/07-animation.md) | Animate it | Frame loop, elapsed time, resource reuse |
| [08](lessons/08-matrices.md) | Rotate and combine transforms | Vectors, radians, matrices |
| [09](lessons/09-cube-and-depth.md) | Draw a 3D cube | Perspective and depth testing |
| [10](lessons/10-camera.md) | Explore a scene | View matrix and camera controls |
| [11](lessons/11-lighting.md) | Light the cube | Normals and diffuse light |
| [12](lessons/12-textures.md) | Put an image on it | UVs, samplers, texture uploads |
| [13](lessons/13-terrain-grid.md) | Generate a terrain grid | Procedural indexed geometry |
| [14](lessons/14-terrain-heights.md) | Create hills | Height functions, seeded noise |
| [15](lessons/15-terrain-normals.md) | Light the hills | Slopes and generated normals |
| [16](lessons/16-terrain-chunks.md) | Divide the land | Chunk coordinates and matching edges |
| [17](lessons/17-chunk-streaming.md) | Load around the camera | Generation queues and bounded memory |
| [18](lessons/18-visibility-and-lod.md) | Reduce distant and invisible work | Frustum culling, LOD, skirts |
| [19](lessons/19-explorable-world.md) | Complete an explorable world | Controls, diagnostics, cleanup, review |

Each step should produce something you can inspect and change. Before running an experiment, predict what will happen; afterward, explain the result in your own words. We can slow down or split a step whenever needed.

The first landscape appears in lessons 13-14. Later lessons expand it into a world generated around the camera. Huge travel distances, caves, advanced physics, and production rendering are future extensions.

## Supplied resources and checks

[Lesson resources](lessons/support/README.md) include cube geometry, a checker image, deterministic noise, and frustum math. They are imported only when you reach the relevant exercise. Lesson 08 introduces `wgpu-matrix@3.4.2` with installation instructions.

```sh
npm run check:lessons
npm run build
```

The lesson check verifies local links and numerical properties of the supplied resources. The build verifies bundling. Neither proves that a future exercise renders correctly: use its browser checks and expected results as you implement it.

## References

- [WebGPU Fundamentals](https://webgpufundamentals.org/) — explanations and examples to accompany our exercises. Its opening tutorial goes further than our first exercise; there is no need to read it all now.
- [MDN WebGPU API](https://developer.mozilla.org/en-US/docs/Web/API/WebGPU_API) — reference for individual API calls and browser requirements.

Keep the setup small: plain JavaScript and Vite initially. Add tools or abstractions when an exercise creates a reason for them.
