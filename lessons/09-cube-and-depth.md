# Lesson 09: A cube, perspective, and depth

Prerequisite: [08: Matrices](08-matrices.md). Goal: draw a rotating cube whose nearer faces hide farther ones.

## Supplied geometry

Import the repetitive cube data from `src/main.js`:

```js
import { createCubeData } from '../lessons/support/cube.js';
const { vertices: vertexData, indices: indexData } = createCubeData();
```

Replace the rectangle arrays with these. The helper supplies 24 vertices and 36 `Uint16` indices. A geometric cube has eight corners, but its faces need separate normals and texture coordinates, so this data uses four vertices per face.

Each vertex now has **12 floats / 48 bytes**:

| Field | Components | Byte offset | Shader input location |
| --- | --- | --- | --- |
| Position | 3 | 0 | 0 |
| Color | 4 | 12 | 1 |
| Normal (lesson 11) | 3 | 28 | Not read yet |
| Texture coordinates (lesson 12) | 2 | 40 | Not read yet |

Update the vertex layout to stride 48, position `float32x3`, and color `float32x4` at offset 12. Keep only these two attributes active for now. Change `point` to `vec3f` in WGSL, and form its position with `vec4f(point, 1.0)`. Draw `indexData.length` indices.

## Make perspective

The cube data is centered at the origin with corners at -1 and +1. These are now object coordinates rather than final screen positions.

Use the following starting values:

```js
const fov = 60 * Math.PI / 180;
const near = 0.1;
const far = 100;
const projection = mat4.perspective(fov, canvas.width / canvas.height, near, far);
```

For this lesson, place the cube in front of the origin with a translation to `(0, 0, -5)`. This camera convention looks down negative Z. Combine a Y rotation and a small X rotation for the model. Upload `projection * translation * rotation` to the existing matrix uniform.

Perspective makes distant objects appear smaller by producing an appropriate w and letting the GPU divide the position by it. Do not force w back to 1 after matrix multiplication. WebGPU depth after that division uses 0 through 1; the selected math library supplies that convention.

## Resolve which surface is in front

A **depth texture** stores depth values for visibility testing. Create one with size `[canvas.width, canvas.height]`, format `"depth24plus"`, and usage `GPUTextureUsage.RENDER_ATTACHMENT`.

Add this to the pipeline descriptor:

```js
depthStencil: {
  format: 'depth24plus',
  depthWriteEnabled: true,
  depthCompare: 'less',
},
```

Add `depthStencilAttachment` to each render-pass descriptor with `view` from that depth texture, `depthClearValue: 1`, `depthLoadOp: "clear"`, and `depthStoreOp: "store"`. A fragment passes when its depth is less than the stored value. Clearing to the farthest depth lets visible geometry start filling it.

Reuse this depth texture across frames. If you change canvas pixel dimensions, destroy it and create one matching the new dimensions before the next pass. Keep culling disabled initially so missing faces do not obscure learning depth testing.

## Check and troubleshoot

The rotating cube should have stable visible faces without back faces painting over front faces. Move it to z = -8 and see it shrink. Temporarily remove both the pipeline depth state and the pass depth attachment to compare incorrect overlap, then restore both.

If it vanishes, check the negative-Z placement, positive near distance, updated stride and offsets, and index count 36. A depth attachment and pipeline depth format must agree.

Explain: why does distance affect apparent size? What is stored in the depth texture? Why can't drawing order alone reliably solve visibility for a rotating cube?

References: [Perspective](https://webgpufundamentals.org/webgpu/lessons/webgpu-perspective-projection.html), [render pipeline depth state](https://developer.mozilla.org/en-US/docs/Web/API/GPUDevice/createRenderPipeline).

Next: [10: Camera movement](10-camera.md).
