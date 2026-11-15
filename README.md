# WebGPU Experiment

This is a hands-on learning project. Prior experience: some Three.js and React Native Filament; no OpenGL, Vulkan, or shader programming required.

You write the rendering code. The assistant introduces one concept at a time, suggests an exercise, and reviews your attempt. Repetitive data and helper fixtures are supplied. Ask for hints or a worked example whenever useful.

The course contains **21 lessons**: 01-19, plus 05b and 15b. All lesson guides are available now. Work through them in order; the playground reflects your current exercise, not a finished implementation of the whole course.

## Run the playground

Use Node.js 22.12+; Node 24 also works.

```sh
npm install
npm run dev
```

Open the local URL printed by Vite. Use a current browser with WebGPU support; availability also depends on your OS, GPU, and driver. WebGPU requires a secure context; localhost development is supported. Use the development server instead of opening `index.html` directly.

The canvas currently draws an indexed rectangle with interpolated corner colors over a pink background. It rotates through a 64-byte matrix uniform built with wgpu-matrix. Open the browser console with F12 to see your logs and errors.

Completed through [Lesson 07: Animation](lessons/07-animation.md). In progress: [Lesson 08: Matrices are arrows](lessons/08-matrices.md). Continue editing [src/main.js](src/main.js). Vite reloads the page when you save. `npm run build` checks that the project bundles; it does not validate GPU behavior or WGSL shaders.

Completed lessons: [01: Meet your GPU](lessons/01-meet-your-gpu.md), [02: Clear the canvas](lessons/02-clear-the-canvas.md), [03: Your first triangle](lessons/03-first-triangle.md), [04: Colors between vertices](lessons/04-colors-between-vertices.md), [05: Geometry from JavaScript](lessons/05-vertex-buffers.md), [05b: Index buffers](lessons/05b-index-buffers.md), [06: Uniforms](lessons/06-uniforms.md), and [07: Animation](lessons/07-animation.md).

## Editing shaders

Edit WGSL in [src/shader.wgsl](src/shader.wgsl). [src/main.js](src/main.js) imports it as a string with Vite's `?raw` suffix and passes it to `createShaderModule`. Saving the shader triggers a development reload.

Use the recommended [WGSL Analyzer extension](https://marketplace.visualstudio.com/items?itemName=wgsl-analyzer.wgsl-analyzer) in VS Code for shader completion and diagnostics. JavaScript's WebGPU API types and WGSL language support are separate.

Earlier lessons introduce an inline `shaderCode` string. In the current project, make those WGSL edits in `src/shader.wgsl` instead; JavaScript setup, data uploads, and frame code stay in `src/main.js`.

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
| [05b](lessons/05b-index-buffers.md) | Reuse four corners | Index buffers |
| [06](lessons/06-uniforms.md) | Move and resize the rectangle | Uniform buffers and bind groups |
| [07](lessons/07-animation.md) | Animate it | Frame loop, elapsed time, resource reuse |
| [08](lessons/08-matrices.md) | Scale, rotate, and move with one matrix | Matrices as axes plus origin, radians, transform order; current lesson |
| [09](lessons/09-cube-and-depth.md) | Draw a 3D cube | Perspective and depth testing |
| [10](lessons/10-camera.md) | Explore a scene | View matrix and camera controls |
| [11](lessons/11-lighting.md) | Light the cube | Normals and diffuse light |
| [12](lessons/12-textures.md) | Put an image on it | UVs, samplers, texture uploads |
| [13](lessons/13-terrain-grid.md) | Generate a terrain grid | Procedural indexed geometry |
| [14](lessons/14-terrain-heights.md) | Create hills | Height functions, seeded noise |
| [15](lessons/15-terrain-normals.md) | Light the hills | Slopes and generated normals |
| [15b](lessons/15b-objects-in-the-world.md) | Stand objects on the hills | Per-object uniforms, model matrices, repeatable scattering |
| [16](lessons/16-terrain-chunks.md) | Divide the land | Chunk coordinates and matching edges |
| [17](lessons/17-chunk-streaming.md) | Load around the camera | Generation queues and bounded memory |
| [18](lessons/18-visibility-and-lod.md) | Reduce distant and invisible work | Frustum culling, LOD, skirts |
| [19](lessons/19-explorable-world.md) | Complete an explorable world | Controls, diagnostics, cleanup, review |

Each step should produce something you can inspect and change. Before running an experiment, predict what will happen; afterward, explain the result in your own words. We can slow down or split a step whenever needed.

## Where this path leads

The lessons build in four stages:

1. **01-08, GPU basics:** buffers, shaders, uniforms, the frame loop, and matrices. Every later lesson uses these.
2. **09-12, 3D essentials:** depth, a camera, light, and textures. Together they do roughly what a Three.js `Mesh` with a `MeshLambertMaterial` does for you.
3. **13-15b, a small world:** procedural terrain, with separate objects standing on it.
4. **16-19, a big world:** chunks, streaming, culling, and level of detail, so the world extends around the camera while memory use stays bounded.

Huge travel distances, caves, advanced physics, and production rendering are beyond this course.

### After lesson 19

Lesson 19 ends with a small explorable world, not an engine. Here are good next steps, roughly in order of payoff for open worlds:

- **Fog and sky:** hide the streaming edge and make distance readable. This is a small fragment-shader change with a large visual effect.
- **Instancing:** draw thousands of trees and rocks per chunk in one draw call, growing directly out of 15b.
- **Shadow maps:** add a second render pass from the light's point of view.
- **Compute shaders:** generate terrain or cull objects on the GPU.
- **Models and materials:** load glTF files instead of supplied cubes.
- **Floating origin:** keep precision when travelling far from `(0, 0, 0)`.

A game engine grows out of a working game, not ahead of one. Once a few of these features work, the code you keep repeating becomes the engine: meshes, materials, transforms with parents and children, and a fixed-timestep update loop. You will understand each piece because you wrote it first.

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
