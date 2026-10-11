# Lesson 12: Put an image on the cube

Prerequisite: [11: Lighting](11-lighting.md). Goal: draw a checker image on each face and light it.

## From corner coordinates to image colors

Texture coordinates, usually called **UVs**, describe where to read an image. In this exercise u = 0 is left and u = 1 is right; v = 0 is the top row and v = 1 is bottom. A **sampler** chooses how to read colors between texels and beyond the image edges. A texel is a pixel of a texture.

The cube's existing UVs span each face. Add input location 3 with `float32x2` at byte offset 40; stride remains 48. Pass a `vec2f` UV through output location 2 to fragment input location 2. The GPU interpolates UVs across the face, just as it interpolated colors.

## 1. Supply an image without download setup

Import this small pixel fixture:

```js
import { checkerImage } from '../lessons/support/checker.js';
```

It contains a 4-by-4 RGBA image as bytes, with 0 through 255 per channel. This is real image data even though it is constructed in JavaScript instead of decoded from a PNG.

Create a texture with `size: [checkerImage.width, checkerImage.height]`, `format: "rgba8unorm"`, and usage `GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST`.

Upload using `device.queue.writeTexture` with these arguments:

```js
{ texture: yourTexture },
checkerImage.pixels,
{ bytesPerRow: checkerImage.width * 4 },
[checkerImage.width, checkerImage.height]
```

Create a sampler with `magFilter: "nearest"` and `minFilter: "nearest"` initially. This makes individual texels easy to see. For this `writeTexture` upload, a 16-byte row is valid; the 256-byte row constraint associated with encoder buffer-to-texture copies is not required here.

## 2. Bind texture and sampler

Add these declarations alongside the scene uniform:

```wgsl
@group(0) @binding(1) var imageSampler: sampler;
@group(0) @binding(2) var imageTexture: texture_2d<f32>;
```

Keep scene uniform binding 0. Recreate the pipeline and its bind group after editing the shader. The group's `entries` now include binding 1 with `resource: yourSampler`, and binding 2 with `resource: yourTexture.createView()`. A texture resource uses a view, whereas a buffer uses `{ buffer: ... }`.

## 3. Sample and light

In the fragment shader call `textureSample(imageTexture, imageSampler, uv)`. This returns a `vec4f` color. Start by returning it directly to confirm UVs work. Then multiply its RGB by the brightness from lesson 11, preserving alpha. Use the texture color instead of the cube's face color initially so tint does not obscure the pattern.

## Check and experiment

The checker should follow the cube faces as the camera moves. Switch both filters to `"linear"` and compare the softened edges. To repeat the pattern, set `addressModeU` and `addressModeV` to `"repeat"` and multiply the sampled UV by 4. Keep lighting and camera code otherwise consistent.

If the cube is black, check the upload, sampler and texture bind entries, and shader binding numbers. If the pattern is stretched unpredictably, check the UV offset and format. Detailed textures viewed far away can shimmer; mipmaps are a later extension, not required for this small nearest-filtered image.

Explain: how do UVs differ from vertex positions? What does a sampler control? Why does the fragment shader receive different UVs across one triangle?

Reference: [writeTexture](https://developer.mozilla.org/en-US/docs/Web/API/GPUQueue/writeTexture), [texture sampling](https://webgpufundamentals.org/webgpu/lessons/webgpu-textures.html).

Next: [13: Generate a grid](13-terrain-grid.md).
